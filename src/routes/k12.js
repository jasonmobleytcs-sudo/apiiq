const express = require('express');
const db = require('../db');
const router = express.Router();

// List all students
// GET /api/k12/students
router.get('/students', (req, res) => {
  const students = db.prepare(
    'SELECT id, student_id, first_name, last_name, grade, school, guardian_name, guardian_phone, enrollment_status, gpa, attendance_pct, lunch_balance FROM k12_students ORDER BY id'
  ).all();
  res.json({ success: true, count: students.length, data: students });
});

// Lookup student by student ID
// GET /api/k12/student/:studentId
router.get('/student/:studentId', (req, res) => {
  const student = db.prepare(
    'SELECT * FROM k12_students WHERE student_id = ?'
  ).get(req.params.studentId.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, data: student });
});

// Lookup student by guardian phone number
// GET /api/k12/phone/:phone
router.get('/phone/:phone', (req, res) => {
  const phone = req.params.phone.replace(/\D/g, '');
  const students = db.prepare(
    "SELECT * FROM k12_students WHERE REPLACE(REPLACE(REPLACE(guardian_phone,'-',''),'(',''),')','') = ?"
  ).all(phone);

  if (!students.length) {
    return res.status(404).json({ success: false, message: 'No students found for that phone number' });
  }
  res.json({ success: true, count: students.length, data: students });
});

// Verify PIN for student
// POST /api/k12/verify-pin
// Body: { student_id, pin }
router.post('/verify-pin', (req, res) => {
  const { student_id, pin } = req.body;
  if (!student_id || !pin) {
    return res.status(400).json({ success: false, message: 'student_id and pin are required' });
  }

  const student = db.prepare(
    'SELECT id, first_name, last_name, student_id, pin FROM k12_students WHERE student_id = ?'
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

// Get attendance info for a student
// GET /api/k12/student/:studentId/attendance
router.get('/student/:studentId/attendance', (req, res) => {
  const student = db.prepare(
    'SELECT student_id, first_name, last_name, attendance_pct, enrollment_status, grade, school FROM k12_students WHERE student_id = ?'
  ).get(req.params.studentId.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, data: student });
});

// Get lunch balance for a student
// GET /api/k12/student/:studentId/lunch
router.get('/student/:studentId/lunch', (req, res) => {
  const student = db.prepare(
    'SELECT student_id, first_name, last_name, lunch_balance FROM k12_students WHERE student_id = ?'
  ).get(req.params.studentId.toUpperCase());

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, data: student });
});

// Create a new student
// POST /api/k12/students
router.post('/students', (req, res) => {
  const { student_id, pin, first_name, last_name, date_of_birth, grade, school, homeroom_teacher,
          guardian_name, guardian_phone, guardian_email, address, enrollment_status, gpa,
          attendance_pct, bus_route, lunch_balance, iep } = req.body;

  if (!student_id || !pin || !first_name || !last_name || !guardian_name || !guardian_phone) {
    return res.status(400).json({ success: false, message: 'student_id, pin, first_name, last_name, guardian_name, and guardian_phone are required' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO k12_students
        (student_id, pin, first_name, last_name, date_of_birth, grade, school, homeroom_teacher,
         guardian_name, guardian_phone, guardian_email, address, enrollment_status, gpa,
         attendance_pct, bus_route, lunch_balance, iep)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      student_id.toUpperCase(), String(pin), first_name, last_name,
      date_of_birth || null, grade || null, school || null, homeroom_teacher || null,
      guardian_name, guardian_phone, guardian_email || null, address || null,
      enrollment_status || 'Active', gpa ?? null, attendance_pct ?? null,
      bus_route || null, lunch_balance ?? 0.00, iep || 'No'
    );
    const created = db.prepare('SELECT * FROM k12_students WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Student ID already exists' });
    }
    throw err;
  }
});

// Update a student
// PUT /api/k12/student/:studentId
router.put('/student/:studentId', (req, res) => {
  const existing = db.prepare('SELECT * FROM k12_students WHERE student_id = ?').get(req.params.studentId.toUpperCase());
  if (!existing) return res.status(404).json({ success: false, message: 'Student not found' });

  const { pin, first_name, last_name, date_of_birth, grade, school, homeroom_teacher,
          guardian_name, guardian_phone, guardian_email, address, enrollment_status, gpa,
          attendance_pct, bus_route, lunch_balance, iep } = req.body;

  db.prepare(`
    UPDATE k12_students SET
      pin = ?, first_name = ?, last_name = ?, date_of_birth = ?, grade = ?, school = ?,
      homeroom_teacher = ?, guardian_name = ?, guardian_phone = ?, guardian_email = ?,
      address = ?, enrollment_status = ?, gpa = ?, attendance_pct = ?,
      bus_route = ?, lunch_balance = ?, iep = ?
    WHERE student_id = ?
  `).run(
    pin ? String(pin) : existing.pin,
    first_name ?? existing.first_name, last_name ?? existing.last_name,
    date_of_birth ?? existing.date_of_birth, grade ?? existing.grade, school ?? existing.school,
    homeroom_teacher ?? existing.homeroom_teacher, guardian_name ?? existing.guardian_name,
    guardian_phone ?? existing.guardian_phone, guardian_email ?? existing.guardian_email,
    address ?? existing.address, enrollment_status ?? existing.enrollment_status,
    gpa ?? existing.gpa, attendance_pct ?? existing.attendance_pct,
    bus_route ?? existing.bus_route, lunch_balance ?? existing.lunch_balance,
    iep ?? existing.iep, existing.student_id
  );
  const updated = db.prepare('SELECT * FROM k12_students WHERE student_id = ?').get(existing.student_id);
  res.json({ success: true, data: updated });
});

// Delete a student
// DELETE /api/k12/student/:studentId
router.delete('/student/:studentId', (req, res) => {
  const result = db.prepare('DELETE FROM k12_students WHERE student_id = ?').run(req.params.studentId.toUpperCase());
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, message: 'Student deleted' });
});

module.exports = router;
