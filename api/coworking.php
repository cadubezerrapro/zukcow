<?php
ini_set('display_errors', 0);
header('Content-Type: application/json');

// Use centralized DB connection (session already populated by global auth middleware)
require_once __DIR__ . '/../libs/updateUserInfo.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Auth check
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Nao autorizado']);
    exit;
}

try {
    $pdo = connectDb();
    $pdo->exec("SET time_zone = '-03:00'");
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro de conexao com banco']);
    exit;
}

$userId = $_SESSION['user_id'];
$userName = $_SESSION['name'] ?? $_SESSION['username'] ?? 'Usuario';
$action = $_GET['action'] ?? '';

// Ensure tables exist (safe - uses CREATE TABLE IF NOT EXISTS)
ensureCoworkingTables($pdo);

switch ($action) {
    case 'join':
        handleJoin($pdo, $userId, $userName);
        break;
    case 'leave':
        handleLeave($pdo, $userId);
        break;
    case 'update_position':
        handleUpdatePosition($pdo, $userId);
        break;
    case 'get_users':
        handleGetUsers($pdo);
        break;
    case 'heartbeat':
        handleHeartbeat($pdo, $userId);
        break;
    case 'get_space':
        handleGetSpace($pdo);
        break;
    case 'set_display_name':
        handleSetDisplayName($pdo, $userId);
        break;
    case 'send_signal':
        handleSendSignal($pdo, $userId);
        break;
    case 'get_signals':
        handleGetSignals($pdo, $userId);
        break;
    case 'lock_room':
        handleLockRoom($pdo, $userId);
        break;
    case 'unlock_room':
        handleUnlockRoom($pdo, $userId);
        break;
    case 'get_room_locks':
        handleGetRoomLocks($pdo);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acao invalida']);
}

// --- Handlers ---

