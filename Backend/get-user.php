<?php
// ============================================
// get-user.php
//
// Fetches user profile data by user ID.
// Used by profile page to load account info.
//
// BEGINNER-FRIENDLY WITH COMMENTS
// ============================================

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── Connect to database on PORT 3307 ──
$conn = mysqli_connect('127.0.0.1:3307', 'root', '', 'shopnow_db');
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'DB Error: ' . mysqli_connect_error()]);
    exit();
}
mysqli_set_charset($conn, 'utf8');


// ── Get user ID from URL parameter ──
// URL looks like: get-user.php?id=5
$userId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($userId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid user ID.']);
    exit();
}


// ── Fetch user from database ──
// We select everything EXCEPT password (never send password to frontend)
$stmt = mysqli_prepare($conn,
    "SELECT id, name, email, phone, created_at FROM users WHERE id = ?"
);

mysqli_stmt_bind_param($stmt, "i", $userId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);

mysqli_stmt_close($stmt);

// ── Send response ──
if ($user) {
    echo json_encode([
        'success' => true,
        'user'    => $user
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'User not found.'
    ]);
}

mysqli_close($conn);
?>
