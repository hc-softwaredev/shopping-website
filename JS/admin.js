// ============================================
// admin.js — ADMIN PANEL JAVASCRIPT
//
// This file handles:
// 1. Admin password login
// 2. Load all products in a table
// 3. Add new product
// 4. Edit existing product
// 5. Delete product
//
// All data changes are saved to MySQL
// via fetch() → admin.php
// ============================================


var BACKEND_URL = 'http://localhost/shopnow/backend';

// Admin password
// In a real project this would be checked on the backend
// For now we keep it simple
var ADMIN_PASSWORD = 'admin123';

// Stores all products for the admin table
var adminProducts = [];


// ─────────────────────────────────────────
// SECTION 1: ADMIN LOGIN
// ─────────────────────────────────────────

// Called when user presses Enter in password field
function handlePasswordKeypress(event) {
  // event.key tells us which key was pressed
  if (event.key === 'Enter') {
    checkAdminPassword();
  }
}

// Check if password is correct
function checkAdminPassword() {

  var input    = document.getElementById('adminPasswordInput');
  var errorMsg = document.getElementById('adminLoginError');
  var password = input.value.trim();

  if (password === ADMIN_PASSWORD) {
    // Correct password!
    // Hide the login screen
    document.getElementById('adminLogin').style.display = 'none';
    // Show the admin panel
    document.getElementById('adminPanel').style.display = 'block';
    // Load all products into the table
    loadAdminProducts();

  } else {
    // Wrong password
    errorMsg.textContent = '❌ Wrong password. Try: admin123';
    input.value = ''; // clear input
    input.focus();    // put cursor back in input
  }
}

// Logout — reload page to show login screen again
function adminLogout() {
  window.location.reload();
}


// ─────────────────────────────────────────
// SECTION 2: LOAD PRODUCTS
// Fetches all products from MySQL
// and shows them in the table
// ─────────────────────────────────────────
function loadAdminProducts() {

  var tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:#888;">⏳ Loading...</td></tr>';

  fetch(BACKEND_URL + '/products.php')

  .then(function(response) {
    return response.json();
  })

  .then(function(data) {
    if (data.success) {
      adminProducts = data.products;
      renderAdminTable(adminProducts);
      updateStatCards(adminProducts);
    } else {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">Failed to load.</td></tr>';
    }
  })

  .catch(function(error) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">Cannot connect to server.</td></tr>';
  });
}


// ─────────────────────────────────────────
// SECTION 3: RENDER TABLE
// Creates table rows for each product
// ─────────────────────────────────────────
function renderAdminTable(products) {

  var tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = '';

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:#888;">No products found.</td></tr>';
    return;
  }

  products.forEach(function(product) {

    // Build badge HTML for table
    var badgeHTML = '<span class="table-badge badge-none">None</span>';
    if (product.badge) {
      var badgeClass = 'badge-sale';
      if (product.badge === 'New') { badgeClass = 'badge-new'; }
      if (product.badge === 'Hot') { badgeClass = 'badge-hot'; }
      badgeHTML = '<span class="table-badge ' + badgeClass + '">' + product.badge + '</span>';
    }

    // Old price display
    var oldPriceDisplay = product.old_price ? '₹' + Number(product.old_price).toLocaleString('en-IN') : '—';

    // Build one table row <tr> for each product
    var row = `
      <tr id="row-${product.id}">
        <td>${product.id}</td>
        <td class="td-emoji">${product.emoji}</td>
        <td class="td-name">${product.name}</td>
        <td>${product.category}</td>
        <td class="td-price">₹${Number(product.price).toLocaleString('en-IN')}</td>
        <td class="td-old-price">${oldPriceDisplay}</td>
        <td>⭐ ${product.rating}</td>
        <td>${badgeHTML}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit"   onclick="editProduct(${product.id})">✏️ Edit</button>
            <button class="btn-delete" onclick="deleteProduct(${product.id}, '${product.name}')">🗑 Delete</button>
          </div>
        </td>
      </tr>
    `;

    tbody.innerHTML += row;
  });
}


