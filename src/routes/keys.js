const express = require('express');
const { randomUUID } = require('crypto');
const db = require('../db');
const router = express.Router();

// List all API keys (values masked)
// GET /api/keys
router.get('/', (req, res) => {
  const keys = db.prepare(
    "SELECT id, name, description, active, created_at, last_used, substr(key,1,8)||'...' as key_preview FROM api_keys ORDER BY id"
  ).all();
  res.json({ success: true, count: keys.length, data: keys });
});

// Create a new API key
// POST /api/keys
// Body: { name, description }
router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'name is required' });
  }

  const key = randomUUID();
  const result = db.prepare(
    'INSERT INTO api_keys (key, name, description) VALUES (?, ?, ?)'
  ).run(key, name, description || null);

  res.status(201).json({
    success: true,
    message: 'API key created. Save this key — it will not be shown again.',
    data: {
      id: result.lastInsertRowid,
      name,
      description: description || null,
      key
    }
  });
});

// Revoke (deactivate) an API key
// DELETE /api/keys/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare(
    'UPDATE api_keys SET active = 0 WHERE id = ?'
  ).run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, message: 'Key not found' });
  }
  res.json({ success: true, message: 'API key revoked' });
});

// Reactivate an API key
// PATCH /api/keys/:id/activate
router.patch('/:id/activate', (req, res) => {
  const result = db.prepare(
    'UPDATE api_keys SET active = 1 WHERE id = ?'
  ).run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, message: 'Key not found' });
  }
  res.json({ success: true, message: 'API key reactivated' });
});

module.exports = router;
