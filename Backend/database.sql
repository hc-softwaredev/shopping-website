-- Create  database
CREATE DATABASE IF NOT EXISTS shopnow_db;

--  Select/use database
USE shopnow_db;

-- TABLE 1: users
-- Stores registered user accounts

CREATE TABLE IF NOT EXISTS users (

  id          INT AUTO_INCREMENT PRIMARY KEY,
  -- AUTO_INCREMENT = each user gets a unique number (1, 2, 3...)
  -- PRIMARY KEY = this is the main identifier for each row

  name        VARCHAR(100) NOT NULL,
  -- VARCHAR(100) = text up to 100 characters
  -- NOT NULL = cannot be empty

  email       VARCHAR(150) NOT NULL UNIQUE,
  -- UNIQUE = no two users can have the same email

  phone       VARCHAR(15),
  -- No NOT NULL = phone is optional

  password    VARCHAR(255) NOT NULL,
  -- We store HASHED password (never plain text!)
  -- password_hash() makes it 60+ chars, so 255 is safe

  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  -- Automatically saves the date/time when user registered

);


-- =========================================
-- TABLE 2: products
-- Stores all products in the store
-- =========================================
CREATE TABLE IF NOT EXISTS products (

  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  category    VARCHAR(100) NOT NULL,
  price       DECIMAL(10, 2) NOT NULL,
  -- DECIMAL(10,2) = number like 1299.00 (good for money)

  old_price   DECIMAL(10, 2),
  -- NULL allowed = not all products have a discount

  rating      DECIMAL(2, 1) DEFAULT 4.0,
  -- e.g. 4.5

  reviews     INT DEFAULT 0,
  badge       VARCHAR(20),
  -- e.g. "Sale", "New", "Hot" or NULL

  emoji       VARCHAR(10),
  -- e.g. "🎧"

  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);



-- TABLE 3: orders
-- Stores each order placed by a user

CREATE TABLE IF NOT EXISTS orders (

  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  -- Which user placed this order

  total       DECIMAL(10, 2) NOT NULL,
  status      VARCHAR(50) DEFAULT 'pending',
  -- 'pending', 'confirmed', 'shipped', 'delivered'

  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- FOREIGN KEY links user_id to users table
  -- If user is deleted, their orders are also deleted
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

);


-- TABLE 4: order_items
-- Each row = one product inside an order
-- (An order can have multiple products)
CREATE TABLE IF NOT EXISTS order_items (

  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL,
  price       DECIMAL(10, 2) NOT NULL,
  -- save price AT TIME OF ORDER change later

  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE

);



-- INSERT SAMPLE PRODUCTS
INSERT INTO products (name, category, price, old_price, rating, reviews, badge, emoji) VALUES
('Wireless Headphones', 'Electronics', 1299.00, 1799.00, 4.5, 238, 'Sale',  '🎧'),
('Running Sneakers',    'Fashion',      899.00,     NULL, 4.7, 154,  NULL,  '👟'),
('Smart Watch',         'Electronics', 2499.00, 3299.00, 4.8, 412, 'Hot',  '⌚'),
('Cotton Kurta Set',    'Fashion',      499.00,  799.00, 4.3,  89, 'Sale', '👘'),
('Coffee Maker',        'Home',        1599.00,     NULL, 4.6, 201, 'New',  '☕'),
('Yoga Mat',            'Sports',       349.00,  499.00, 4.4,  76,  NULL,  '🧘'),
('Face Serum Kit',      'Beauty',       799.00, 1099.00, 4.7, 333, 'Sale', '💆'),
('Bluetooth Speaker',   'Electronics',  999.00,     NULL, 4.5, 187,  NULL, '🔊');