// ─────────────────────────────────────────
// SECTION 4: UPDATE STAT CARDS
// Shows total products, categories, on sale
// ─────────────────────────────────────────
function updateStatCards(products) {

  // Total products count
  document.getElementById('totalProductsCount').textContent = products.length;

  // Count unique categories
  // We use a Set — it automatically removes duplicates
  var categories = new Set();
  products.forEach(function(p) {
    categories.add(p.category);
  });
  document.getElementById('totalCategoriesCount').textContent = categories.size;

  // Count products on sale (have old_price)
  var onSale = products.filter(function(p) {
    return p.old_price !== null && p.old_price !== '';
  });
  document.getElementById('saleProductsCount').textContent = onSale.length;
}


// ─────────────────────────────────────────
// SECTION 5: SEARCH IN ADMIN TABLE
// Filters table rows as you type
// ─────────────────────────────────────────
function filterAdminTable() {

  var query = document.getElementById('adminSearch').value.toLowerCase();

  // Filter adminProducts array
  var filtered = adminProducts.filter(function(product) {
    return product.name.toLowerCase().includes(query) ||
           product.category.toLowerCase().includes(query);
  });

  renderAdminTable(filtered);
}


// ─────────────────────────────────────────
// SECTION 6: SAVE PRODUCT
//
// This function handles BOTH:
//   - Adding a new product
//   - Editing an existing product
//
// How we know which one:
//   editProductId field is empty  → ADD new
//   editProductId field has value → EDIT existing
// ─────────────────────────────────────────
function saveProduct() {

  // Get all form values
  var name       = document.getElementById('prodName').value.trim();
  var category   = document.getElementById('prodCategory').value;
  var price      = document.getElementById('prodPrice').value.trim();
  var oldPrice   = document.getElementById('prodOldPrice').value.trim();
  var emoji      = document.getElementById('prodEmoji').value.trim();
  var badge      = document.getElementById('prodBadge').value;
  var rating     = document.getElementById('prodRating').value.trim();
  var reviews    = document.getElementById('prodReviews').value.trim();
  var editId     = document.getElementById('editProductId').value;

  // ── Validate required fields ──
  if (name === '') {
    showFormMsg('Product name is required.', 'error');
    return;
  }
  if (category === '') {
    showFormMsg('Please select a category.', 'error');
    return;
  }
  if (price === '' || isNaN(price) || Number(price) <= 0) {
    showFormMsg('Please enter a valid price.', 'error');
    return;
  }
  if (emoji === '') {
    showFormMsg('Please enter an emoji.', 'error');
    return;
  }
  if (rating === '' || isNaN(rating) || Number(rating) < 1 || Number(rating) > 5) {
    showFormMsg('Rating must be between 1.0 and 5.0.', 'error');
    return;
  }
  if (reviews === '' || isNaN(reviews)) {
    showFormMsg('Please enter number of reviews.', 'error');
    return;
  }

  // Build the data object to send to PHP
  var productData = {
    name:      name,
    category:  category,
    price:     Number(price),
    old_price: oldPrice !== '' ? Number(oldPrice) : null,
    emoji:     emoji,
    badge:     badge !== '' ? badge : null,
    rating:    Number(rating),
    reviews:   Number(reviews)
  };

  // Decide which PHP action to use
  var action = 'add';
  if (editId !== '') {
    action = 'edit';
    productData.id = Number(editId);
  }

  // Add action to data
  productData.action = action;

  // Disable save button while saving
  var saveBtn = document.querySelector('.btn-save');
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled    = true;

  // Send to PHP
  fetch(BACKEND_URL + '/admin.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(productData)
  })

  .then(function(response) {
    return response.json();
  })

  .then(function(data) {

    saveBtn.textContent = '💾 Save Product';
    saveBtn.disabled    = false;

    if (data.success) {
      showFormMsg('✅ ' + data.message, 'success');
      resetForm();           // clear the form
      loadAdminProducts();   // refresh the table
      showToast(data.message);
    } else {
      showFormMsg('❌ ' + data.message, 'error');
    }
  })

  .catch(function(error) {
    saveBtn.textContent = '💾 Save Product';
    saveBtn.disabled    = false;
    showFormMsg('❌ Cannot connect to server.', 'error');
  });
}


