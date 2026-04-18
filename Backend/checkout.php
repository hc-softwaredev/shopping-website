<?php
// ============================================
// checkout.php — ORDER PLACEMENT BACKEND
//
// Receives cart data from frontend
// Saves order to MySQL in 2 tables:
//   1. orders table - one row for the whole order
//   2. order_items table - one row per product
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
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Invalid data.']);
    exit();
}

// ── Get data from frontend ──
$userId   = isset($data['user_id'])   ? intval($data['user_id'])   : 0;
$userName = isset($data['user_name']) ? trim($data['user_name'])   : 'Guest';
$total    = isset($data['total'])     ? floatval($data['total'])   : 0;
$items    = isset($data['items'])     ? $data['items']              : [];

// ── Validate ──
if ($total <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid order total.']);
    exit();
}

if (empty($items) || !is_array($items)) {
    echo json_encode(['success' => false, 'message' => 'Cart is empty.']);
    exit();
}

// If user is not logged in, use userId = 0 (guest order)
// In a real system, you'd require login before checkout


// ══════════════════════════════════════════
// STEP 1: Insert into ORDERS table
// This creates the main order record
// ══════════════════════════════════════════

$stmt = mysqli_prepare($conn,
    "INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'pending')"
);

// "id" = integer, "d" = decimal
mysqli_stmt_bind_param($stmt, "id", $userId, $total);
$result = mysqli_stmt_execute($stmt);

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Failed to create order: ' . mysqli_error($conn)]);
    mysqli_stmt_close($stmt);
    exit();
}

// Get the ID of the order we just created
// mysqli_insert_id() returns the AUTO_INCREMENT id
$orderId = mysqli_insert_id($conn);

mysqli_stmt_close($stmt);


// ══════════════════════════════════════════
// STEP 2: Insert into ORDER_ITEMS table
// One row for each product in the cart
// ══════════════════════════════════════════

$itemStmt = mysqli_prepare($conn,
    "INSERT INTO order_items (order_id, product_id, quantity, price)
     VALUES (?, ?, ?, ?)"
);

// Loop through each item in cart and insert it
foreach ($items as $item) {

    $productId = isset($item['id'])       ? intval($item['id'])       : 0;
    $quantity  = isset($item['quantity']) ? intval($item['quantity']) : 0;
    $price     = isset($item['price'])    ? floatval($item['price'])  : 0;

    if ($productId <= 0 || $quantity <= 0 || $price <= 0) {
        continue; // skip invalid items
    }

    // "iiii" = 4 integers, "d" = 1 decimal
    mysqli_stmt_bind_param($itemStmt, "iiid", $orderId, $productId, $quantity, $price);
    mysqli_stmt_execute($itemStmt);
}

mysqli_stmt_close($itemStmt);


// ══════════════════════════════════════════
// STEP 3: Send success response
// ══════════════════════════════════════════

echo json_encode([
    'success'  => true,
    'message'  => 'Order placed successfully!',
    'order_id' => $orderId
]);

mysqli_close($conn);
?>
