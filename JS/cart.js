// ============================================
// cart.js
//
// This file handles the shopping cart.
// It is loaded on EVERY page (not just cart page)
// so the cart count in navbar always works.
//
// KEY CONCEPTS USED HERE:
// 1. localStorage  - saves data in browser
// 2. JSON          - a way to save objects as text
// 3. Array methods - find(), reduce()
// ============================================


// ─────────────────────────────────────────
// STEP 1: LOAD CART FROM LOCALSTORAGE
//
// localStorage is like a notepad in the browser.
// It saves data even after you close the page.
//
// localStorage can only save TEXT, not arrays.
// So we use:
//   JSON.stringify()  → converts array to text (to SAVE)
//   JSON.parse()      → converts text back to array (to LOAD)
//
// The || [] means: if nothing is saved yet, use empty array
// ─────────────────────────────────────────
var cart = JSON.parse(localStorage.getItem('cart')) || [];


// ─────────────────────────────────────────
// FUNCTION: saveCart
//
// Saves the cart array to localStorage.
// We call this every time cart changes.
// ─────────────────────────────────────────
function saveCart() {
  // Convert array to text, then save it
  localStorage.setItem('cart', JSON.stringify(cart));
}


// ─────────────────────────────────────────
// FUNCTION: updateCartCount
//
// Counts total items in cart and shows it
// on the cart button in the navbar.
//
// WHAT IS reduce()?
// reduce() loops through array and builds ONE value.
// Here we add up all quantities to get total.
// It starts at 0, then adds each item's quantity.
// ─────────────────────────────────────────
function updateCartCount() {

  // Add up all quantities
  var total = cart.reduce(function(sum, item) {
    return sum + item.quantity;
  }, 0); // 0 is the starting value

  // Find the count element in navbar and update it
  var countElement = document.getElementById('cartCount');

  if (countElement) {
    countElement.textContent = total;
  }
}


// ─────────────────────────────────────────
// FUNCTION: addToCart
//
// Called when user clicks the "+" button.
//
// Parameters (values passed into the function):
//   id    - product id number  e.g. 1
//   name  - product name       e.g. "Headphones"
//   price - product price      e.g. 1299
//   emoji - product emoji      e.g. "🎧"
// ─────────────────────────────────────────
function addToCart(id, name, price, emoji) {

  // Convert to correct data types just to be safe
  id    = parseInt(id);     // make sure it's a number
  price = parseFloat(price); // make sure it's a decimal number

  // Check if this product is already in the cart
  // find() searches the array and returns the matching item
  // If not found, it returns undefined (which is falsy)
  var existingItem = cart.find(function(item) {
    return item.id === id;
  });

  if (existingItem) {
    // Product already in cart → just add 1 to quantity
    existingItem.quantity = existingItem.quantity + 1;
  } else {
    // Product not in cart → add it as a new item
    cart.push({
      id:       id,
      name:     name,
      price:    price,
      emoji:    emoji,
      quantity: 1
    });
  }

  // Save updated cart to localStorage
  saveCart();

  // Update the number on cart button in navbar
  updateCartCount();

  // Show popup message
  showToast(emoji + ' "' + name + '" added to cart!');
}


// ─────────────────────────────────────────
// FUNCTION: showToast
//
// Shows a small popup message at bottom-right.
// Disappears after 2.5 seconds.
//
// HOW IT WORKS:
// 1. Set the message text
// 2. Add class "show" → CSS makes it visible
// 3. After 2500ms (2.5 sec) remove "show" → CSS hides it
// ─────────────────────────────────────────
function showToast(message) {

  var toast = document.getElementById('toast');

  // Safety check - if toast element not found, stop
  if (!toast) return;

  // Set the message
  toast.textContent = message;

  // Add "show" class to make it visible
  toast.classList.add('show');

  // After 2.5 seconds, remove "show" to hide it
  setTimeout(function() {
    toast.classList.remove('show');
  }, 2500);
}


// ─────────────────────────────────────────
// Run when ANY page loads
// This keeps the cart count correct always
// ─────────────────────────────────────────
updateCartCount();
