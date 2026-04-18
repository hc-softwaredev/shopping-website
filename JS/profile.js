// ============================================
// profile.js — USER PROFILE PAGE
//
// This file handles:
// 1. Check if user is logged in
// 2. Load user profile data
// 3. Edit profile (toggle edit mode)
// 4. Save profile changes to database
// 5. Load user's order history
// 6. Logout
//
// BEGINNER-FRIENDLY WITH LOTS OF COMMENTS
// ============================================


var BACKEND_URL = 'http://localhost/shopnow/backend';

// Store current user data
var currentUser = null;


// ─────────────────────────────────────────
// FUNCTION: checkLogin
//
// Runs when page loads.
// Checks if user is logged in by looking
// in localStorage.
// ─────────────────────────────────────────
function checkLogin() {

  // Try to get logged in user from localStorage
  var loggedInUser = localStorage.getItem('loggedInUser');

  if (!loggedInUser) {
    // Not logged in - show login message
    document.getElementById('notLoggedIn').style.display = 'block';
    document.getElementById('profileWrapper').style.display = 'none';
    return;
  }

  // Parse the JSON string to get user object
  try {
    currentUser = JSON.parse(loggedInUser);
  } catch (e) {
    // If JSON parse fails, user data is corrupted
    document.getElementById('notLoggedIn').style.display = 'block';
    return;
  }

  // User is logged in! Show profile
  document.getElementById('notLoggedIn').style.display = 'none';
  document.getElementById('profileWrapper').style.display = 'grid';

  // Load user profile data from backend
  loadUserProfile();

  // Load user's order history
  loadUserOrders();
}


// ─────────────────────────────────────────
// FUNCTION: loadUserProfile
//
// Fetches user data from database and
// displays it on the page.
// ─────────────────────────────────────────
function loadUserProfile() {

  // Show loading text
  document.getElementById('displayName').textContent = 'Loading...';
  document.getElementById('displayEmail').textContent = 'Loading...';

  // Send request to backend
  fetch(BACKEND_URL + '/get-user.php?id=' + currentUser.id)

  .then(function(response) {
    return response.json();
  })

  .then(function(data) {

    if (data.success) {

      var user = data.user;

      // Update currentUser with fresh data
      currentUser = user;

      // Display user info on page
      document.getElementById('displayName').textContent = user.name;
      document.getElementById('displayEmail').textContent = user.email;
      document.getElementById('displayPhone').textContent = user.phone || 'Not provided';

      // Format join date
      // user.created_at comes from MySQL like "2025-02-19 10:30:45"
      var joinDate = formatDate(user.created_at);
      document.getElementById('displayJoined').textContent = joinDate;

    } else {
      showToast('Failed to load profile data.');
    }
  })

  .catch(function(error) {
    showToast('Cannot connect to server.');
  });
}


