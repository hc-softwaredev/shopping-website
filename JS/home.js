// ============================================
// home.js — WITH SEARCH + CATEGORY FILTER
//
// NEW FEATURES ADDED:
// 1. Search bar — live dropdown as you type
// 2. Search results shown in products grid
// 3. Category filter still works
// 4. Both work together!
// ============================================


var BACKEND_URL = 'http://localhost/shopnow/backend';

// Stores all products after first load
var allProducts = [];

// Currently selected category
var selectedCategory = 'All';


// ─────────────────────────────────────────
// FUNCTION: loadProducts
// Fetches all products from MySQL once
// ─────────────────────────────────────────
function loadProducts() {

  var grid = document.getElementById('productsGrid');
  grid.innerHTML = '<p style="text-align:center; color:#888; padding:40px; grid-column:1/-1;">⏳ Loading products...</p>';

  fetch(BACKEND_URL + '/products.php')

  .then(function(response) {
    return response.json();
  })

  .then(function(data) {
    if (data.success) {
      allProducts = data.products; // save all products
      renderProducts(allProducts); // show all
    } else {
      grid.innerHTML = '<p style="text-align:center; color:red; grid-column:1/-1;">Failed to load products.</p>';
    }
  })

  .catch(function(error) {
    grid.innerHTML = '<p style="text-align:center; color:red; padding:40px; grid-column:1/-1;">❌ Cannot connect. Make sure XAMPP is running.</p>';
  });
}


// ─────────────────────────────────────────
// FUNCTION: searchProducts
//
// Called every time the user types a letter
// in the search box (oninput event in HTML).
//
// Does TWO things:
// 1. Shows a live dropdown with suggestions
// 2. Filters the products grid below
// ─────────────────────────────────────────
function searchProducts() {

  // Get what user typed, convert to lowercase
  var input    = document.getElementById('searchInput');
  var query    = input.value.trim();
  var dropdown = document.getElementById('searchDropdown');

  // If search box is empty
  if (query === '') {
    closeDropdown();          // hide the dropdown
    renderProducts(allProducts); // show all products again
    resetSectionTitle();      // reset the section heading
    return;                   // stop here
  }

  // ── FILTER products that match the search ──
  // .toLowerCase() makes comparison case-insensitive
  // e.g. "headphones" matches "Headphones"
  var queryLower = query.toLowerCase();

  var results = allProducts.filter(function(product) {
    // Check if product name includes the search text
    return product.name.toLowerCase().includes(queryLower);
  });

  // ── Show dropdown suggestions ──
  showDropdown(results, query);

  // ── Update products grid ──
  renderProducts(results);

  // ── Update section title ──
  updateSectionTitle(query, results.length);
}


// ─────────────────────────────────────────
// FUNCTION: showDropdown
//
// Shows live suggestions in the dropdown box
// results = filtered products array
// query   = what user typed (for highlighting)
// ─────────────────────────────────────────
function showDropdown(results, query) {

  var dropdown = document.getElementById('searchDropdown');

  // If no results
  if (results.length === 0) {
    dropdown.innerHTML = '<div class="search-no-results">😕 No products found for "' + query + '"</div>';
    dropdown.classList.add('active'); // show the box
    return;
  }

  // Show max 5 suggestions in dropdown
  // (we don't want it to be too long)
  var topResults = results.slice(0, 5);
  // .slice(0, 5) means take first 5 items from array

  var html = '';

  topResults.forEach(function(product) {

    // Highlight the matched text in the product name
    // e.g. search "head" → "Wire<mark>less head</mark>phones"
    var highlightedName = highlightText(product.name, query);

    var formattedPrice = Number(product.price).toLocaleString('en-IN');

    html += `
      <div class="search-item" onclick="selectSearchResult('${product.name}')">
        <div class="search-item-emoji">${product.emoji}</div>
        <div class="search-item-info">
          <div class="search-item-name">${highlightedName}</div>
          <div class="search-item-category">${product.category}</div>
        </div>
        <div class="search-item-price">₹${formattedPrice}</div>
      </div>
    `;
  });

  dropdown.innerHTML = html;
  dropdown.classList.add('active'); // show the dropdown
}


// ─────────────────────────────────────────
// FUNCTION: highlightText
//
// Wraps the matching text in <mark> tags
// so CSS can highlight it in yellow.
//
// Example:
//   text  = "Wireless Headphones"
//   query = "head"
//   result = "Wireless <mark>Head</mark>phones"
// ─────────────────────────────────────────
function highlightText(text, query) {

  // Create a case-insensitive regex from the query
  // 'gi' means global (all matches) + case insensitive
  var regex = new RegExp(query, 'gi');

  // Replace matched text with <mark>matched text</mark>
  return text.replace(regex, function(match) {
    return '<mark>' + match + '</mark>';
  });
}


// ─────────────────────────────────────────
// FUNCTION: selectSearchResult
//
// Called when user clicks a suggestion.
// Fills the search box with that product name
// and filters the grid.
// ─────────────────────────────────────────
function selectSearchResult(productName) {

  // Put the product name in the search box
  document.getElementById('searchInput').value = productName;

  // Close the dropdown
  closeDropdown();

  // Filter products for this name
  var results = allProducts.filter(function(product) {
    return product.name.toLowerCase() === productName.toLowerCase();
  });

  renderProducts(results);
  updateSectionTitle(productName, results.length);
}


