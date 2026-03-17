<?php

// Centralized Security Middleware (Clerk auth + session)
require_once __DIR__ . '/../../core/middleware/auth.php';

// Auth check (session is now populated by middleware)
if (!isset($_SESSION['user_id'])) {
    header('Location: /login/');
    exit;
}

// Clean URL logic
if (strpos($_SERVER['REQUEST_URI'], 'index.php') !== false && empty($_GET)) {
    header("Location: /conta/zuck-coworking/");
    exit();
}

$userId = $_SESSION['user_id'];
$userName = $_SESSION['name'] ?? $_SESSION['username'] ?? 'Usuario';
$userRole = strtoupper($_SESSION['role'] ?? 'user');
$current_page = 'zuck-coworking';

// Theme detection
$saved_theme = 'dark'; // Co-working always uses dark theme
$theme_class = 'dark';

// === Build asset filenames ===
$buildDir = __DIR__ . '/assets/build_v1/';
$_buildIndexJs = '';
$_buildReactVendor = '';
$_buildPhaserVendor = '';
$_buildIndexCss = '';

if (is_dir($buildDir)) {
    $_matches = glob($buildDir . 'index-cowork-v1-*.js');
    if (!empty($_matches)) $_buildIndexJs = basename($_matches[0]);
    $_matches = glob($buildDir . 'react-vendor-cowork-v1-*.js');
    if (!empty($_matches)) $_buildReactVendor = basename($_matches[0]);
    $_matches = glob($buildDir . 'phaser-vendor-cowork-v1-*.js');
    if (!empty($_matches)) $_buildPhaserVendor = basename($_matches[0]);
    $_matches = glob($buildDir . 'index-cowork-v1-*.css');
    if (!empty($_matches)) $_buildIndexCss = basename($_matches[0]);
}
?>
<!DOCTYPE html>
<html lang="pt-br" class="dark" data-theme="dark">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZuckPay - Escritorio Virtual</title>

    <style>
        html, body { margin: 0; padding: 0; overflow: hidden; height: 100%; background: #0a0e17; }
        #root { width: 100%; height: 100%; }
        .loading-screen {
            display: flex; align-items: center; justify-content: center;
            width: 100%; height: 100%; background: #0a0e17; color: #3498db;
            font-family: Inter, sans-serif; font-size: 16px;
        }
        .loading-screen .spinner {
            width: 32px; height: 32px; border: 3px solid #1f2937;
            border-top-color: #3498db; border-radius: 50%;
            animation: spin 0.8s linear infinite; margin-right: 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" href="/images/zucklogotop.png" type="image/png">

    <?php if ($_buildIndexCss): ?>
        <link rel="stylesheet" crossorigin href="/conta/zuck-coworking/assets/build_v1/<?php echo $_buildIndexCss; ?>">
    <?php endif; ?>

    <script>
        window.USER_ID = "<?php echo htmlspecialchars($userId, ENT_QUOTES, 'UTF-8'); ?>";
        window.USER_NAME = "<?php echo htmlspecialchars($userName, ENT_QUOTES, 'UTF-8'); ?>";
        window.USER_ROLE = "<?php echo htmlspecialchars($userRole, ENT_QUOTES, 'UTF-8'); ?>";
        window.SPACE_ID = 1;
    </script>
</head>

<body>
    <div id="root">
        <div class="loading-screen">
            <div class="spinner"></div>
            Carregando escritorio virtual...
        </div>
    </div>

    <?php if ($_buildReactVendor): ?>
        <script type="module" crossorigin src="/conta/zuck-coworking/assets/build_v1/<?php echo $_buildReactVendor; ?>"></script>
    <?php endif; ?>
    <?php if ($_buildPhaserVendor): ?>
        <script type="module" crossorigin src="/conta/zuck-coworking/assets/build_v1/<?php echo $_buildPhaserVendor; ?>"></script>
    <?php endif; ?>
    <?php if ($_buildIndexJs): ?>
        <script type="module" crossorigin src="/conta/zuck-coworking/assets/build_v1/<?php echo $_buildIndexJs; ?>"></script>
    <?php endif; ?>

    <?php if (!$_buildIndexJs): ?>
        <!-- Dev mode fallback -->
        <script>
            document.querySelector('.loading-screen').innerHTML = `
                <div style="text-align:center; color: #9ca3af;">
                    <p style="font-size:18px; color:#3498db; margin-bottom:8px;">ZuckPay Co-Work</p>
                    <p>Build nao encontrado.</p>
                    <p style="font-size:12px; margin-top:8px;">
                        Execute <code style="background:#1f2937;padding:2px 6px;border-radius:4px;">cd conta/zuck-coworking-react && npm install && npm run build</code>
                    </p>
                    <p style="font-size:12px; margin-top:4px;">
                        Ou para dev: <code style="background:#1f2937;padding:2px 6px;border-radius:4px;">npm run dev</code> na porta 5175
                    </p>
                </div>
            `;
        </script>
    <?php endif; ?>
</body>

</html>
