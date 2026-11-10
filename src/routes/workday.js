const express = require('express');
const db = require('../db');
const router = express.Router();

// Workday HCM demo API.
//
// The shape mirrors how a real Workday integration is consumed by an agent desktop:
// one call on ANI returns everything the agent needs to open the conversation, and
// the detail endpoints exist for drill-down and write-back. Agent IQ uses
// GET /api/workday/phone/:phone for the screen pop.

const WORKER_COLS = `
  worker_id, employee_id, legal_first_name, legal_last_name, preferred_name,
  work_email, mobile_phone, work_phone, business_title, job_profile, job_family,
  management_level, supervisory_org, cost_center, department, location,
  time_type, worker_type, manager_name, manager_worker_id, hire_date,
  length_of_service, employment_status, compensation_grade, pay_rate_type, pay_group,
  pto_balance_hours, sick_balance_hours, pto_taken_ytd, benefits_plan,
  retirement_enrolled, last_review_rating, next_review_date,
  emergency_contact_name, emergency_contact_phone
`;

// Strips formatting so 850-217-6664, (850) 217-6664 and 18502176664 all match.
function digits(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return d;
}

const PHONE_MATCH = `
  REPLACE(REPLACE(REPLACE(REPLACE(%COL%, '-', ''), '(', ''), ')', ''), ' ', '')
`;

// Assembles the full worker view: profile, absence history and HR cases in one
// object. This is what the screen pop renders, so it is kept in one place rather
// than three round trips from the panel.
function buildProfile(worker) {
  const timeOff = db.prepare(
    'SELECT * FROM wd_time_off WHERE worker_id = ? ORDER BY start_date DESC'
  ).all(worker.worker_id);

  const cases = db.prepare(
    'SELECT * FROM wd_hr_cases WHERE worker_id = ? ORDER BY opened_date DESC'
  ).all(worker.worker_id);

  const openCases    = cases.filter(c => !['Resolved', 'Closed'].includes(c.status));
  const pendingTime  = timeOff.filter(t => t.status === 'Submitted');

  return {
    worker,
    time_off: timeOff,
    hr_cases: cases,
    summary: {
      full_name:            `${worker.legal_first_name} ${worker.legal_last_name}`,
      display_name:         `${worker.preferred_name || worker.legal_first_name} ${worker.legal_last_name}`,
      open_case_count:      openCases.length,
      pending_time_off:     pendingTime.length,
      pto_balance_days:     Math.round((worker.pto_balance_hours / 8) * 10) / 10,
      sick_balance_days:    Math.round((worker.sick_balance_hours / 8) * 10) / 10,
      // Flagged for the agent: a submitted request the balance will not cover is
      // the single most common reason an employee calls the HR line.
      time_off_shortfall:   pendingTime.some(t => t.absence_type === 'PTO' && t.hours > worker.pto_balance_hours),
    },
  };
}

// ─── Workers ──────────────────────────────────────────────────────────────────

// GET /api/workday/workers
router.get('/workers', (req, res) => {
  const workers = db.prepare(`SELECT id, ${WORKER_COLS} FROM wd_workers ORDER BY worker_id`).all();
  res.json({ success: true, count: workers.length, data: workers });
});

// GET /api/workday/worker/:workerId  — full profile with time off and cases
router.get('/worker/:workerId', (req, res) => {
  const worker = db.prepare(`SELECT id, ${WORKER_COLS} FROM wd_workers WHERE worker_id = ?`)
    .get(req.params.workerId);

  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
  res.json({ success: true, data: buildProfile(worker) });
});

// GET /api/workday/phone/:phone  — the screen pop lookup (ANI)
// Checks mobile first, then the desk line, so a call from either reaches the worker.
router.get('/phone/:phone', (req, res) => {
  const phone = digits(req.params.phone);
  if (phone.length !== 10) {
    return res.status(400).json({ success: false, message: 'Expected a 10-digit phone number' });
  }

  const worker = db.prepare(`
    SELECT id, ${WORKER_COLS} FROM wd_workers
    WHERE ${PHONE_MATCH.replace('%COL%', 'mobile_phone')} = ?
       OR ${PHONE_MATCH.replace('%COL%', 'work_phone')}   = ?
    LIMIT 1
  `).get(phone, phone);

  if (!worker) {
    return res.status(404).json({ success: false, message: 'No worker found for that phone number' });
  }
  res.json({ success: true, data: buildProfile(worker) });
});

