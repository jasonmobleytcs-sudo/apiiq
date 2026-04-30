const express = require('express');
const db = require('../db');
const router = express.Router();

// List all students
// GET /api/highered/students
router.get('/students', (req, res) => {
  const students = db.prepare(
    'SELECT id, student_id, first_name, last_name, email, phone, enrollment_status, major, gpa, credits_completed, credits_required, expected_graduation, advisor, housing, financial_aid_status, balance FROM he_students ORDER BY id'
  ).all();
  res.json({ success: true, count: students.length, data: students });
});

// Lookup student by student ID
// GET /api/highered/student/:studentId
router.get('/student/:studentId', (req, res) => {
  const student = db.prepare(
    'SELECT * FROM he_students WHERE student_id = ?'
  ).get(req.params.studentId.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, data: student });
});

// Lookup student by phone number
// GET /api/highered/phone/:phone
router.get('/phone/:phone', (req, res) => {
  const phone = req.params.phone.replace(/\D/g, '');
  const student = db.prepare(
    "SELECT * FROM he_students WHERE REPLACE(REPLACE(REPLACE(phone,'-',''),'(',''),')','') = ?"
  ).get(phone);

  if (!student) {
    return res.status(404).json({ success: false, message: 'No student found for that phone number' });
  }
  res.json({ success: true, data: student });
});

// Verify PIN for student (IVR authentication)
// POST /api/highered/verify-pin
// Body: { student_id, pin }
router.post('/verify-pin', (req, res) => {
  const { student_id, pin } = req.body;
  if (!student_id || !pin) {
    return res.status(400).json({ success: false, message: 'student_id and pin are required' });
  }

  const student = db.prepare(
    'SELECT id, first_name, last_name, student_id, pin FROM he_students WHERE student_id = ?'
  ).get(student_id.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, authenticated: false, message: 'Student not found' });
  }

  if (student.pin !== String(pin)) {
    return res.status(401).json({ success: false, authenticated: false, message: 'Invalid PIN' });
  }

  res.json({
    success: true,
    authenticated: true,
    student_id: student.student_id,
    name: `${student.first_name} ${student.last_name}`
  });
});

// Get academic info for a student
// GET /api/highered/student/:studentId/academic
router.get('/student/:studentId/academic', (req, res) => {
  const student = db.prepare(
    'SELECT student_id, first_name, last_name, major, gpa, credits_completed, credits_required, expected_graduation, advisor FROM he_students WHERE student_id = ?'
  ).get(req.params.studentId.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, data: student });
});

// Get financial info for a student
// GET /api/highered/student/:studentId/financial
router.get('/student/:studentId/financial', (req, res) => {
  const student = db.prepare(
    'SELECT student_id, first_name, last_name, balance, financial_aid_status FROM he_students WHERE student_id = ?'
  ).get(req.params.studentId.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, data: student });
});

// Create a new student
// POST /api/highered/students
router.post('/students', (req, res) => {
  const { student_id, pin, first_name, last_name, email, phone, date_of_birth, enrollment_status,
          major, gpa, credits_completed, credits_required, expected_graduation, advisor,
          housing, financial_aid_status, balance, address } = req.body;

  if (!student_id || !pin || !first_name || !last_name || !phone) {
    return res.status(400).json({ success: false, message: 'student_id, pin, first_name, last_name, and phone are required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO he_students
        (student_id, pin, first_name, last_name, email, phone, date_of_birth, enrollment_status,
         major, gpa, credits_completed, credits_required, expected_graduation, advisor,
         housing, financial_aid_status, balance, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      student_id.toUpperCase(), String(pin), first_name, last_name,
      email || null, phone, date_of_birth || null, enrollment_status || 'Active',
      major || null, gpa ?? null, credits_completed ?? 0, credits_required ?? 120,
      expected_graduation || null, advisor || null, housing || null,
      financial_aid_status || 'None', balance ?? 0.00, address || null
    );
    const created = db.prepare('SELECT * FROM he_students WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Student ID already exists' });
    }
    throw err;
  }
});

// Update a student
// PUT /api/highered/student/:studentId
router.put('/student/:studentId', (req, res) => {
  const existing = db.prepare('SELECT * FROM he_students WHERE student_id = ?').get(req.params.studentId.toUpperCase());
  if (!existing) return res.status(404).json({ success: false, message: 'Student not found' });

  const { pin, first_name, last_name, email, phone, date_of_birth, enrollment_status,
          major, gpa, credits_completed, credits_required, expected_graduation, advisor,
          housing, financial_aid_status, balance, address } = req.body;

  db.prepare(`
    UPDATE he_students SET
      pin = ?, first_name = ?, last_name = ?, email = ?, phone = ?, date_of_birth = ?,
      enrollment_status = ?, major = ?, gpa = ?, credits_completed = ?, credits_required = ?,
      expected_graduation = ?, advisor = ?, housing = ?, financial_aid_status = ?, balance = ?, address = ?
    WHERE student_id = ?
  `).run(
    pin ? String(pin) : existing.pin,
    first_name ?? existing.first_name, last_name ?? existing.last_name,
    email ?? existing.email, phone ?? existing.phone,
    date_of_birth ?? existing.date_of_birth, enrollment_status ?? existing.enrollment_status,
    major ?? existing.major, gpa ?? existing.gpa,
    credits_completed ?? existing.credits_completed, credits_required ?? existing.credits_required,
    expected_graduation ?? existing.expected_graduation, advisor ?? existing.advisor,
    housing ?? existing.housing, financial_aid_status ?? existing.financial_aid_status,
    balance ?? existing.balance, address ?? existing.address,
    existing.student_id
  );
  const updated = db.prepare('SELECT * FROM he_students WHERE student_id = ?').get(existing.student_id);
  res.json({ success: true, data: updated });
});

// Delete a student
// DELETE /api/highered/student/:studentId
router.delete('/student/:studentId', (req, res) => {
  const result = db.prepare('DELETE FROM he_students WHERE student_id = ?').run(req.params.studentId.toUpperCase());
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, message: 'Student deleted' });
});

module.exports = router;
