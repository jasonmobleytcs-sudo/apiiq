const express = require('express');
const db = require('../db');
const router = express.Router();

// List all customers
// GET /api/retail/customers
router.get('/customers', (req, res) => {
  const customers = db.prepare(
    'SELECT id, customer_id, first_name, last_name, phone, loyalty_tier, loyalty_points, total_spend, last_purchase_date, account_status FROM retail_customers ORDER BY id'
  ).all();
  res.json({ success: true, count: customers.length, data: customers });
});

// Lookup customer by customer ID
// GET /api/retail/customer/:customerId
router.get('/customer/:customerId', (req, res) => {
  const customer = db.prepare(
    'SELECT * FROM retail_customers WHERE customer_id = ?'
  ).get(req.params.customerId.toUpperCase());

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  res.json({ success: true, data: customer });
});

// Lookup customer by phone number
// GET /api/retail/phone/:phone
router.get('/phone/:phone', (req, res) => {
  const phone = req.params.phone.replace(/\D/g, '');
  const customer = db.prepare(
    "SELECT * FROM retail_customers WHERE REPLACE(REPLACE(REPLACE(phone,'-',''),'(',''),')','') = ?"
  ).get(phone);

  if (!customer) {
    return res.status(404).json({ success: false, message: 'No customer found for that phone number' });
  }
  res.json({ success: true, data: customer });
});

// Verify PIN for customer
// POST /api/retail/verify-pin
// Body: { customer_id, pin }
router.post('/verify-pin', (req, res) => {
  const { customer_id, pin } = req.body;
  if (!customer_id || !pin) {
    return res.status(400).json({ success: false, message: 'customer_id and pin are required' });
  }

  const customer = db.prepare(
    'SELECT id, first_name, last_name, customer_id, pin FROM retail_customers WHERE customer_id = ?'
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
    name: `${customer.first_name} ${customer.last_name}`
  });
});

// Get loyalty info for a customer
// GET /api/retail/customer/:customerId/loyalty
router.get('/customer/:customerId/loyalty', (req, res) => {
  const customer = db.prepare(
    'SELECT customer_id, first_name, last_name, loyalty_tier, loyalty_points, total_spend FROM retail_customers WHERE customer_id = ?'
  ).get(req.params.customerId.toUpperCase());

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  res.json({ success: true, data: customer });
});

// Get order/purchase info for a customer
// GET /api/retail/customer/:customerId/orders
router.get('/customer/:customerId/orders', (req, res) => {
  const customer = db.prepare(
    'SELECT customer_id, first_name, last_name, last_purchase_date, last_purchase_amount, store_credit FROM retail_customers WHERE customer_id = ?'
  ).get(req.params.customerId.toUpperCase());

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  res.json({ success: true, data: customer });
});

// Create a new customer
// POST /api/retail/customers
router.post('/customers', (req, res) => {
  const { customer_id, pin, first_name, last_name, email, phone, address, loyalty_tier,
          loyalty_points, total_spend, last_purchase_date, last_purchase_amount,
          member_since, preferred_store, account_status, store_credit } = req.body;

  if (!customer_id || !pin || !first_name || !last_name || !phone) {
    return res.status(400).json({ success: false, message: 'customer_id, pin, first_name, last_name, and phone are required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO retail_customers
        (customer_id, pin, first_name, last_name, email, phone, address, loyalty_tier,
         loyalty_points, total_spend, last_purchase_date, last_purchase_amount,
         member_since, preferred_store, account_status, store_credit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      customer_id.toUpperCase(), String(pin), first_name, last_name,
      email || null, phone, address || null, loyalty_tier || 'Bronze',
      loyalty_points ?? 0, total_spend ?? 0.00,
      last_purchase_date || null, last_purchase_amount ?? 0.00,
      member_since || null, preferred_store || null,
      account_status || 'Active', store_credit ?? 0.00
    );
    const created = db.prepare('SELECT * FROM retail_customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Customer ID already exists' });
    }
    throw err;
  }
});

// Update a customer
// PUT /api/retail/customer/:customerId
router.put('/customer/:customerId', (req, res) => {
  const existing = db.prepare('SELECT * FROM retail_customers WHERE customer_id = ?').get(req.params.customerId.toUpperCase());
  if (!existing) return res.status(404).json({ success: false, message: 'Customer not found' });

  const { pin, first_name, last_name, email, phone, address, loyalty_tier,
          loyalty_points, total_spend, last_purchase_date, last_purchase_amount,
          member_since, preferred_store, account_status, store_credit } = req.body;

  db.prepare(`
    UPDATE retail_customers SET
      pin = ?, first_name = ?, last_name = ?, email = ?, phone = ?, address = ?,
      loyalty_tier = ?, loyalty_points = ?, total_spend = ?, last_purchase_date = ?,
      last_purchase_amount = ?, member_since = ?, preferred_store = ?, account_status = ?, store_credit = ?
    WHERE customer_id = ?
  `).run(
    pin ? String(pin) : existing.pin,
    first_name ?? existing.first_name, last_name ?? existing.last_name,
    email ?? existing.email, phone ?? existing.phone, address ?? existing.address,
    loyalty_tier ?? existing.loyalty_tier, loyalty_points ?? existing.loyalty_points,
    total_spend ?? existing.total_spend, last_purchase_date ?? existing.last_purchase_date,
    last_purchase_amount ?? existing.last_purchase_amount, member_since ?? existing.member_since,
    preferred_store ?? existing.preferred_store, account_status ?? existing.account_status,
    store_credit ?? existing.store_credit, existing.customer_id
  );
  const updated = db.prepare('SELECT * FROM retail_customers WHERE customer_id = ?').get(existing.customer_id);
  res.json({ success: true, data: updated });
});

// Delete a customer
// DELETE /api/retail/customer/:customerId
router.delete('/customer/:customerId', (req, res) => {
  const result = db.prepare('DELETE FROM retail_customers WHERE customer_id = ?').run(req.params.customerId.toUpperCase());
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Customer not found' });
  res.json({ success: true, message: 'Customer deleted' });
});

module.exports = router;
