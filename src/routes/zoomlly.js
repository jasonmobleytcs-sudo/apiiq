const express = require('express');
const db = require('../db');
const router = express.Router();

// ─── Customer Routes ──────────────────────────────────────────────────────────

// List all customers
// GET /api/zoomlly/customers
router.get('/customers', (req, res) => {
  const customers = db.prepare(
    'SELECT id, customer_id, first_name, last_name, phone, subscription_plan, subscription_status, loyalty_tier, loyalty_points, total_spend, preferred_genre, account_status FROM zj_customers ORDER BY id'
  ).all();
  res.json({ success: true, count: customers.length, data: customers });
});

// Get customer by customer ID
// GET /api/zoomlly/customer/:customerId
router.get('/customer/:customerId', (req, res) => {
  const customer = db.prepare(
    'SELECT * FROM zj_customers WHERE customer_id = ?'
  ).get(req.params.customerId.toUpperCase());

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  res.json({ success: true, data: customer });
});

// Lookup customer by phone number
// GET /api/zoomlly/phone/:phone
router.get('/phone/:phone', (req, res) => {
  const phone = req.params.phone.replace(/\D/g, '');
  const customer = db.prepare(
    "SELECT * FROM zj_customers WHERE REPLACE(REPLACE(REPLACE(phone,'-',''),'(',''),')','') = ?"
  ).get(phone);

  if (!customer) {
    return res.status(404).json({ success: false, message: 'No account found for that phone number' });
  }
  res.json({ success: true, data: customer });
});

// Verify PIN for customer account (IVR authentication)
// POST /api/zoomlly/verify-pin
// Body: { customer_id, pin }
router.post('/verify-pin', (req, res) => {
  const { customer_id, pin } = req.body;
  if (!customer_id || !pin) {
    return res.status(400).json({ success: false, message: 'customer_id and pin are required' });
  }

  const customer = db.prepare(
    'SELECT id, customer_id, first_name, last_name, pin FROM zj_customers WHERE customer_id = ?'
  ).get(customer_id.toUpperCase());

  if (!customer) {
    return res.status(404).json({ success: false, authenticated: false, message: 'Customer not found' });
  }

  if (customer.pin !== String(pin)) {
    return res.status(401).json({ success: false, authenticated: false, message: 'Invalid PIN' });
  }

  res.json({
    success: true,
    authenticated: true,
    customer_id: customer.customer_id,
    name: customer.first_name + ' ' + customer.last_name
  });
});

// Get subscription details for a customer
// GET /api/zoomlly/customer/:customerId/subscription
router.get('/customer/:customerId/subscription', (req, res) => {
  const customer = db.prepare(
    'SELECT customer_id, first_name, last_name, subscription_plan, subscription_status, subscription_renewal FROM zj_customers WHERE customer_id = ?'
  ).get(req.params.customerId.toUpperCase());

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  res.json({ success: true, data: customer });
});

// Get order history summary for a customer
// GET /api/zoomlly/customer/:customerId/orders
router.get('/customer/:customerId/orders', (req, res) => {
  const customer = db.prepare(
    'SELECT customer_id, first_name, last_name, last_order_id, last_order_date, last_order_amount, total_spend FROM zj_customers WHERE customer_id = ?'
  ).get(req.params.customerId.toUpperCase());

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  res.json({ success: true, data: customer });
});

// Get loyalty details for a customer
// GET /api/zoomlly/customer/:customerId/loyalty
router.get('/customer/:customerId/loyalty', (req, res) => {
  const customer = db.prepare(
    'SELECT customer_id, first_name, last_name, loyalty_tier, loyalty_points, store_credit, concert_credits FROM zj_customers WHERE customer_id = ?'
  ).get(req.params.customerId.toUpperCase());

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  res.json({ success: true, data: customer });
});

// Create a new customer
// POST /api/zoomlly/customers
router.post('/customers', (req, res) => {
  const {
    customer_id, pin, first_name, last_name, email, phone, address,
    member_since, subscription_plan, subscription_status, subscription_renewal,
    loyalty_tier, loyalty_points, total_spend, last_order_date, last_order_amount,
    last_order_id, account_status, preferred_genre, concert_credits, store_credit
  } = req.body;

  if (!customer_id || !pin || !first_name || !last_name || !phone) {
    return res.status(400).json({ success: false, message: 'customer_id, pin, first_name, last_name, and phone are required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO zj_customers
        (customer_id, pin, first_name, last_name, email, phone, address,
         member_since, subscription_plan, subscription_status, subscription_renewal,
         loyalty_tier, loyalty_points, total_spend, last_order_date, last_order_amount,
         last_order_id, account_status, preferred_genre, concert_credits, store_credit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      customer_id.toUpperCase(), String(pin), first_name, last_name,
      email || null, phone, address || null, member_since || null,
      subscription_plan || 'None', subscription_status || 'Active',
      subscription_renewal || null, loyalty_tier || 'Fan',
      loyalty_points ?? 0, total_spend ?? 0.00,
      last_order_date || null, last_order_amount ?? 0.00,
      last_order_id || null, account_status || 'Active',
      preferred_genre || null, concert_credits ?? 0, store_credit ?? 0.00
    );
    const created = db.prepare('SELECT * FROM zj_customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Customer ID already exists' });
    }
    throw err;
  }
});