// ─────────────────────────────────────────
// FUNCTION: closeDropdown
// Hides the suggestions dropdown
// ─────────────────────────────────────────
function closeDropdown() {
  var dropdown = document.getElementById('searchDropdown');
  dropdown.classList.remove('active');
  dropdown.innerHTML = '';
}


// ─────────────────────────────────────────
// FUNCTION: updateSectionTitle
// Updates the heading above products grid
// to show search results info
// ─────────────────────────────────────────
function updateSectionTitle(query, count) {
  document.getElementById('productsTag').textContent     = 'Search Results';
  document.getElementById('productsTitle').textContent   = 'Results for "' + query + '"';
  document.getElementById('productsSubtitle').textContent = count + ' product(s) found';
}


// ─────────────────────────────────────────
// FUNCTION: resetSectionTitle
// Resets heading back to default
// ─────────────────────────────────────────
function resetSectionTitle() {
  document.getElementById('productsTag').textContent     = 'Handpicked for you';
  document.getElementById('productsTitle').textContent   = 'Featured Products';
  document.getElementById('productsSubtitle').textContent = 'Our most popular picks this week';
}


// ─────────────────────────────────────────
// FUNCTION: filterByCategory
// Called when user clicks a category card
// ─────────────────────────────────────────
function filterByCategory(categoryName) {

  selectedCategory = categoryName;

  // Clear the search box when filtering by category
  document.getElementById('searchInput').value = '';
  closeDropdown();
  resetSectionTitle();

  // Highlight selected category card
  highlightCategory(categoryName);

  // Scroll to products section
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });

  if (categoryName === 'All') {
    renderProducts(allProducts);
  } else {
    var filtered = allProducts.filter(function(product) {
      return product.category === categoryName;
    });
    renderProducts(filtered);

    // Update title to show category name
    document.getElementById('productsTag').textContent     = 'Category';
    document.getElementById('productsTitle').textContent   = categoryName;
    document.getElementById('productsSubtitle').textContent = filtered.length + ' products found';
  }
}


// ─────────────────────────────────────────
// FUNCTION: highlightCategory
// Makes the clicked category card look selected
// ─────────────────────────────────────────
function highlightCategory(categoryName) {

  var allCards = document.querySelectorAll('.category-card');

  allCards.forEach(function(card) {
    var cardCategory = card.getAttribute('data-category');
    if (cardCategory === categoryName) {
      card.style.borderColor = '#2874f0';
      card.style.background  = 'rgba(40,116,240,0.1)';
    } else {
      card.style.borderColor = '';
      card.style.background  = '';
    }
  });
}


// ─────────────────────────────────────────
// FUNCTION: renderProducts
// Creates HTML product cards from array
// ─────────────────────────────────────────
function renderProducts(products) {

  var grid = document.getElementById('productsGrid');
  grid.innerHTML = '';

  if (products.length === 0) {
    grid.innerHTML = '<p style="text-align:center; color:#888; padding:40px; grid-column:1/-1;">😕 No products found.</p>';
    return;
  }

  products.forEach(function(product) {

    var badgeHTML = '';
    if (product.badge !== null && product.badge !== '') {
      var badgeClass = 'badge-sale';
      if (product.badge === 'New') { badgeClass = 'badge-new'; }
      if (product.badge === 'Hot') { badgeClass = 'badge-hot'; }
      badgeHTML = '<div class="product-badge ' + badgeClass + '">' + product.badge + '</div>';
    }

    var oldPriceHTML = '';
    if (product.old_price !== null && product.old_price !== '') {
      oldPriceHTML = '<span class="product-old-price">₹' + Number(product.old_price).toLocaleString('en-IN') + '</span>';
    }

    var starsHTML      = getStars(product.rating);
    var formattedPrice = Number(product.price).toLocaleString('en-IN');

    var cardHTML = `
      <div class="product-card">
        ${badgeHTML}
        <div class="product-image">${product.emoji}</div>
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <div class="product-name">${product.name}</div>
          <div class="product-rating">${starsHTML}<span>(${product.reviews})</span></div>
          <div class="product-footer">
            <div>
              <span class="product-price">₹${formattedPrice}</span>
              ${oldPriceHTML}
            </div>
            <button class="btn-add-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.emoji}')">+</button>
          </div>
        </div>
      </div>
    `;

    grid.innerHTML += cardHTML;
  });
}


// ─────────────────────────────────────────
// FUNCTION: getStars
// 4.5 → ★★★★☆ 4.5
// ─────────────────────────────────────────
function getStars(rating) {
  var stars    = '';
  var fullStars = Math.floor(rating);
  for (var i = 1; i <= 5; i++) {
    stars += (i <= fullStars) ? '★' : '☆';
  }
  return stars + ' ' + rating;
}


// ─────────────────────────────────────────
// CLOSE DROPDOWN when user clicks anywhere
// else on the page (outside search box)
// ─────────────────────────────────────────
document.addEventListener('click', function(event) {

  var searchBox = document.querySelector('.search-box');

  // If click was OUTSIDE the search box → close dropdown
  if (!searchBox.contains(event.target)) {
    closeDropdown();
  }
});


// Run when page loads
loadProducts();