// GET /api/workday/email/:email
router.get('/email/:email', (req, res) => {
  const worker = db.prepare(`SELECT id, ${WORKER_COLS} FROM wd_workers WHERE LOWER(work_email) = LOWER(?)`)
    .get(req.params.email);

  if (!worker) return res.status(404).json({ success: false, message: 'No worker found for that email address' });
  res.json({ success: true, data: buildProfile(worker) });
});

// POST /api/workday/workers
router.post('/workers', (req, res) => {
  const b = req.body;
  if (!b.worker_id || !b.legal_first_name || !b.legal_last_name) {
    return res.status(400).json({ success: false, message: 'worker_id, legal_first_name and legal_last_name are required' });
  }

  try {
    db.prepare(`
      INSERT INTO wd_workers
        (worker_id, employee_id, legal_first_name, legal_last_name, preferred_name, work_email,
         mobile_phone, work_phone, business_title, job_profile, job_family, management_level,
         supervisory_org, cost_center, department, location, time_type, worker_type,
         manager_name, manager_worker_id, hire_date, length_of_service, employment_status,
         compensation_grade, pay_rate_type, pay_group, pto_balance_hours, sick_balance_hours,
         pto_taken_ytd, benefits_plan, retirement_enrolled, last_review_rating, next_review_date,
         emergency_contact_name, emergency_contact_phone)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      String(b.worker_id), b.employee_id || `E${b.worker_id}`, b.legal_first_name, b.legal_last_name,
      b.preferred_name || b.legal_first_name, b.work_email || null, b.mobile_phone || null,
      b.work_phone || null, b.business_title || null, b.job_profile || null, b.job_family || null,
      b.management_level || null, b.supervisory_org || null, b.cost_center || null,
      b.department || null, b.location || null, b.time_type || 'Full time',
      b.worker_type || 'Employee', b.manager_name || null, b.manager_worker_id || null,
      b.hire_date || null, b.length_of_service || null, b.employment_status || 'Active',
      b.compensation_grade || null, b.pay_rate_type || 'Salaried', b.pay_group || null,
      b.pto_balance_hours ?? 0, b.sick_balance_hours ?? 0, b.pto_taken_ytd ?? 0,
      b.benefits_plan || null, b.retirement_enrolled || 'No', b.last_review_rating || null,
      b.next_review_date || null, b.emergency_contact_name || null, b.emergency_contact_phone || null
    );
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Worker ID already exists' });
    }
    throw err;
  }

  const created = db.prepare(`SELECT id, ${WORKER_COLS} FROM wd_workers WHERE worker_id = ?`).get(String(b.worker_id));
  res.status(201).json({ success: true, data: created });
});

// PUT /api/workday/worker/:workerId
router.put('/worker/:workerId', (req, res) => {
  const existing = db.prepare('SELECT * FROM wd_workers WHERE worker_id = ?').get(req.params.workerId);
  if (!existing) return res.status(404).json({ success: false, message: 'Worker not found' });

  const b = req.body;
  const merged = {};
  for (const key of Object.keys(existing)) {
    if (key === 'id' || key === 'worker_id') continue;
    merged[key] = b[key] !== undefined ? b[key] : existing[key];
  }

  db.prepare(`
    UPDATE wd_workers SET
      employee_id = @employee_id, legal_first_name = @legal_first_name,
      legal_last_name = @legal_last_name, preferred_name = @preferred_name,
      work_email = @work_email, mobile_phone = @mobile_phone, work_phone = @work_phone,
      business_title = @business_title, job_profile = @job_profile, job_family = @job_family,
      management_level = @management_level, supervisory_org = @supervisory_org,
      cost_center = @cost_center, department = @department, location = @location,
      time_type = @time_type, worker_type = @worker_type, manager_name = @manager_name,
      manager_worker_id = @manager_worker_id, hire_date = @hire_date,
      length_of_service = @length_of_service, employment_status = @employment_status,
      compensation_grade = @compensation_grade, pay_rate_type = @pay_rate_type,
      pay_group = @pay_group, pto_balance_hours = @pto_balance_hours,
      sick_balance_hours = @sick_balance_hours, pto_taken_ytd = @pto_taken_ytd,
      benefits_plan = @benefits_plan, retirement_enrolled = @retirement_enrolled,
      last_review_rating = @last_review_rating, next_review_date = @next_review_date,
      emergency_contact_name = @emergency_contact_name,
      emergency_contact_phone = @emergency_contact_phone
    WHERE worker_id = @wid
  `).run({ ...merged, wid: existing.worker_id });

  const updated = db.prepare(`SELECT id, ${WORKER_COLS} FROM wd_workers WHERE worker_id = ?`).get(existing.worker_id);
  res.json({ success: true, data: updated });
});

// DELETE /api/workday/worker/:workerId  — also clears the worker's child rows
router.delete('/worker/:workerId', (req, res) => {
  const result = db.prepare('DELETE FROM wd_workers WHERE worker_id = ?').run(req.params.workerId);
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Worker not found' });

  db.prepare('DELETE FROM wd_time_off WHERE worker_id = ?').run(req.params.workerId);
  db.prepare('DELETE FROM wd_hr_cases WHERE worker_id = ?').run(req.params.workerId);
  res.json({ success: true, message: 'Worker deleted' });
});

// ─── Time off ─────────────────────────────────────────────────────────────────

// GET /api/workday/timeoff
router.get('/timeoff', (req, res) => {
  const rows = db.prepare('SELECT * FROM wd_time_off ORDER BY start_date DESC').all();
  res.json({ success: true, count: rows.length, data: rows });
});

// GET /api/workday/worker/:workerId/timeoff
router.get('/worker/:workerId/timeoff', (req, res) => {
  const rows = db.prepare('SELECT * FROM wd_time_off WHERE worker_id = ? ORDER BY start_date DESC')
    .all(req.params.workerId);
  res.json({ success: true, count: rows.length, data: rows });
});

function nextSequential(table, column, prefix, width) {
  const row = db.prepare(`
    SELECT ${column} AS val FROM ${table}
    WHERE ${column} LIKE '${prefix}%'
    ORDER BY CAST(SUBSTR(${column}, ${prefix.length + 1}) AS INTEGER) DESC
    LIMIT 1
  `).get();
  const last = row ? parseInt(row.val.slice(prefix.length), 10) : 0;
  const next = Number.isFinite(last) ? last + 1 : 1;
  return `${prefix}${String(next).padStart(width, '0')}`;
}

// POST /api/workday/timeoff  — submit an absence request (Agent IQ write-back)
router.post('/timeoff', (req, res) => {
  const b = req.body;
  if (!b.worker_id || !b.start_date || !b.end_date) {
    return res.status(400).json({ success: false, message: 'worker_id, start_date and end_date are required' });
  }

  const worker = db.prepare('SELECT worker_id FROM wd_workers WHERE worker_id = ?').get(String(b.worker_id));
  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

  const requestId = (b.request_id && String(b.request_id).trim())
    || nextSequential('wd_time_off', 'request_id', 'ABS-', 5);

  try {
    db.prepare(`
      INSERT INTO wd_time_off
        (request_id, worker_id, absence_type, start_date, end_date, hours, status,
         submitted_date, approved_by, comment)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(
      requestId, String(b.worker_id), b.absence_type || 'PTO', b.start_date, b.end_date,
      b.hours ?? 8, b.status || 'Submitted',
      b.submitted_date || new Date().toISOString().slice(0, 10),
      b.approved_by || null, b.comment || null
    );
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Request ID already exists' });
    }
    throw err;
  }

  const created = db.prepare('SELECT * FROM wd_time_off WHERE request_id = ?').get(requestId);
  res.status(201).json({ success: true, data: created });
});

