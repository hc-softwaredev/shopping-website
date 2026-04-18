// ============================================
// cart-page.js — UPDATED WITH ORDER PLACEMENT
//
// New feature: checkout() now saves order to MySQL
// instead of just showing an alert
// ============================================


var BACKEND_URL = 'http://localhost/shopnow/backend';

var coupons = {
  "WELCOME20": 20,
  "SAVE10":    10,
  "FLAT50":    50
};

var appliedDiscount = 0;
var DELIVERY_CHARGE = 49;
var FREE_DELIVERY_ABOVE = 500;


// ─────────────────────────────────────────
// FUNCTION: renderCartPage
// Shows cart items or empty message
// ─────────────────────────────────────────
function renderCartPage() {

  var list      = document.getElementById('cartItemsList');
  var emptyCart = document.getElementById('emptyCart');

  if (cart.length === 0) {
    emptyCart.style.display = 'block';
    list.innerHTML = '';
    updateSummary();
    return;
  }

  emptyCart.style.display = 'none';
  var html = '';

  cart.forEach(function(item) {
    var itemTotal = item.price * item.quantity;

    html += `
      <div class="cart-item" id="item-${item.id}">
        <div class="cart-item-img">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price} per item</div>
        </div>
        <div class="cart-item-right">
          <div class="quantity-control">
            <button class="qty-btn" onclick="decreaseQty(${item.id})">−</button>
            <span class="qty-value" id="qty-${item.id}">${item.quantity}</span>
            <button class="qty-btn" onclick="increaseQty(${item.id})">+</button>
          </div>
          <div class="cart-item-total" id="total-${item.id}">
            ₹${itemTotal.toLocaleString('en-IN')}
          </div>
          <button class="btn-remove" onclick="removeItem(${item.id})">🗑 Remove</button>
        </div>
      </div>
    `;
  });

  html += '<button class="btn-clear-cart" onclick="clearCart()">🗑 Clear Entire Cart</button>';
  list.innerHTML = html;
  updateSummary();
}


// ─────────────────────────────────────────
// FUNCTION: updateSummary
// Calculates subtotal, delivery, discount, total
// ─────────────────────────────────────────
function updateSummary() {

  var subtotal = cart.reduce(function(sum, item) {
    return sum + (item.price * item.quantity);
  }, 0);

  var delivery = 0;
  if (subtotal <= FREE_DELIVERY_ABOVE) {
    delivery = DELIVERY_CHARGE;
  }

  var discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  var total = subtotal + delivery - discountAmount;

  document.getElementById('subtotal').textContent  = '₹' + subtotal.toLocaleString('en-IN');
  document.getElementById('discount').textContent  = '− ₹' + discountAmount.toLocaleString('en-IN');
  document.getElementById('totalPrice').textContent = '₹' + total.toLocaleString('en-IN');

  if (delivery === 0) {
    document.getElementById('delivery').textContent = 'FREE 🎉';
  } else {
    document.getElementById('delivery').textContent = '₹' + delivery;
  }
}


// ─────────────────────────────────────────
// FUNCTION: increaseQty
// ─────────────────────────────────────────
function increaseQty(productId) {
  var item = cart.find(function(i) { return i.id === productId; });
  if (item) {
    item.quantity = item.quantity + 1;
    document.getElementById('qty-' + productId).textContent = item.quantity;
    document.getElementById('total-' + productId).textContent =
      '₹' + (item.price * item.quantity).toLocaleString('en-IN');
    saveCart();
    updateCartCount();
    updateSummary();
  }
}


// ─────────────────────────────────────────
// FUNCTION: decreaseQty
// ─────────────────────────────────────────
function decreaseQty(productId) {
  var item = cart.find(function(i) { return i.id === productId; });
  if (item) {
    if (item.quantity > 1) {
      item.quantity = item.quantity - 1;
      document.getElementById('qty-' + productId).textContent = item.quantity;
      document.getElementById('total-' + productId).textContent =
        '₹' + (item.price * item.quantity).toLocaleString('en-IN');
      saveCart();
      updateCartCount();
      updateSummary();
    } else {
      removeItem(productId);
    }
  }
}


