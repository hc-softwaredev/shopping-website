// ============================================
// track-orders.js
//
// This file:
// 1. Fetches all orders from MySQL database
// 2. Shows each order in a card
// 3. Shows products inside each order
// 4. Shows order status (pending, confirmed, etc.)
//
// BEGINNER-FRIENDLY CODE WITH COMMENTS
// ============================================


// Your backend URL
var BACKEND_URL = 'http://localhost/shopnow/backend';


// ─────────────────────────────────────────
// FUNCTION: loadOrders
//
// Called when page loads.
// Fetches all orders from get-orders.php
// ─────────────────────────────────────────
function loadOrders() {

  // Get the 3 main sections on the page
  var loadingBox = document.getElementById('loadingOrders');
  var noOrdersBox = document.getElementById('noOrders');
  var ordersList = document.getElementById('ordersList');

  // Show loading message
  loadingBox.style.display = 'block';
  noOrdersBox.style.display = 'none';
  ordersList.style.display = 'none';

  // ── Fetch orders from PHP ──
  // get-orders.php will give us all orders with their items
  fetch(BACKEND_URL + '/get-orders.php')

  .then(function(response) {
    // Convert response to JavaScript object
    return response.json();
  })

  .then(function(data) {

    // Hide loading message
    loadingBox.style.display = 'none';

    // Check if we got orders successfully
    if (data.success) {

      // Check if there are any orders
      if (data.orders.length === 0) {
        // No orders found - show empty message
        noOrdersBox.style.display = 'block';
      } else {
        // We have orders! Show them
        ordersList.style.display = 'block';
        renderOrders(data.orders);
      }

    } else {
      // Something went wrong
      noOrdersBox.style.display = 'block';
    }
  })

  .catch(function(error) {
    // This runs if XAMPP is not running
    loadingBox.style.display = 'none';
    noOrdersBox.style.display = 'block';
    console.log('Error:', error);
  });
}


// ─────────────────────────────────────────
// FUNCTION: renderOrders
//
// Creates HTML cards for each order.
// orders = array of order objects from database
// ─────────────────────────────────────────
function renderOrders(orders) {

  var container = document.getElementById('ordersList');
  container.innerHTML = ''; // clear first

  // Loop through each order
  orders.forEach(function(order) {

    // ── Build status badge ──
    // The status comes from database: pending, confirmed, shipped, delivered
    var statusClass = 'status-' + order.status; // e.g. "status-pending"

    // Format the date nicely
    // order.created_at comes from MySQL like "2025-02-19 10:30:45"
    var orderDate = formatDate(order.created_at);

    // ── Build items HTML ──
    // order.items is an array of products in this order
    var itemsHTML = '';

    order.items.forEach(function(item) {

      // Calculate total for this item
      var itemTotal = item.price * item.quantity;

      itemsHTML += `
        <div class="order-item">
          <div class="order-item-emoji">${item.emoji}</div>
          <div class="order-item-info">
            <div class="order-item-name">${item.name}</div>
            <div class="order-item-details">
              Qty: ${item.quantity} × ₹${Number(item.price).toLocaleString('en-IN')}
            </div>
          </div>
          <div class="order-item-price">
            ₹${itemTotal.toLocaleString('en-IN')}
          </div>
        </div>
      `;
    });

    // ── Build full order card HTML ──
    var cardHTML = `
      <div class="order-card">

        <!-- Order header: ID, date, status -->
        <div class="order-header">
          <div>
            <div class="order-id">Order #${order.id}</div>
            <div class="order-date">${orderDate}</div>
          </div>
          <div class="order-status ${statusClass}">
            ${order.status}
          </div>
        </div>

        <!-- List of items in this order -->
        <div class="order-items">
          ${itemsHTML}
        </div>

        <!-- Footer: total price -->
        <div class="order-footer">
          <span class="order-total-label">Order Total:</span>
          <span class="order-total-amount">₹${Number(order.total).toLocaleString('en-IN')}</span>
        </div>

      </div>
    `;

    // Add this order card to the page
    container.innerHTML += cardHTML;
  });
}


// ─────────────────────────────────────────
// FUNCTION: formatDate
//
// Converts MySQL date format to readable format.
// Input:  "2025-02-19 10:30:45"
// Output: "Feb 19, 2025 at 10:30 AM"
// ─────────────────────────────────────────
function formatDate(dateString) {

  // Create a Date object from the MySQL string
  var date = new Date(dateString);

  // Month names array
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get individual parts
  var month = months[date.getMonth()];
  var day   = date.getDate();
  var year  = date.getFullYear();

  // Get hours and minutes
  var hours   = date.getHours();
  var minutes = date.getMinutes();

  // Convert 24-hour to 12-hour format
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  // Add leading zero to minutes if needed
  minutes = minutes < 10 ? '0' + minutes : minutes;

  // Build final string
  return month + ' ' + day + ', ' + year + ' at ' + hours + ':' + minutes + ' ' + ampm;
}


// ─────────────────────────────────────────
// Run when page loads
// ─────────────────────────────────────────
loadOrders();
