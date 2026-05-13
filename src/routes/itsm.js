const express = require('express');
const db = require('../db');
const router = express.Router();

// List all tickets
// GET /api/itsm/tickets
router.get('/tickets', (req, res) => {
  const tickets = db.prepare(
    'SELECT id, ticket_number, title, category, priority, status, requester_name, requester_dept, assigned_to, created_date, sla_breach FROM it_tickets ORDER BY id'
  ).all();
  res.json({ success: true, count: tickets.length, data: tickets });
});

// Lookup ticket by ticket number
// GET /api/itsm/ticket/:ticketNumber
router.get('/ticket/:ticketNumber', (req, res) => {
  const ticket = db.prepare(
    'SELECT * FROM it_tickets WHERE ticket_number = ?'
  ).get(req.params.ticketNumber.toUpperCase());

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }
  res.json({ success: true, data: ticket });
});

// Lookup tickets by requester phone
// GET /api/itsm/phone/:phone
router.get('/phone/:phone', (req, res) => {
  const phone = req.params.phone.replace(/\D/g, '');
  const tickets = db.prepare(
    "SELECT * FROM it_tickets WHERE REPLACE(REPLACE(REPLACE(requester_phone,'-',''),'(',''),')','') = ? ORDER BY id DESC"
  ).all(phone);

  if (!tickets.length) {
    return res.status(404).json({ success: false, message: 'No tickets found for that phone number' });
  }
  res.json({ success: true, count: tickets.length, data: tickets });
});

// Lookup tickets by requester email (case-insensitive)
// GET /api/itsm/email/:email
router.get('/email/:email', (req, res) => {
  const tickets = db.prepare(
    'SELECT * FROM it_tickets WHERE LOWER(requester_email) = LOWER(?) ORDER BY id DESC'
  ).all(req.params.email);

  if (!tickets.length) {
    return res.status(404).json({ success: false, message: 'No tickets found for that email address' });
  }
  res.json({ success: true, count: tickets.length, data: tickets });
});

// Update ticket status
// PATCH /api/itsm/ticket/:ticketNumber/status
// Body: { status, resolution_notes? }
router.patch('/ticket/:ticketNumber/status', (req, res) => {
  const { status, resolution_notes } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'status is required' });
  }

  const ticket = db.prepare('SELECT * FROM it_tickets WHERE ticket_number = ?').get(req.params.ticketNumber.toUpperCase());
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const now = new Date().toISOString().slice(0, 10);
  const resolved_date = ['Resolved', 'Closed'].includes(status) ? now : ticket.resolved_date;

  db.prepare(`
    UPDATE it_tickets SET status = ?, updated_date = ?, resolved_date = ?, resolution_notes = ?
    WHERE ticket_number = ?
  `).run(status, now, resolved_date, resolution_notes ?? ticket.resolution_notes, ticket.ticket_number);

  const updated = db.prepare('SELECT * FROM it_tickets WHERE ticket_number = ?').get(ticket.ticket_number);
  res.json({ success: true, data: updated });
});

// Generate the next sequential ticket number (TKT-NNNNN).
// Looks at the highest existing TKT-#### value and increments.
function nextTicketNumber() {
  const row = db.prepare(`
    SELECT ticket_number FROM it_tickets
    WHERE ticket_number LIKE 'TKT-%'
    ORDER BY CAST(SUBSTR(ticket_number, 5) AS INTEGER) DESC
    LIMIT 1
  `).get();
  const lastNum = row ? parseInt(row.ticket_number.slice(4), 10) : 0;
  const next = Number.isFinite(lastNum) ? lastNum + 1 : 1;
  return `TKT-${String(next).padStart(5, '0')}`;
}

