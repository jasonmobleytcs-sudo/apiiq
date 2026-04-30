const express = require('express');
const db = require('../db');
const router = express.Router();

// List all cases
// GET /api/legal/cases
router.get('/cases', (req, res) => {
  const cases = db.prepare(
    'SELECT id, case_number, client_name, client_phone, case_type, case_status, attorney, next_hearing_date, balance_due, docket_number FROM legal_cases ORDER BY id'
  ).all();
  res.json({ success: true, count: cases.length, data: cases });
});

// Lookup case by case number
// GET /api/legal/case/:caseNumber
router.get('/case/:caseNumber', (req, res) => {
  const legalCase = db.prepare(
    'SELECT * FROM legal_cases WHERE case_number = ?'
  ).get(req.params.caseNumber.toUpperCase());

  if (!legalCase) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }
  res.json({ success: true, data: legalCase });
});

// Lookup case by client phone number
// GET /api/legal/phone/:phone
router.get('/phone/:phone', (req, res) => {
  const phone = req.params.phone.replace(/\D/g, '');
  const cases = db.prepare(
    "SELECT * FROM legal_cases WHERE REPLACE(REPLACE(REPLACE(client_phone,'-',''),'(',''),')','') = ?"
  ).all(phone);

  if (!cases.length) {
    return res.status(404).json({ success: false, message: 'No cases found for that phone number' });
  }
  res.json({ success: true, count: cases.length, data: cases });
});

// Verify PIN for case (IVR authentication)
// POST /api/legal/verify-pin
// Body: { case_number, pin }
router.post('/verify-pin', (req, res) => {
  const { case_number, pin } = req.body;
  if (!case_number || !pin) {
    return res.status(400).json({ success: false, message: 'case_number and pin are required' });
  }

  const legalCase = db.prepare(
    'SELECT id, client_name, case_number, pin FROM legal_cases WHERE case_number = ?'
  ).get(case_number.toUpperCase());

  if (!legalCase) {
    return res.status(404).json({ success: false, authenticated: false, message: 'Case not found' });
  }

  if (legalCase.pin !== String(pin)) {
    return res.status(401).json({ success: false, authenticated: false, message: 'Invalid PIN' });
  }

  res.json({
    success: true,
    authenticated: true,
    case_number: legalCase.case_number,
    client_name: legalCase.client_name
  });
});

// Get case status
// GET /api/legal/case/:caseNumber/status
router.get('/case/:caseNumber/status', (req, res) => {
  const legalCase = db.prepare(
    'SELECT case_number, client_name, case_status, next_hearing_date, attorney, court FROM legal_cases WHERE case_number = ?'
  ).get(req.params.caseNumber.toUpperCase());

  if (!legalCase) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }
  res.json({ success: true, data: legalCase });
});

// Get billing info for a case
// GET /api/legal/case/:caseNumber/billing
router.get('/case/:caseNumber/billing', (req, res) => {
  const legalCase = db.prepare(
    'SELECT case_number, client_name, retainer_amount, balance_due FROM legal_cases WHERE case_number = ?'
  ).get(req.params.caseNumber.toUpperCase());

  if (!legalCase) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }
  res.json({ success: true, data: legalCase });
});

// Create a new case
// POST /api/legal/cases
router.post('/cases', (req, res) => {
  const { case_number, pin, client_name, client_email, client_phone, client_address, case_type,
          case_status, attorney, opposing_party, court, filed_date, next_hearing_date,
          retainer_amount, balance_due, docket_number } = req.body;

  if (!case_number || !pin || !client_name || !client_phone) {
    return res.status(400).json({ success: false, message: 'case_number, pin, client_name, and client_phone are required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO legal_cases
        (case_number, pin, client_name, client_email, client_phone, client_address, case_type,
         case_status, attorney, opposing_party, court, filed_date, next_hearing_date,
         retainer_amount, balance_due, docket_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      case_number.toUpperCase(), String(pin), client_name, client_email || null, client_phone,
      client_address || null, case_type || null, case_status || 'Open',
      attorney || null, opposing_party || null, court || null,
      filed_date || null, next_hearing_date || null,
      retainer_amount ?? 0.00, balance_due ?? 0.00, docket_number || null
    );
    const created = db.prepare('SELECT * FROM legal_cases WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Case number already exists' });
    }
    throw err;
  }
});

// Update a case
// PUT /api/legal/case/:caseNumber
router.put('/case/:caseNumber', (req, res) => {
  const existing = db.prepare('SELECT * FROM legal_cases WHERE case_number = ?').get(req.params.caseNumber.toUpperCase());
  if (!existing) return res.status(404).json({ success: false, message: 'Case not found' });

  const { pin, client_name, client_email, client_phone, client_address, case_type,
          case_status, attorney, opposing_party, court, filed_date, next_hearing_date,
          retainer_amount, balance_due, docket_number } = req.body;

  db.prepare(`
    UPDATE legal_cases SET
      pin = ?, client_name = ?, client_email = ?, client_phone = ?, client_address = ?,
      case_type = ?, case_status = ?, attorney = ?, opposing_party = ?, court = ?,
      filed_date = ?, next_hearing_date = ?, retainer_amount = ?, balance_due = ?, docket_number = ?
    WHERE case_number = ?
  `).run(
    pin ? String(pin) : existing.pin,
    client_name ?? existing.client_name, client_email ?? existing.client_email,
    client_phone ?? existing.client_phone, client_address ?? existing.client_address,
    case_type ?? existing.case_type, case_status ?? existing.case_status,
    attorney ?? existing.attorney, opposing_party ?? existing.opposing_party,
    court ?? existing.court, filed_date ?? existing.filed_date,
    next_hearing_date ?? existing.next_hearing_date,
    retainer_amount ?? existing.retainer_amount, balance_due ?? existing.balance_due,
    docket_number ?? existing.docket_number, existing.case_number
  );
  const updated = db.prepare('SELECT * FROM legal_cases WHERE case_number = ?').get(existing.case_number);
  res.json({ success: true, data: updated });
});

// Delete a case
// DELETE /api/legal/case/:caseNumber
router.delete('/case/:caseNumber', (req, res) => {
  const result = db.prepare('DELETE FROM legal_cases WHERE case_number = ?').run(req.params.caseNumber.toUpperCase());
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Case not found' });
  res.json({ success: true, message: 'Case deleted' });
});

module.exports = router;
