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

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid data.']);
    exit();
}

$action = isset($data['action']) ? $data['action'] : '';

if ($action === 'add') {

    $name     = isset($data['name'])     ? trim($data['name'])     : '';
    $category = isset($data['category']) ? trim($data['category']) : '';
    $price    = isset($data['price'])    ? floatval($data['price']) : 0;
    $oldPrice = isset($data['old_price']) && $data['old_price'] !== null ? floatval($data['old_price']) : null;
    $emoji    = isset($data['emoji'])    ? trim($data['emoji'])    : '';
    $badge    = isset($data['badge'])    && $data['badge'] !== null ? trim($data['badge']) : null;
    $rating   = isset($data['rating'])   ? floatval($data['rating']) : 4.0;
    $reviews  = isset($data['reviews'])  ? intval($data['reviews'])  : 0;

    if (empty($name) || empty($category) || $price <= 0 || empty($emoji)) {
        echo json_encode(['success' => false, 'message' => 'Name, category, price and emoji are required.']);
        exit();
    }

    $stmt = mysqli_prepare($conn,
        "INSERT INTO products (name, category, price, old_price, emoji, badge, rating, reviews)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );

    mysqli_stmt_bind_param($stmt, "ssddssdi",
        $name, $category, $price, $oldPrice, $emoji, $badge, $rating, $reviews
    );

    $result = mysqli_stmt_execute($stmt);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Product "' . $name . '" added successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add: ' . mysqli_error($conn)]);
    }

    mysqli_stmt_close($stmt);

} elseif ($action === 'edit') {

    $id       = isset($data['id'])       ? intval($data['id'])       : 0;
    $name     = isset($data['name'])     ? trim($data['name'])       : '';
    $category = isset($data['category']) ? trim($data['category'])   : '';
    $price    = isset($data['price'])    ? floatval($data['price'])  : 0;
    $oldPrice = isset($data['old_price']) && $data['old_price'] !== null ? floatval($data['old_price']) : null;
    $emoji    = isset($data['emoji'])    ? trim($data['emoji'])      : '';
    $badge    = isset($data['badge'])    && $data['badge'] !== null ? trim($data['badge']) : null;
    $rating   = isset($data['rating'])   ? floatval($data['rating']) : 4.0;
    $reviews  = isset($data['reviews'])  ? intval($data['reviews'])  : 0;

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid product ID.']);
        exit();
    }
    if (empty($name) || empty($category) || $price <= 0) {
        echo json_encode(['success' => false, 'message' => 'Name, category and price are required.']);
        exit();
    }

    $stmt = mysqli_prepare($conn,
        "UPDATE products
         SET name=?, category=?, price=?, old_price=?, emoji=?, badge=?, rating=?, reviews=?
         WHERE id=?"
    );

    mysqli_stmt_bind_param($stmt, "ssddssdii",
        $name, $category, $price, $oldPrice, $emoji, $badge, $rating, $reviews, $id
    );

    $result = mysqli_stmt_execute($stmt);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Product updated successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update: ' . mysqli_error($conn)]);
    }

    mysqli_stmt_close($stmt);

} elseif ($action === 'delete') {

    $id = isset($data['id']) ? intval($data['id']) : 0;

    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid product ID.']);
        exit();
    }

    $stmt = mysqli_prepare($conn, "DELETE FROM products WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $id);
    $result = mysqli_stmt_execute($stmt);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Product deleted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete: ' . mysqli_error($conn)]);
    }

    mysqli_stmt_close($stmt);

} else {
    echo json_encode(['success' => false, 'message' => 'Unknown action: ' . $action]);
}

mysqli_close($conn);
?>
