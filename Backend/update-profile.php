<?php
// ============================================
// update-profile.php
//
// Updates user profile data (name and phone).
// Email cannot be changed.
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST allowed.']);
    exit();
}

// ── Connect to database on PORT 3307 ──
$conn = mysqli_connect('127.0.0.1:3307', 'root', '', 'shopnow_db');
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'DB Error: ' . mysqli_connect_error()]);
    exit();
}
mysqli_set_charset($conn, 'utf8');


// ── Read JSON data from frontend ──
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid data.']);
    exit();
}


// ── Get values from data ──
$userId = isset($data['id']) ? intval($data['id']) : 0;
$name = isset($data['name']) ? trim($data['name']) : '';
$phone = isset($data['phone']) ? trim($data['phone']) : '';

// ── Validate ──
if ($userId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid user ID.']);
    exit();
}

if (empty($name)) {
    echo json_encode(['success' => false, 'message' => 'Name is required.']);
    exit();
}

// Optional: validate phone format
// For now we'll accept any phone or empty


// ── Update database ──
// We only update name and phone
// Email cannot be changed (for security)
$stmt = mysqli_prepare($conn,
    "UPDATE users SET name = ?, phone = ? WHERE id = ?"
);

mysqli_stmt_bind_param($stmt, "ssi", $name, $phone, $userId);
$result = mysqli_stmt_execute($stmt);

mysqli_stmt_close($stmt);


// ── Send response ──
if ($result) {
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully!'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update: ' . mysqli_error($conn)
    ]);
}

mysqli_close($conn);
?>
