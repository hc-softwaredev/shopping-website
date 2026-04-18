<?php
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST requests allowed.']);
    exit();
}

$rawData = file_get_contents('php://input');
$data    = json_decode($rawData, true);

$email    = isset($data['email'])    ? trim($data['email'])    : '';
$password = isset($data['password']) ? trim($data['password']) : '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit();
}

$stmt = mysqli_prepare($conn, "SELECT id, name, email, password FROM users WHERE email = ?");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user   = mysqli_fetch_assoc($result);

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    mysqli_stmt_close($stmt);
    exit();
}

if (!password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']);
    mysqli_stmt_close($stmt);
    exit();
}

echo json_encode([
    'success' => true,
    'message' => 'Login successful!',
    'user'    => [
        'id'    => $user['id'],
        'name'  => $user['name'],
        'email' => $user['email']
    ]
]);

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