// PATCH /api/workday/timeoff/:requestId  — approve, deny or cancel
router.patch('/timeoff/:requestId', (req, res) => {
  const existing = db.prepare('SELECT * FROM wd_time_off WHERE request_id = ?').get(req.params.requestId.toUpperCase());
  if (!existing) return res.status(404).json({ success: false, message: 'Time off request not found' });

  const { status, approved_by, comment } = req.body;
  db.prepare(`
    UPDATE wd_time_off SET status = ?, approved_by = ?, comment = ? WHERE request_id = ?
  `).run(
    status ?? existing.status,
    approved_by ?? existing.approved_by,
    comment ?? existing.comment,
    existing.request_id
  );

  const updated = db.prepare('SELECT * FROM wd_time_off WHERE request_id = ?').get(existing.request_id);
  res.json({ success: true, data: updated });
});

// DELETE /api/workday/timeoff/:requestId
router.delete('/timeoff/:requestId', (req, res) => {
  const result = db.prepare('DELETE FROM wd_time_off WHERE request_id = ?').run(req.params.requestId.toUpperCase());
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Time off request not found' });
  res.json({ success: true, message: 'Time off request deleted' });
});

// ─── HR cases ─────────────────────────────────────────────────────────────────

// GET /api/workday/cases
router.get('/cases', (req, res) => {
  const rows = db.prepare('SELECT * FROM wd_hr_cases ORDER BY opened_date DESC').all();
  res.json({ success: true, count: rows.length, data: rows });
});