// Create a new ticket
// POST /api/itsm/tickets
// ticket_number is optional — if missing, the server generates the next TKT-#####.
router.post('/tickets', (req, res) => {
  const { ticket_number, title, category, priority, status, requester_name, requester_email,
          requester_phone, requester_dept, assigned_to, created_date, updated_date,
          resolved_date, sla_breach, resolution_notes, asset_tag } = req.body;

  if (!title || !requester_name) {
    return res.status(400).json({ success: false, message: 'title and requester_name are required' });
  }

  const now = new Date().toISOString().slice(0, 10);

  // Retry once on UNIQUE collision in case two writes race for the same auto-generated number.
  for (let attempt = 0; attempt < 2; attempt++) {
    const finalNumber = (ticket_number && String(ticket_number).trim())
      ? String(ticket_number).toUpperCase()
      : nextTicketNumber();

    try {
      const result = db.prepare(`
        INSERT INTO it_tickets
          (ticket_number, title, category, priority, status, requester_name, requester_email,
           requester_phone, requester_dept, assigned_to, created_date, updated_date,
           resolved_date, sla_breach, resolution_notes, asset_tag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        finalNumber, title, category || 'Other', priority || 'Medium',
        status || 'Open', requester_name, requester_email || null, requester_phone || null,
        requester_dept || null, assigned_to || null,
        created_date || now, updated_date || now, resolved_date || null,
        sla_breach || 'No', resolution_notes || null, asset_tag || null
      );
      const created = db.prepare('SELECT * FROM it_tickets WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        // If the caller passed an explicit number that collides, return 409.
        if (ticket_number) {
          return res.status(409).json({ success: false, message: 'Ticket number already exists' });
        }
        // Otherwise loop and re-pick the next number.
        continue;
      }
      throw err;
    }
  }

  return res.status(500).json({ success: false, message: 'Could not allocate a unique ticket number' });
});

// Update a ticket
// PUT /api/itsm/ticket/:ticketNumber
router.put('/ticket/:ticketNumber', (req, res) => {
  const existing = db.prepare('SELECT * FROM it_tickets WHERE ticket_number = ?').get(req.params.ticketNumber.toUpperCase());
  if (!existing) return res.status(404).json({ success: false, message: 'Ticket not found' });

  const { title, category, priority, status, requester_name, requester_email,
          requester_phone, requester_dept, assigned_to, created_date, updated_date,
          resolved_date, sla_breach, resolution_notes, asset_tag } = req.body;

  const now = new Date().toISOString().slice(0, 10);

  db.prepare(`
    UPDATE it_tickets SET
      title = ?, category = ?, priority = ?, status = ?, requester_name = ?,
      requester_email = ?, requester_phone = ?, requester_dept = ?, assigned_to = ?,
      created_date = ?, updated_date = ?, resolved_date = ?,
      sla_breach = ?, resolution_notes = ?, asset_tag = ?
    WHERE ticket_number = ?
  `).run(
    title ?? existing.title, category ?? existing.category, priority ?? existing.priority,
    status ?? existing.status, requester_name ?? existing.requester_name,
    requester_email ?? existing.requester_email, requester_phone ?? existing.requester_phone,
    requester_dept ?? existing.requester_dept, assigned_to ?? existing.assigned_to,
    created_date ?? existing.created_date, updated_date ?? now,
    resolved_date ?? existing.resolved_date, sla_breach ?? existing.sla_breach,
    resolution_notes ?? existing.resolution_notes, asset_tag ?? existing.asset_tag,
    existing.ticket_number
  );
  const updated = db.prepare('SELECT * FROM it_tickets WHERE ticket_number = ?').get(existing.ticket_number);
  res.json({ success: true, data: updated });
});

// Delete a ticket
// DELETE /api/itsm/ticket/:ticketNumber
router.delete('/ticket/:ticketNumber', (req, res) => {
  const result = db.prepare('DELETE FROM it_tickets WHERE ticket_number = ?').run(req.params.ticketNumber.toUpperCase());
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Ticket not found' });
  res.json({ success: true, message: 'Ticket deleted' });
});

module.exports = router;
