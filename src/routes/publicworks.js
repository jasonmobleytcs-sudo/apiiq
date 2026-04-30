const express = require('express');
const db = require('../db');
const router = express.Router();

// Lookup resident by account number
// GET /api/publicworks/account/:accountNumber
router.get('/account/:accountNumber', (req, res) => {
  const resident = db.prepare(
    'SELECT id, name, gender, address, phone, account_number, service_type, pickup_day, last_inspection, inspection_result, balance, email FROM pw_residents WHERE account_number = ?'
  ).get(req.params.accountNumber.toUpperCase());

  if (!resident) {
    return res.status(404).json({ success: false, message: 'Account not found' });
  }
  res.json({ success: true, data: resident });
});

// Lookup resident by phone number
// GET /api/publicworks/phone/:phone
router.get('/phone/:phone', (req, res) => {
  const phone = req.params.phone.replace(/\D/g, '');
  const resident = db.prepare(
    "SELECT id, name, gender, address, phone, account_number, service_type, pickup_day, last_inspection, inspection_result, balance, email FROM pw_residents WHERE REPLACE(REPLACE(REPLACE(phone,'-',''),'(',''),')','') = ?"
  ).get(phone);

  if (!resident) {
    return res.status(404).json({ success: false, message: 'No account found for that phone number' });
  }
  res.json({ success: true, data: resident });
});

// Verify PIN for account (IVR authentication)
// POST /api/publicworks/verify-pin
// Body: { account_number, pin }
router.post('/verify-pin', (req, res) => {
  const { account_number, pin } = req.body;
  if (!account_number || !pin) {
    return res.status(400).json({ success: false, message: 'account_number and pin are required' });
  }

  const resident = db.prepare(
    'SELECT id, name, account_number, pin FROM pw_residents WHERE account_number = ?'
  ).get(account_number.toUpperCase());

  if (!resident) {
    return res.status(404).json({ success: false, authenticated: false, message: 'Account not found' });
  }

  if (resident.pin !== String(pin)) {
    return res.status(401).json({ success: false, authenticated: false, message: 'Invalid PIN' });
  }

  res.json({ success: true, authenticated: true, account_number: resident.account_number, name: resident.name });
});

// Get service details for an account
// GET /api/publicworks/account/:accountNumber/services
router.get('/account/:accountNumber/services', (req, res) => {
  const resident = db.prepare(
    'SELECT account_number, name, service_type, pickup_day, last_inspection, inspection_result FROM pw_residents WHERE account_number = ?'
  ).get(req.params.accountNumber.toUpperCase());

  if (!resident) {
    return res.status(404).json({ success: false, message: 'Account not found' });
  }
  res.json({ success: true, data: resident });
});

// Get balance for an account
// GET /api/publicworks/account/:accountNumber/balance
router.get('/account/:accountNumber/balance', (req, res) => {
  const resident = db.prepare(
    'SELECT account_number, name, balance FROM pw_residents WHERE account_number = ?'
  ).get(req.params.accountNumber.toUpperCase());

  if (!resident) {
    return res.status(404).json({ success: false, message: 'Account not found' });
  }
  res.json({ success: true, data: resident });
});

// Get inspection status for an account
// GET /api/publicworks/account/:accountNumber/inspection
router.get('/account/:accountNumber/inspection', (req, res) => {
  const resident = db.prepare(
    'SELECT account_number, name, address, last_inspection, inspection_result FROM pw_residents WHERE account_number = ?'
  ).get(req.params.accountNumber.toUpperCase());

  if (!resident) {
    return res.status(404).json({ success: false, message: 'Account not found' });
  }
  res.json({ success: true, data: resident });
});

// Update balance (pay bill)
// PATCH /api/publicworks/account/:accountNumber/balance
// Body: { amount }
router.patch('/account/:accountNumber/balance', (req, res) => {
  const { amount } = req.body;
  if (amount === undefined || isNaN(Number(amount))) {
    return res.status(400).json({ success: false, message: 'Valid amount is required' });
  }

  const resident = db.prepare(
    'SELECT account_number, name, balance FROM pw_residents WHERE account_number = ?'
  ).get(req.params.accountNumber.toUpperCase());

  if (!resident) {
    return res.status(404).json({ success: false, message: 'Account not found' });
  }

  const newBalance = Math.max(0, resident.balance - Number(amount));
  db.prepare('UPDATE pw_residents SET balance = ? WHERE account_number = ?')
    .run(newBalance, resident.account_number);

  res.json({
    success: true,
    message: 'Payment applied',
    data: {
      account_number: resident.account_number,
      previous_balance: resident.balance,
      payment_amount: Number(amount),
      new_balance: newBalance
    }
  });
});

// List all residents (admin/demo use)
// GET /api/publicworks/residents
router.get('/residents', (req, res) => {
  const residents = db.prepare(
    'SELECT id, name, account_number, phone, service_type, pickup_day, balance, inspection_result FROM pw_residents ORDER BY id'
  ).all();
  res.json({ success: true, count: residents.length, data: residents });
});

// Create a new resident
// POST /api/publicworks/residents
router.post('/residents', (req, res) => {
  const { name, gender, address, phone, account_number, pin, service_type, pickup_day, last_inspection, inspection_result, balance, email } = req.body;
  if (!name || !address || !phone || !account_number || !pin || !service_type) {
    return res.status(400).json({ success: false, message: 'name, address, phone, account_number, pin, service_type are required' });
  }
  try {
    const result = db.prepare(`
      INSERT INTO pw_residents (name, gender, address, phone, account_number, pin, service_type, pickup_day, last_inspection, inspection_result, balance, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, gender || null, address, phone, account_number.toUpperCase(), String(pin), service_type, pickup_day || null, last_inspection || null, inspection_result || null, balance ?? 0, email || null);
    const created = db.prepare('SELECT * FROM pw_residents WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Account number already exists' });
    }
    throw err;
  }
});

// Update a resident
// PUT /api/publicworks/account/:accountNumber
router.put('/account/:accountNumber', (req, res) => {
  const existing = db.prepare('SELECT * FROM pw_residents WHERE account_number = ?').get(req.params.accountNumber.toUpperCase());
  if (!existing) return res.status(404).json({ success: false, message: 'Account not found' });

  const { name, gender, address, phone, pin, service_type, pickup_day, last_inspection, inspection_result, balance, email } = req.body;
  db.prepare(`
    UPDATE pw_residents SET
      name = ?, gender = ?, address = ?, phone = ?, pin = ?,
      service_type = ?, pickup_day = ?, last_inspection = ?, inspection_result = ?, balance = ?, email = ?
    WHERE account_number = ?
  `).run(
    name ?? existing.name, gender ?? existing.gender, address ?? existing.address,
    phone ?? existing.phone, pin ? String(pin) : existing.pin,
    service_type ?? existing.service_type, pickup_day ?? existing.pickup_day,
    last_inspection ?? existing.last_inspection,
    inspection_result ?? existing.inspection_result, balance ?? existing.balance,
    email ?? existing.email, existing.account_number
  );
  const updated = db.prepare('SELECT * FROM pw_residents WHERE account_number = ?').get(existing.account_number);
  res.json({ success: true, data: updated });
});

// Delete a resident
// DELETE /api/publicworks/account/:accountNumber
router.delete('/account/:accountNumber', (req, res) => {
  const result = db.prepare('DELETE FROM pw_residents WHERE account_number = ?').run(req.params.accountNumber.toUpperCase());
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Account not found' });
  res.json({ success: true, message: 'Resident deleted' });
});

module.exports = router;
