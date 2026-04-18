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

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid data received.']);
    exit();
}

$name     = isset($data['name'])     ? trim($data['name'])     : '';
$email    = isset($data['email'])    ? trim($data['email'])    : '';
$phone    = isset($data['phone'])    ? trim($data['phone'])    : '';
$password = isset($data['password']) ? trim($data['password']) : '';

if (empty($name)) {
    echo json_encode(['success' => false, 'message' => 'Name is required.']);
    exit();
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Valid email is required.']);
    exit();
}
if (empty($password) || strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit();
}

$checkStmt = mysqli_prepare($conn, "SELECT id FROM users WHERE email = ?");
mysqli_stmt_bind_param($checkStmt, "s", $email);
mysqli_stmt_execute($checkStmt);
mysqli_stmt_store_result($checkStmt);

if (mysqli_stmt_num_rows($checkStmt) > 0) {
    echo json_encode(['success' => false, 'message' => 'This email is already registered.']);
    mysqli_stmt_close($checkStmt);
    exit();
}
mysqli_stmt_close($checkStmt);

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$insertStmt = mysqli_prepare($conn,
    "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)"
);
mysqli_stmt_bind_param($insertStmt, "ssss", $name, $email, $phone, $hashedPassword);
$result = mysqli_stmt_execute($insertStmt);

if ($result) {
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully! Please login.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Insert failed: ' . mysqli_error($conn)
    ]);
}

mysqli_stmt_close($insertStmt);
mysqli_close($conn);
?>