// ─────────────────────────────────────────
// FUNCTION: toggleEditMode
//
// Switches from view mode to edit mode.
// Fills the input fields with current values.
// ─────────────────────────────────────────
function toggleEditMode() {

  // Hide view mode, show edit mode
  document.getElementById('viewMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'block';

  // Fill inputs with current values
  document.getElementById('editName').value = currentUser.name;
  document.getElementById('editEmail').value = currentUser.email;
  document.getElementById('editPhone').value = currentUser.phone || '';

  // Clear any previous messages
  var msgEl = document.getElementById('editMessage');
  msgEl.textContent = '';
  msgEl.className = 'edit-message';
}


// ─────────────────────────────────────────
// FUNCTION: cancelEdit
//
// Goes back to view mode without saving.
// ─────────────────────────────────────────
function cancelEdit() {
  document.getElementById('viewMode').style.display = 'block';
  document.getElementById('editMode').style.display = 'none';
}


// ─────────────────────────────────────────
// FUNCTION: saveProfile
//
// Saves the edited profile data to database.
// ─────────────────────────────────────────
function saveProfile() {

  // Get values from input fields
  var newName = document.getElementById('editName').value.trim();
  var newPhone = document.getElementById('editPhone').value.trim();

  // Validate
  if (newName === '') {
    showEditMsg('Name cannot be empty.', 'error');
    return;
  }

  // Optional: validate phone format
  // We'll keep it simple for now

  // Prepare data to send
  var updateData = {
    id:    currentUser.id,
    name:  newName,
    phone: newPhone
  };

  // Show saving message
  var saveBtn = document.querySelector('.btn-save-profile');
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;

  // Send to backend
  fetch(BACKEND_URL + '/update-profile.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  })

  .then(function(response) {
    return response.json();
  })

  .then(function(data) {

    saveBtn.textContent = '💾 Save Changes';
    saveBtn.disabled = false;

    if (data.success) {

      // Update was successful!
      showEditMsg('✅ Profile updated successfully!', 'success');

      // Update currentUser object
      currentUser.name = newName;
      currentUser.phone = newPhone;

      // Update localStorage so user stays logged in with new data
      localStorage.setItem('loggedInUser', JSON.stringify(currentUser));

      // Update the view mode display
      document.getElementById('displayName').textContent = newName;
      document.getElementById('displayPhone').textContent = newPhone || 'Not provided';

      // After 1.5 seconds, go back to view mode
      setTimeout(function() {
        cancelEdit();
      }, 1500);

    } else {
      showEditMsg('❌ ' + data.message, 'error');
    }
  })

  .catch(function(error) {
    saveBtn.textContent = '💾 Save Changes';
    saveBtn.disabled = false;
    showEditMsg('❌ Cannot connect to server.', 'error');
  });
}


// Helper: show message in edit mode
function showEditMsg(text, type) {
  var msgEl = document.getElementById('editMessage');
  msgEl.textContent = text;
  msgEl.className = 'edit-message ' + type;
}


// ─────────────────────────────────────────
// FUNCTION: loadUserOrders
//
// Fetches all orders for this user and
// displays them on the right side.
// ─────────────────────────────────────────
function loadUserOrders() {

  var loadingEl = document.getElementById('ordersLoading');
  var noOrdersEl = document.getElementById('noOrdersMsg');
  var listEl = document.getElementById('ordersList');

  loadingEl.style.display = 'block';
  noOrdersEl.style.display = 'none';
  listEl.innerHTML = '';

  // Fetch orders for this user
  fetch(BACKEND_URL + '/get-orders.php?user_id=' + currentUser.id)

  .then(function(response) {
    return response.json();
  })

  .then(function(data) {

    loadingEl.style.display = 'none';

    if (data.success) {

      if (data.orders.length === 0) {
        // No orders yet
        noOrdersEl.style.display = 'block';
      } else {
        // Show orders
        renderUserOrders(data.orders);
      }

    } else {
      noOrdersEl.style.display = 'block';
    }
  })

  .catch(function(error) {
    loadingEl.style.display = 'none';
    noOrdersEl.style.display = 'block';
  });
}


// ─────────────────────────────────────────
// FUNCTION: renderUserOrders
//
// Creates mini order cards from the array.
// orders = array of order objects
// ─────────────────────────────────────────
function renderUserOrders(orders) {

  var listEl = document.getElementById('ordersList');
  listEl.innerHTML = '';

  orders.forEach(function(order) {

    // Status badge class
    var statusClass = 'status-' + order.status;

    // Format date
    var orderDate = formatDateShort(order.created_at);

    // Count total items in this order
    var itemCount = order.items ? order.items.length : 0;

    // Build mini card HTML
    var cardHTML = `
      <div class="order-card-mini">
        <div class="order-mini-header">
          <div>
            <div class="order-mini-id">Order #${order.id}</div>
            <div class="order-mini-date">${orderDate}</div>
          </div>
          <div class="order-mini-status ${statusClass}">
            ${order.status}
          </div>
        </div>
        <div class="order-mini-items">
          ${itemCount} item(s)
        </div>
        <div class="order-mini-total">
          ₹${Number(order.total).toLocaleString('en-IN')}
        </div>
      </div>
    `;

    listEl.innerHTML += cardHTML;
  });
}


// ─────────────────────────────────────────
// FUNCTION: logout
//
// Logs user out and redirects to homepage.
// ─────────────────────────────────────────
function logout() {

  // Ask for confirmation
  var confirmed = confirm('Are you sure you want to logout?');

  if (!confirmed) return;

  // Remove user from localStorage
  localStorage.removeItem('loggedInUser');

  // Show success message
  showToast('✅ Logged out successfully!');

  // Redirect to homepage after 1 second
  setTimeout(function() {
    window.location.href = 'index.html';
  }, 1000);
}


// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────

// Format full date: "Feb 19, 2025 at 10:30 AM"
function formatDate(dateString) {
  var date = new Date(dateString);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var month = months[date.getMonth()];
  var day = date.getDate();
  var year = date.getFullYear();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return month + ' ' + day + ', ' + year + ' at ' + hours + ':' + minutes + ' ' + ampm;
}

// Format short date: "Feb 19, 2025"
function formatDateShort(dateString) {
  var date = new Date(dateString);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var month = months[date.getMonth()];
  var day = date.getDate();
  var year = date.getFullYear();
  return month + ' ' + day + ', ' + year;
}


// ─────────────────────────────────────────
// Run when page loads
// ─────────────────────────────────────────
checkLogin();
