// ============================================
// products.js
//
// This file stores product data.
// Think of it as a "fake database" for now.
// Later this data comes from MySQL directly.
//
// WHAT IS AN ARRAY?
// An array is a list. We write it with [ ]
// Example: var fruits = ["apple", "mango", "banana"];
//
// WHAT IS AN OBJECT?
// An object stores related info together. We write it with { }
// Example: var person = { name: "Rahul", age: 22 };
//
// Here we have an ARRAY of OBJECTS.
// Each object = one product.
// ============================================

var products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 1299,
    oldPrice: 1799,
    rating: 4.5,
    reviews: 238,
    badge: "Sale",
    emoji: "🎧"
  },
  {
    id: 2,
    name: "Running Sneakers",
    category: "Fashion",
    price: 899,
    oldPrice: null,   // null means no old price (no discount)
    rating: 4.7,
    reviews: 154,
    badge: null,      // null means no badge
    emoji: "👟"
  },
  {
    id: 3,
    name: "Smart Watch",
    category: "Electronics",
    price: 2499,
    oldPrice: 3299,
    rating: 4.8,
    reviews: 412,
    badge: "Hot",
    emoji: "⌚"
  },
  {
    id: 4,
    name: "Cotton Kurta Set",
    category: "Fashion",
    price: 499,
    oldPrice: 799,
    rating: 4.3,
    reviews: 89,
    badge: "Sale",
    emoji: "👘"
  },
  {
    id: 5,
    name: "Coffee Maker",
    category: "Home",
    price: 1599,
    oldPrice: null,
    rating: 4.6,
    reviews: 201,
    badge: "New",
    emoji: "☕"
  },
  {
    id: 6,
    name: "Yoga Mat",
    category: "Sports",
    price: 349,
    oldPrice: 499,
    rating: 4.4,
    reviews: 76,
    badge: null,
    emoji: "🧘"
  },
  {
    id: 7,
    name: "Face Serum Kit",
    category: "Beauty",
    price: 799,
    oldPrice: 1099,
    rating: 4.7,
    reviews: 333,
    badge: "Sale",
    emoji: "💆"
  },
  {
    id: 8,
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: 999,
    oldPrice: null,
    rating: 4.5,
    reviews: 187,
    badge: null,
    emoji: "🔊"
  }
];
