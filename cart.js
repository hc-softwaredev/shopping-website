// =========================================
// cart.js — CART LOGIC
//
// This file handles everything related to
// the shopping cart. It is loaded on all
// pages so the cart count always shows.
// =========================================


// -----------------------------------------
// STEP 1: Load cart from localStorage
//
// localStorage is like a notepad in the browser.
// It saves data even when you refresh the page.
//
// JSON.parse() converts saved text back to an array.
// If nothing is saved yet, we start with empty array [].
// -----------------------------------------
let cart = JSON.parse(localStorage.getItem('cart')) || [];


// -----------------------------------------
// STEP 2: Save cart to localStorage
//
// We call this function every time cart changes.
// JSON.stringify() converts array to text for storage.
// -----------------------------------------
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}


// -----------------------------------------
// STEP 3: Update cart count in navbar
//
// Adds up quantity of all items.
// Shows total on the cart button.
// -----------------------------------------
function updateCartCount() {
  // .reduce() loops and adds up — starts at 0
  const total = cart.reduce(function(sum, item) {
    return sum + item.quantity;
  }, 0);

  // Update the number in the navbar
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    countEl.textContent = total;
  }
}


// -----------------------------------------
// STEP 4: Add item to cart
//
// Called when user clicks the "+" button.
// -----------------------------------------
function addToCart(productId) {

  // Find the product from products.js array
  const product = products.find(function(p) {
    return p.id === productId;
  });

  // Safety check — if product not found, stop
  if (!product) return;

  // Check if this product is already in the cart
  const existing = cart.find(function(item) {
    return item.id === productId;
  });

  if (existing) {
    // Already in cart → just increase quantity by 1
    existing.quantity = existing.quantity + 1;
  } else {
    // Not in cart → add it as a new item
    cart.push({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      emoji:    product.emoji,
      quantity: 1
    });
  }

  // Save the updated cart
  saveCart();

  // Update the count shown in navbar
  updateCartCount();

  // Show "added to cart" message
  showToast(product.emoji + ' "' + product.name + '" added to cart!');
}


// -----------------------------------------
// STEP 5: Show Toast Notification
//
// A small popup message at the bottom right.
// Disappears automatically after 2.5 seconds.
// -----------------------------------------
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;

  // Add class "show" → CSS makes it visible
  toast.classList.add('show');

  // After 2.5 seconds, remove "show" → CSS hides it
  setTimeout(function() {
    toast.classList.remove('show');
  }, 2500);
}


// -----------------------------------------
// Run updateCartCount when any page loads
// So navbar always shows correct number
// -----------------------------------------
updateCartCount();