// ─────────────────────────────────────────
// FUNCTION: removeItem
// ─────────────────────────────────────────
function removeItem(productId) {
  cart = cart.filter(function(item) {
    return item.id !== productId;
  });
  saveCart();
  updateCartCount();
  renderCartPage();
  showToast('Item removed from cart.');
}


// ─────────────────────────────────────────
// FUNCTION: clearCart
// ─────────────────────────────────────────
function clearCart() {
  cart = [];
  saveCart();
  updateCartCount();
  renderCartPage();
  showToast('Cart cleared!');
}


// ─────────────────────────────────────────
// FUNCTION: applyCoupon
// ─────────────────────────────────────────
function applyCoupon() {
  var input = document.getElementById('couponInput');
  var code  = input.value.trim().toUpperCase();

  if (code === '') {
    showCouponMsg('Please enter a coupon code.', 'error');
    return;
  }

  if (coupons[code]) {
    appliedDiscount = coupons[code];
    showCouponMsg('✅ Coupon applied! ' + appliedDiscount + '% off', 'success');
    updateSummary();
  } else {
    appliedDiscount = 0;
    showCouponMsg('❌ Invalid coupon code.', 'error');
    updateSummary();
  }
}

function showCouponMsg(text, type) {
  var msgEl = document.getElementById('couponMsg');
  msgEl.textContent = text;
  msgEl.className = 'coupon-msg ' + type;
}


// ─────────────────────────────────────────
// FUNCTION: checkout — UPDATED WITH REAL BACKEND
//
// Now this function:
// 1. Checks if user is logged in
// 2. Calculates final total
// 3. Sends order data to checkout.php
// 4. Saves order to MySQL
// 5. Clears cart on success
// ─────────────────────────────────────────
function checkout() {

  // Check if cart is empty
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  // ── Get logged in user info (if any) ──
  // If user is not logged in, we use guest checkout
  var loggedInUser = localStorage.getItem('loggedInUser');
  var userId   = 0;
  var userName = 'Guest';

  if (loggedInUser) {
    try {
      var user = JSON.parse(loggedInUser);
      userId   = user.id   || 0;
      userName = user.name || 'Guest';
    } catch (e) {
      // If JSON parse fails, use guest
    }
  }

  // ── Calculate final total ──
  var subtotal = cart.reduce(function(sum, item) {
    return sum + (item.price * item.quantity);
  }, 0);

  var delivery = 0;
  if (subtotal <= FREE_DELIVERY_ABOVE) {
    delivery = DELIVERY_CHARGE;
  }

  var discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  var finalTotal = subtotal + delivery - discountAmount;

  // ── Prepare order data to send ──
  var orderData = {
    user_id:   userId,
    user_name: userName,
    total:     finalTotal,
    items:     cart  // send entire cart array
  };

  // ── Disable checkout button while processing ──
  var checkoutBtn = document.querySelector('.btn-checkout');
  checkoutBtn.textContent = 'Processing order...';
  checkoutBtn.disabled = true;

  // ── Send order to backend ──
  fetch(BACKEND_URL + '/checkout.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  })

  .then(function(response) {
    return response.json();
  })

  .then(function(data) {

    checkoutBtn.textContent = 'Proceed to Checkout';
    checkoutBtn.disabled = false;

    if (data.success) {

      // ── Success! Show confirmation ──
      alert(
        '✅ Order Placed Successfully!\n\n' +
        'Order ID: #' + data.order_id + '\n' +
        'Total: ₹' + finalTotal.toLocaleString('en-IN') + '\n\n' +
        'Thank you for shopping at ShopNow!'
      );

      // Clear cart after successful order
      clearCart();

      // Optional: redirect to homepage
      // setTimeout(function() {
      //   window.location.href = 'index.html';
      // }, 2000);

    } else {
      alert('❌ Order failed: ' + data.message);
    }
  })

  .catch(function(error) {
    checkoutBtn.textContent = 'Proceed to Checkout';
    checkoutBtn.disabled = false;
    alert('❌ Cannot connect to server. Please check XAMPP is running.');
  });
}


// ─────────────────────────────────────────
// Run when cart page loads
// ─────────────────────────────────────────
renderCartPage();