// ─────────────────────────────────────────
// SECTION 7: EDIT PRODUCT
//
// Fills the form with existing product data
// so the admin can change it and save.
// ─────────────────────────────────────────
function editProduct(productId) {

  // Find the product in our array
  var product = adminProducts.find(function(p) {
    return p.id === productId || Number(p.id) === productId;
  });

  if (!product) return;

  // Fill the form fields with existing values
  document.getElementById('prodName').value     = product.name;
  document.getElementById('prodCategory').value = product.category;
  document.getElementById('prodPrice').value    = product.price;
  document.getElementById('prodOldPrice').value = product.old_price || '';
  document.getElementById('prodEmoji').value    = product.emoji;
  document.getElementById('prodBadge').value    = product.badge || '';
  document.getElementById('prodRating').value   = product.rating;
  document.getElementById('prodReviews').value  = product.reviews;

  // Set the hidden field so saveProduct() knows we're editing
  document.getElementById('editProductId').value = product.id;

  // Show cancel button
  document.getElementById('cancelEditBtn').style.display = 'inline-block';

  // Change save button text
  document.querySelector('.btn-save').textContent = '✏️ Update Product';

  // Scroll up to the form
  document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });

  showFormMsg('✏️ Editing: ' + product.name, 'success');
}


// ─────────────────────────────────────────
// SECTION 8: DELETE PRODUCT
// ─────────────────────────────────────────
function deleteProduct(productId, productName) {

  // Ask for confirmation before deleting
  // confirm() shows a popup with OK and Cancel
  var confirmed = confirm('Are you sure you want to delete "' + productName + '"?\n\nThis cannot be undone!');

  if (!confirmed) return; // user clicked Cancel

  // Send delete request to PHP
  fetch(BACKEND_URL + '/admin.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ action: 'delete', id: productId })
  })

  .then(function(response) {
    return response.json();
  })

  .then(function(data) {
    if (data.success) {
      showToast('🗑 ' + data.message);
      loadAdminProducts(); // refresh table
    } else {
      showToast('❌ ' + data.message);
    }
  })

  .catch(function(error) {
    showToast('❌ Cannot connect to server.');
  });
}


// ─────────────────────────────────────────
// SECTION 9: RESET FORM
// Clears all form fields back to empty
// ─────────────────────────────────────────
function resetForm() {

  // Clear all inputs
  document.getElementById('prodName').value       = '';
  document.getElementById('prodCategory').value   = '';
  document.getElementById('prodPrice').value      = '';
  document.getElementById('prodOldPrice').value   = '';
  document.getElementById('prodEmoji').value      = '';
  document.getElementById('prodBadge').value      = '';
  document.getElementById('prodRating').value     = '';
  document.getElementById('prodReviews').value    = '';
  document.getElementById('editProductId').value  = '';

  // Reset save button text
  document.querySelector('.btn-save').textContent = '💾 Save Product';

  // Hide cancel button
  document.getElementById('cancelEditBtn').style.display = 'none';

  // Clear form message
  var msgEl = document.getElementById('formMessage');
  msgEl.textContent = '';
  msgEl.className   = 'form-message-admin';
}


// ─────────────────────────────────────────
// HELPER: showFormMsg
// Shows message below the form
// ─────────────────────────────────────────
function showFormMsg(text, type) {
  var msgEl       = document.getElementById('formMessage');
  msgEl.textContent = text;
  msgEl.className   = 'form-message-admin ' + type;
}
