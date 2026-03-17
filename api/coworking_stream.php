<?php
/**
 * SSE (Server-Sent Events) endpoint for ZuckPay Co-Working
 * Streams real-time position updates to connected clients
 */
ini_set('display_errors', 0);

// Load environment + DB helper
require_once __DIR__ . '/../libs/updateUserInfo.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Auth check
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: text/event-stream');
    echo "data: " . json_encode(['type' => 'error', 'message' => 'Nao autorizado']) . "\n\n";
    exit;
}

$userId = $_SESSION['user_id'];

// Close session early to avoid blocking other requests
session_write_close();

// SSE headers
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no');

// Disable output buffering
if (function_exists('apache_setenv')) {
    apache_setenv('no-gzip', '1');
}
ini_set('zlib.output_compression', '0');
ini_set('output_buffering', '0');
ini_set('implicit_flush', '1');
while (ob_get_level()) ob_end_flush();

try {
    $pdo = connectDb();
    $pdo->exec("SET time_zone = '-03:00'");
} catch (Exception $e) {
    echo "data: " . json_encode(['type' => 'error', 'message' => 'DB error']) . "\n\n";
    flush();
    exit;
}

$spaceId = intval($_GET['space_id'] ?? 1);
$userId = $_SESSION['user_id'];
$startTime = time();
$maxDuration = 30; // seconds before client reconnects
$pollInterval = 150000; // microseconds (0.15s) — faster for smooth multiplayer movement
$lastStateHash = '';
$eventId = 0;

// Mark stale users offline before starting
$pdo->exec("
    UPDATE coworking_user_positions
    SET is_online = 0
    WHERE is_online = 1 AND last_heartbeat < DATE_SUB(NOW(), INTERVAL 60 SECOND)
");

// Send initial connection event
echo "data: " . json_encode(['type' => 'connected', 'user_id' => $userId]) . "\n\n";
flush();

while (true) {
    // Check if client disconnected
    if (connection_aborted()) break;

    // Check max duration
    if ((time() - $startTime) > $maxDuration) {
        echo "data: " . json_encode(['type' => 'reconnect']) . "\n\n";
        flush();
        break;
    }

    // Query online users
    $stmt = $pdo->prepare("
        SELECT p.user_id, p.x, p.y, p.direction, p.avatar_sprite, p.display_name, p.current_room,
               u.name, u.username,
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

    $players = [];
    foreach ($rows as $row) {
        $players[$row['user_id']] = [
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

    // Check for pending WebRTC signals for this user
    $sigStmt = $pdo->prepare("
        SELECT id, from_user_id, signal_type, payload
        FROM coworking_signals
        WHERE to_user_id = :uid AND delivered = 0
        ORDER BY id ASC LIMIT 20
    ");
    $sigStmt->execute([':uid' => $userId]);
    $signals = $sigStmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($signals)) {
        $sigIds = array_column($signals, 'id');
        $ph = implode(',', array_fill(0, count($sigIds), '?'));
        $pdo->prepare("UPDATE coworking_signals SET delivered = 1 WHERE id IN ($ph)")->execute($sigIds);
    }

    // Check room locks
    $lockStmt = $pdo->prepare("SELECT room_id, locked_by FROM coworking_room_locks WHERE space_id = :sid");
    $lockStmt->execute([':sid' => $spaceId]);
    $lockRows = $lockStmt->fetchAll(PDO::FETCH_ASSOC);
    $roomLocks = [];
    foreach ($lockRows as $lr) {
        $roomLocks[$lr['room_id']] = (int)$lr['locked_by'];
    }

    // Only send update if state changed OR there are signals
    $stateHash = md5(json_encode($players) . json_encode($roomLocks));
    if ($stateHash !== $lastStateHash || !empty($signals)) {
        $lastStateHash = $stateHash;
        $eventId++;

        $data = [
            'type' => 'positions',
            'players' => $players,
            'room_locks' => $roomLocks,
            'timestamp' => time()
        ];
        if (!empty($signals)) {
            $data['signals'] = $signals;
        }

        echo "id: {$eventId}\n";
        echo "data: " . json_encode($data) . "\n\n";
        flush();
    } else {
        // Send heartbeat every 5 seconds to keep connection alive
        if ($eventId > 0 && (time() - $startTime) % 5 === 0) {
            echo ": heartbeat\n\n";
            flush();
        }
    }

    // Sleep 500ms
    usleep($pollInterval);
}