// Update a customer
// PUT /api/zoomlly/customer/:customerId
router.put('/customer/:customerId', (req, res) => {
  const existing = db.prepare('SELECT * FROM zj_customers WHERE customer_id = ?').get(req.params.customerId.toUpperCase());
  if (!existing) return res.status(404).json({ success: false, message: 'Customer not found' });

  const {
    pin, first_name, last_name, email, phone, address,
    member_since, subscription_plan, subscription_status, subscription_renewal,
    loyalty_tier, loyalty_points, total_spend, last_order_date, last_order_amount,
    last_order_id, account_status, preferred_genre, concert_credits, store_credit
  } = req.body;

  db.prepare(`
    UPDATE zj_customers SET
      pin = ?, first_name = ?, last_name = ?, email = ?, phone = ?, address = ?,
      member_since = ?, subscription_plan = ?, subscription_status = ?,
      subscription_renewal = ?, loyalty_tier = ?, loyalty_points = ?,
      total_spend = ?, last_order_date = ?, last_order_amount = ?,
      last_order_id = ?, account_status = ?, preferred_genre = ?,
      concert_credits = ?, store_credit = ?
    WHERE customer_id = ?
  `).run(
    pin ? String(pin) : existing.pin,
    first_name ?? existing.first_name,
    last_name ?? existing.last_name,
    email ?? existing.email,
    phone ?? existing.phone,
    address ?? existing.address,
    member_since ?? existing.member_since,
    subscription_plan ?? existing.subscription_plan,
    subscription_status ?? existing.subscription_status,
    subscription_renewal ?? existing.subscription_renewal,
    loyalty_tier ?? existing.loyalty_tier,
    loyalty_points ?? existing.loyalty_points,
    total_spend ?? existing.total_spend,
    last_order_date ?? existing.last_order_date,
    last_order_amount ?? existing.last_order_amount,
    last_order_id ?? existing.last_order_id,
    account_status ?? existing.account_status,
    preferred_genre ?? existing.preferred_genre,
    concert_credits ?? existing.concert_credits,
    store_credit ?? existing.store_credit,
    existing.customer_id
  );

  const updated = db.prepare('SELECT * FROM zj_customers WHERE customer_id = ?').get(existing.customer_id);
  res.json({ success: true, data: updated });
});

// Delete a customer
// DELETE /api/zoomlly/customer/:customerId
router.delete('/customer/:customerId', (req, res) => {
  const result = db.prepare('DELETE FROM zj_customers WHERE customer_id = ?').run(req.params.customerId.toUpperCase());
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Customer not found' });
  res.json({ success: true, message: 'Customer deleted' });
});

// ─── Product Routes ───────────────────────────────────────────────────────────

// List all products
// GET /api/zoomlly/products
router.get('/products', (req, res) => {
  const products = db.prepare(
    'SELECT id, product_id, product_name, category, price, stock_qty, is_active, event_name, venue, event_date, sku FROM zj_products ORDER BY id'
  ).all();
  res.json({ success: true, count: products.length, data: products });
});

// Get product by product ID
// GET /api/zoomlly/product/:productId
router.get('/product/:productId', (req, res) => {
  const product = db.prepare(
    'SELECT * FROM zj_products WHERE product_id = ?'
  ).get(req.params.productId.toUpperCase());

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

// Get products by category
// GET /api/zoomlly/products/category/:category
router.get('/products/category/:category', (req, res) => {
  const category = decodeURIComponent(req.params.category);
  const products = db.prepare(
    'SELECT * FROM zj_products WHERE category = ? ORDER BY id'
  ).all(category);

  res.json({ success: true, count: products.length, data: products });
});

// Create a new product
// POST /api/zoomlly/products
router.post('/products', (req, res) => {
  const {
    product_id, product_name, category, description, price,
    stock_qty, is_active, event_name, venue, event_date, sku
  } = req.body;

  if (!product_id || !product_name || !category || price === undefined) {
    return res.status(400).json({ success: false, message: 'product_id, product_name, category, and price are required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO zj_products
        (product_id, product_name, category, description, price, stock_qty,
         is_active, event_name, venue, event_date, sku)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      product_id.toUpperCase(), product_name, category, description || null,
      Number(price), stock_qty ?? null, is_active ?? 1,
      event_name || null, venue || null, event_date || null, sku || null
    );
    const created = db.prepare('SELECT * FROM zj_products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Product ID already exists' });
    }
    throw err;
  }
});

// Update a product
// PUT /api/zoomlly/product/:productId
router.put('/product/:productId', (req, res) => {
  const existing = db.prepare('SELECT * FROM zj_products WHERE product_id = ?').get(req.params.productId.toUpperCase());
  if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

  const {
    product_name, category, description, price, stock_qty,
    is_active, event_name, venue, event_date, sku
  } = req.body;

  db.prepare(`
    UPDATE zj_products SET
      product_name = ?, category = ?, description = ?, price = ?, stock_qty = ?,
      is_active = ?, event_name = ?, venue = ?, event_date = ?, sku = ?
    WHERE product_id = ?
  `).run(
    product_name ?? existing.product_name,
    category ?? existing.category,
    description ?? existing.description,
    price !== undefined ? Number(price) : existing.price,
    stock_qty !== undefined ? stock_qty : existing.stock_qty,
    is_active !== undefined ? is_active : existing.is_active,
    event_name ?? existing.event_name,
    venue ?? existing.venue,
    event_date ?? existing.event_date,
    sku ?? existing.sku,
    existing.product_id
  );

  const updated = db.prepare('SELECT * FROM zj_products WHERE product_id = ?').get(existing.product_id);
  res.json({ success: true, data: updated });
});

// Delete a product
// DELETE /api/zoomlly/product/:productId
router.delete('/product/:productId', (req, res) => {
  const result = db.prepare('DELETE FROM zj_products WHERE product_id = ?').run(req.params.productId.toUpperCase());
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = router;