// GET /api/workday/case/:caseNumber
router.get('/case/:caseNumber', (req, res) => {
  const row = db.prepare('SELECT * FROM wd_hr_cases WHERE case_number = ?').get(req.params.caseNumber.toUpperCase());
  if (!row) return res.status(404).json({ success: false, message: 'HR case not found' });
  res.json({ success: true, data: row });
});

// GET /api/workday/worker/:workerId/cases
router.get('/worker/:workerId/cases', (req, res) => {
  const rows = db.prepare('SELECT * FROM wd_hr_cases WHERE worker_id = ? ORDER BY opened_date DESC')
    .all(req.params.workerId);
  res.json({ success: true, count: rows.length, data: rows });
});

// POST /api/workday/cases  — open an HR case from the agent desktop (write-back)
router.post('/cases', (req, res) => {
  const b = req.body;
  if (!b.worker_id || !b.subject) {
    return res.status(400).json({ success: false, message: 'worker_id and subject are required' });
  }

  const worker = db.prepare('SELECT worker_id FROM wd_workers WHERE worker_id = ?').get(String(b.worker_id));
  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

  const now = new Date().toISOString().slice(0, 10);
  const caseNumber = (b.case_number && String(b.case_number).trim().toUpperCase())
    || nextSequential('wd_hr_cases', 'case_number', 'HR-', 6);

  try {
    db.prepare(`
      INSERT INTO wd_hr_cases
        (case_number, worker_id, subject, category, status, priority,
         opened_date, updated_date, assigned_to, resolution)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(
      caseNumber, String(b.worker_id), b.subject, b.category || 'Other',
      b.status || 'New', b.priority || 'Medium',
      b.opened_date || now, b.updated_date || now,
      b.assigned_to || null, b.resolution || null
    );
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Case number already exists' });
    }
    throw err;
  }

  const created = db.prepare('SELECT * FROM wd_hr_cases WHERE case_number = ?').get(caseNumber);
  res.status(201).json({ success: true, data: created });
});

// PATCH /api/workday/case/:caseNumber  — update status or resolution
router.patch('/case/:caseNumber', (req, res) => {
  const existing = db.prepare('SELECT * FROM wd_hr_cases WHERE case_number = ?').get(req.params.caseNumber.toUpperCase());
  if (!existing) return res.status(404).json({ success: false, message: 'HR case not found' });

  const { status, resolution, assigned_to, priority } = req.body;
  db.prepare(`
    UPDATE wd_hr_cases SET status = ?, resolution = ?, assigned_to = ?, priority = ?, updated_date = ?
    WHERE case_number = ?
  `).run(
    status ?? existing.status,
    resolution ?? existing.resolution,
    assigned_to ?? existing.assigned_to,
    priority ?? existing.priority,
    new Date().toISOString().slice(0, 10),
    existing.case_number
  );

  const updated = db.prepare('SELECT * FROM wd_hr_cases WHERE case_number = ?').get(existing.case_number);
  res.json({ success: true, data: updated });
});

// PUT /api/workday/case/:caseNumber
router.put('/case/:caseNumber', (req, res) => {
  const existing = db.prepare('SELECT * FROM wd_hr_cases WHERE case_number = ?').get(req.params.caseNumber.toUpperCase());
  if (!existing) return res.status(404).json({ success: false, message: 'HR case not found' });

  const b = req.body;
  db.prepare(`
    UPDATE wd_hr_cases SET
      worker_id = ?, subject = ?, category = ?, status = ?, priority = ?,
      opened_date = ?, updated_date = ?, assigned_to = ?, resolution = ?
    WHERE case_number = ?
  `).run(
    b.worker_id ?? existing.worker_id, b.subject ?? existing.subject,
    b.category ?? existing.category, b.status ?? existing.status,
    b.priority ?? existing.priority, b.opened_date ?? existing.opened_date,
    new Date().toISOString().slice(0, 10),
    b.assigned_to ?? existing.assigned_to, b.resolution ?? existing.resolution,
    existing.case_number
  );

  const updated = db.prepare('SELECT * FROM wd_hr_cases WHERE case_number = ?').get(existing.case_number);
  res.json({ success: true, data: updated });
});

// DELETE /api/workday/case/:caseNumber
router.delete('/case/:caseNumber', (req, res) => {
  const result = db.prepare('DELETE FROM wd_hr_cases WHERE case_number = ?').run(req.params.caseNumber.toUpperCase());
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'HR case not found' });
  res.json({ success: true, message: 'HR case deleted' });
});

module.exports = router;
