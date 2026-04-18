// ============================================
// navbar.js
//
// This file updates the navbar based on
// whether user is logged in or not.
//
// If logged in:  Shows "Hi, Name" + Profile button
// If not logged in: Shows "Login" button
//
// RUNS ON EVERY PAGE
// ============================================


// ─────────────────────────────────────────
// FUNCTION: updateNavbar
//
// Checks localStorage for logged in user
// and updates navbar buttons accordingly.
// ─────────────────────────────────────────
function updateNavbar() {

  // Check if user is logged in
  var loggedInUser = localStorage.getItem('loggedInUser');

  // Get the navbar right section
  var navRight = document.querySelector('.nav-right');

  if (!navRight) return; // navbar not found on this page

  if (loggedInUser) {
    // User IS logged in

    try {
      var user = JSON.parse(loggedInUser);
      var userName = user.name || 'User';

      // Update navbar to show profile button
      navRight.innerHTML = `
        <a href="profile.html" class="btn-profile">
          👤 ${userName}
        </a>
        <a href="cart.html" class="btn-cart">
          🛒 Cart <span id="cartCount">0</span>
        </a>
      `;

    } catch (e) {
      // If JSON parse fails, show login button
      showLoginButton(navRight);
    }

  } else {
    // User is NOT logged in
    showLoginButton(navRight);
  }

  // Update cart count (from cart.js)
  if (typeof updateCartCount === 'function') {
    updateCartCount();
  }
}


// ─────────────────────────────────────────
// FUNCTION: showLoginButton
// Shows the default login button
// ─────────────────────────────────────────
function showLoginButton(navRight) {
  navRight.innerHTML = `
    <a href="login.html" class="btn-login">Login</a>
    <a href="cart.html" class="btn-cart">
      🛒 Cart <span id="cartCount">0</span>
    </a>
  `;
}


// ─────────────────────────────────────────
// Run when page loads
// ─────────────────────────────────────────
updateNavbar();
