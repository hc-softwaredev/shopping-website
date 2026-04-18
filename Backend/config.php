<?php
// =========================================
// config.php — DATABASE CONNECTION
//
// This file connects PHP to your MySQL database.
// Every other PHP file will include this file.
//
// IMPORTANT: Change the values below to match
// your local setup (XAMPP/WAMP).
// =========================================


// --- Your database details ---
// If you use XAMPP, these defaults usually work:
define('DB_HOST',     'localhost');   // where MySQL is running
define('DB_USER',     'root');        // MySQL username (XAMPP default = root)
define('DB_PASSWORD', '');            // MySQL password (XAMPP default = empty)
define('DB_NAME',     'shopnow_db'); // database name we created in database.sql


// --- Connect to MySQL ---
// mysqli = "MySQL Improved" — PHP's built-in MySQL extension
$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);


// --- Check if connection worked ---
if (!$conn) {
    // die() stops the script and shows this error message
    // mysqli_connect_error() gives the exact error reason
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . mysqli_connect_error()
    ]));
}


// --- Set character encoding to UTF-8 ---
// This makes sure special characters (like emojis) work correctly
mysqli_set_charset($conn, 'utf8');


// --- CORS Headers ---
// These allow your HTML frontend (on a different port)
// to talk to this PHP backend.
// Without these, the browser will block the request.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request (browser sends this before real request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
?>
