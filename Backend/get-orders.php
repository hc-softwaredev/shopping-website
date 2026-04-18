<?php
// ============================================
// get-orders.php
//
// Fetches all orders from database and sends
// them to the frontend as JSON.
//
// For each order, we also fetch:
//   - All items in that order (from order_items)
//   - Product details (name, emoji) for each item
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


// ══════════════════════════════════════════
// STEP 1: Get orders from orders table
// If user_id is provided, filter by that user
// Otherwise show all orders
// ══════════════════════════════════════════

// Check if user_id parameter is provided
// URL like: get-orders.php?user_id=5
$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($userId > 0) {
    // Filter by user_id
    $ordersQuery = "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC";
    $ordersStmt = mysqli_prepare($conn, $ordersQuery);
    mysqli_stmt_bind_param($ordersStmt, "i", $userId);
    mysqli_stmt_execute($ordersStmt);
    $ordersResult = mysqli_stmt_get_result($ordersStmt);
} else {
    // Get all orders
    $ordersQuery = "SELECT * FROM orders ORDER BY id DESC";
    $ordersResult = mysqli_query($conn, $ordersQuery);
}

// Check if query worked
if (!$ordersResult) {
    echo json_encode(['success' => false, 'message' => 'Failed to fetch orders.']);
    exit();
}

// Build an array to hold all orders
$orders = [];

// Loop through each order row
while ($order = mysqli_fetch_assoc($ordersResult)) {

    // $order now contains: id, user_id, total, status, created_at

    // ══════════════════════════════════════════
    // STEP 2: Get all items for THIS order
    //
    // We use a JOIN to combine 3 tables:
    //   order_items - has quantity and price
    //   products    - has name and emoji
    //
    // WHERE order_id = current order's id
    // ══════════════════════════════════════════

    $orderId = $order['id'];

    $itemsQuery = "
        SELECT
            order_items.quantity,
            order_items.price,
            products.name,
            products.emoji
        FROM order_items
        JOIN products ON order_items.product_id = products.id
        WHERE order_items.order_id = ?
    ";

    $itemsStmt = mysqli_prepare($conn, $itemsQuery);
    mysqli_stmt_bind_param($itemsStmt, "i", $orderId);
    mysqli_stmt_execute($itemsStmt);
    $itemsResult = mysqli_stmt_get_result($itemsStmt);

    // Build an array for items in this order
    $items = [];
    while ($item = mysqli_fetch_assoc($itemsResult)) {
        $items[] = $item;
    }

    mysqli_stmt_close($itemsStmt);

    // ══════════════════════════════════════════
    // STEP 3: Add items array to the order
    // ══════════════════════════════════════════

    $order['items'] = $items;

    // Add this complete order to our orders array
    $orders[] = $order;
}

// ══════════════════════════════════════════
// STEP 4: Send everything back as JSON
// ══════════════════════════════════════════

echo json_encode([
    'success' => true,
    'orders'  => $orders
]);

mysqli_close($conn);
?>