function handleJoin($pdo, $userId, $userName) {
    $spaceId = intval($_POST['space_id'] ?? 1);

    // Upsert position record
    $stmt = $pdo->prepare("
        INSERT INTO coworking_user_positions (user_id, space_id, x, y, direction, is_online, last_heartbeat)
        VALUES (:uid, :sid, 608, 480, 'down', 1, NOW())
        ON DUPLICATE KEY UPDATE is_online = 1, last_heartbeat = NOW()
    ");
    $stmt->execute([':uid' => $userId, ':sid' => $spaceId]);

    // Get all online users
    $users = getOnlineUsers($pdo, $spaceId);

    echo json_encode([
        'success' => true,
        'message' => 'Conectado ao escritorio',
        'data' => [
            'space_id' => $spaceId,
            'users' => $users,
            'your_position' => getUserPosition($pdo, $userId, $spaceId)
        ]
    ]);
}

function handleLeave($pdo, $userId) {
    $stmt = $pdo->prepare("
        UPDATE coworking_user_positions SET is_online = 0 WHERE user_id = :uid
    ");
    $stmt->execute([':uid' => $userId]);

    echo json_encode(['success' => true, 'message' => 'Desconectado']);
}

function handleUpdatePosition($pdo, $userId) {
    $x = intval($_POST['x'] ?? 0);
    $y = intval($_POST['y'] ?? 0);
    $direction = $_POST['direction'] ?? 'down';
    $currentRoom = $_POST['current_room'] ?? null;

    // Validate direction
    $validDirs = ['up', 'down', 'left', 'right'];
    if (!in_array($direction, $validDirs)) $direction = 'down';

    // Clamp position to reasonable bounds (80×56 tiles × 64px = 5120×3584)
    $x = max(0, min(5120, $x));
    $y = max(0, min(3584, $y));

    // Validate room
    if ($currentRoom !== null) {
        $currentRoom = substr(preg_replace('/[^a-z0-9_]/', '', $currentRoom), 0, 50);
        if (empty($currentRoom)) $currentRoom = null;
    }

    $stmt = $pdo->prepare("
        UPDATE coworking_user_positions
        SET x = :x, y = :y, direction = :dir, current_room = :room, last_heartbeat = NOW()
        WHERE user_id = :uid AND is_online = 1
    ");
    $stmt->execute([':x' => $x, ':y' => $y, ':dir' => $direction, ':room' => $currentRoom, ':uid' => $userId]);

    echo json_encode(['success' => true]);
}

function handleGetUsers($pdo) {
    $spaceId = intval($_GET['space_id'] ?? 1);

    // Mark stale users as offline (no heartbeat for 60s)
    $pdo->exec("
        UPDATE coworking_user_positions
        SET is_online = 0
        WHERE is_online = 1 AND last_heartbeat < DATE_SUB(NOW(), INTERVAL 60 SECOND)
    ");

    $users = getOnlineUsers($pdo, $spaceId);
    echo json_encode(['success' => true, 'data' => $users]);
}

function handleHeartbeat($pdo, $userId) {
    $stmt = $pdo->prepare("
        UPDATE coworking_user_positions SET last_heartbeat = NOW() WHERE user_id = :uid AND is_online = 1
    ");
    $stmt->execute([':uid' => $userId]);

    echo json_encode(['success' => true]);
}

function handleSetDisplayName($pdo, $userId) {
    $name = trim($_POST['display_name'] ?? '');
    if (empty($name) || mb_strlen($name) > 30) {
        echo json_encode(['success' => false, 'message' => 'Nome invalido']);
        return;
    }

    // Ensure column exists
    try {
        $pdo->exec("ALTER TABLE coworking_user_positions ADD COLUMN display_name VARCHAR(60) DEFAULT NULL");
    } catch (PDOException $e) {
        // Column already exists, ignore
    }

    $stmt = $pdo->prepare("UPDATE coworking_user_positions SET display_name = :name WHERE user_id = :uid");
    $stmt->execute([':name' => $name, ':uid' => $userId]);

    echo json_encode(['success' => true, 'message' => 'Nome atualizado']);
}

function handleGetSpace($pdo) {
    $spaceId = intval($_GET['space_id'] ?? 1);

    $stmt = $pdo->prepare("SELECT * FROM coworking_spaces WHERE id = :sid AND active = 1");
    $stmt->execute([':sid' => $spaceId]);
    $space = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$space) {
        echo json_encode(['success' => false, 'message' => 'Espaco nao encontrado']);
        return;
    }

    echo json_encode(['success' => true, 'data' => $space]);
}

// --- Helpers ---

function getOnlineUsers($pdo, $spaceId) {
    $stmt = $pdo->prepare("
        SELECT p.user_id, p.x, p.y, p.direction, p.avatar_sprite, p.display_name, p.current_room,
               u.name, u.username, u.email,
               COALESCE(s.status, 'available') as status,
               s.custom_message
        FROM coworking_user_positions p
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN coworking_user_status s ON s.user_id = p.user_id
        WHERE p.space_id = :sid AND p.is_online = 1
          AND p.last_heartbeat > DATE_SUB(NOW(), INTERVAL 60 SECOND)
    ");
    $stmt->execute([':sid' => $spaceId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $users = [];
    foreach ($rows as $row) {
        $users[$row['user_id']] = [
            'x' => (int)$row['x'],
            'y' => (int)$row['y'],
            'direction' => $row['direction'],
            'name' => $row['display_name'] ?: $row['name'] ?: $row['username'] ?: 'Usuario',
            'avatar_sprite' => $row['avatar_sprite'],
            'status' => $row['status'],
            'custom_message' => $row['custom_message'],
            'current_room' => $row['current_room']
        ];
    }

    return $users;
}

function getUserPosition($pdo, $userId, $spaceId) {
    $stmt = $pdo->prepare("
        SELECT x, y, direction FROM coworking_user_positions
        WHERE user_id = :uid AND space_id = :sid
    ");
    $stmt->execute([':uid' => $userId, ':sid' => $spaceId]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: ['x' => 608, 'y' => 480, 'direction' => 'down'];
}

function ensureCoworkingTables($pdo) {
    try {
        $pdo->query("SELECT 1 FROM coworking_spaces LIMIT 1");
    } catch (PDOException $e) {
        // Tables don't exist yet, create them
        $pdo->exec("CREATE TABLE IF NOT EXISTS `coworking_spaces` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL DEFAULT 'Escritorio Principal',
            `layout_key` VARCHAR(50) NOT NULL DEFAULT 'default_office',
            `max_users` INT DEFAULT 50,
            `active` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $pdo->exec("INSERT IGNORE INTO coworking_spaces (id, name, layout_key) VALUES (1, 'Escritorio Principal', 'default_office')");

        $pdo->exec("CREATE TABLE IF NOT EXISTS `coworking_user_positions` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT NOT NULL,
            `space_id` INT NOT NULL DEFAULT 1,
            `x` INT NOT NULL DEFAULT 608,
            `y` INT NOT NULL DEFAULT 480,
            `direction` VARCHAR(10) DEFAULT 'down',
            `avatar_sprite` VARCHAR(50) DEFAULT 'default',
            `is_online` TINYINT(1) DEFAULT 0,
            `last_heartbeat` TIMESTAMP NULL,
            `display_name` VARCHAR(60) DEFAULT NULL,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY `uq_user_space` (`user_id`, `space_id`),
            KEY `idx_space_online` (`space_id`, `is_online`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $pdo->exec("CREATE TABLE IF NOT EXISTS `coworking_user_status` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT NOT NULL UNIQUE,
            `status` ENUM('available','busy','dnd','away','offline') DEFAULT 'available',
            `custom_message` VARCHAR(255) DEFAULT NULL,
            `desk_id` INT DEFAULT NULL,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $pdo->exec("CREATE TABLE IF NOT EXISTS `coworking_chat_messages` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `space_id` INT NOT NULL DEFAULT 1,
            `sender_id` INT NOT NULL,
            `message` TEXT NOT NULL,
            `type` ENUM('global','proximity','direct') DEFAULT 'global',
            `target_user_id` INT DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            KEY `idx_space_created` (`space_id`, `created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }

    // Safe migration: ensure display_name column exists (for tables created before v1.5)
    try {
        $pdo->exec("ALTER TABLE coworking_user_positions ADD COLUMN display_name VARCHAR(60) DEFAULT NULL");
    } catch (PDOException $e) {
        // Column already exists, ignore
    }

    // Safe migration: add current_room column
    try {
        $pdo->exec("ALTER TABLE coworking_user_positions ADD COLUMN current_room VARCHAR(50) DEFAULT NULL");
    } catch (PDOException $e) {
        // Column already exists, ignore
    }

    // WebRTC signaling table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `coworking_signals` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `from_user_id` INT NOT NULL,
        `to_user_id` INT NOT NULL,
        `signal_type` VARCHAR(20) NOT NULL,
        `payload` TEXT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `delivered` TINYINT(1) DEFAULT 0,
        KEY `idx_to_user` (`to_user_id`, `delivered`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Room locks table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `coworking_room_locks` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `space_id` INT NOT NULL DEFAULT 1,
        `room_id` VARCHAR(50) NOT NULL,
        `locked_by` INT NOT NULL,
        `locked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY `uq_space_room` (`space_id`, `room_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
}

// --- WebRTC Signaling ---

function handleSendSignal($pdo, $userId) {
    $toUserId = intval($_POST['to_user_id'] ?? 0);
    $signalType = $_POST['signal_type'] ?? '';
    $payload = $_POST['payload'] ?? '';

    if (!$toUserId || !$signalType || !$payload) {
        echo json_encode(['success' => false, 'message' => 'Parametros invalidos']);
        return;
    }

    $validTypes = ['offer', 'answer', 'ice_candidate'];
    if (!in_array($signalType, $validTypes)) {
        echo json_encode(['success' => false, 'message' => 'Tipo de sinal invalido']);
        return;
    }

    $stmt = $pdo->prepare("
        INSERT INTO coworking_signals (from_user_id, to_user_id, signal_type, payload)
        VALUES (:from, :to, :type, :payload)
    ");
    $stmt->execute([
        ':from' => $userId,
        ':to' => $toUserId,
        ':type' => $signalType,
        ':payload' => $payload
    ]);

    echo json_encode(['success' => true]);
}

function handleGetSignals($pdo, $userId) {
    // Get pending signals for this user
    $stmt = $pdo->prepare("
        SELECT id, from_user_id, signal_type, payload
        FROM coworking_signals
        WHERE to_user_id = :uid AND delivered = 0
        ORDER BY id ASC
        LIMIT 50
    ");
    $stmt->execute([':uid' => $userId]);
    $signals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($signals)) {
        // Mark as delivered
        $ids = array_column($signals, 'id');
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $pdo->prepare("UPDATE coworking_signals SET delivered = 1 WHERE id IN ($placeholders)")->execute($ids);
    }

    // Cleanup old signals (older than 30 seconds)
    $pdo->exec("DELETE FROM coworking_signals WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 SECOND)");

    echo json_encode(['success' => true, 'signals' => $signals]);
}

// --- Room Locking ---

function handleLockRoom($pdo, $userId) {
    $roomId = $_POST['room_id'] ?? '';
    $spaceId = intval($_POST['space_id'] ?? 1);

    if (!$roomId) {
        echo json_encode(['success' => false, 'message' => 'room_id obrigatorio']);
        return;
    }

    $roomId = substr(preg_replace('/[^a-z0-9_]/', '', $roomId), 0, 50);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO coworking_room_locks (space_id, room_id, locked_by)
            VALUES (:sid, :rid, :uid)
            ON DUPLICATE KEY UPDATE locked_by = :uid2, locked_at = NOW()
        ");
        $stmt->execute([':sid' => $spaceId, ':rid' => $roomId, ':uid' => $userId, ':uid2' => $userId]);
        echo json_encode(['success' => true, 'message' => 'Sala trancada']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao trancar sala']);
    }
}

function handleUnlockRoom($pdo, $userId) {
    $roomId = $_POST['room_id'] ?? '';
    $spaceId = intval($_POST['space_id'] ?? 1);

    if (!$roomId) {
        echo json_encode(['success' => false, 'message' => 'room_id obrigatorio']);
        return;
    }

    $roomId = substr(preg_replace('/[^a-z0-9_]/', '', $roomId), 0, 50);

    $stmt = $pdo->prepare("DELETE FROM coworking_room_locks WHERE space_id = :sid AND room_id = :rid");
    $stmt->execute([':sid' => $spaceId, ':rid' => $roomId]);

    echo json_encode(['success' => true, 'message' => 'Sala destrancada']);
}

function handleGetRoomLocks($pdo) {
    $spaceId = intval($_GET['space_id'] ?? 1);

    $stmt = $pdo->prepare("SELECT room_id, locked_by, locked_at FROM coworking_room_locks WHERE space_id = :sid");
    $stmt->execute([':sid' => $spaceId]);
    $locks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach ($locks as $lock) {
        $result[$lock['room_id']] = [
            'locked_by' => (int)$lock['locked_by'],
            'locked_at' => $lock['locked_at']
        ];
    }

    echo json_encode(['success' => true, 'locks' => $result]);
}
