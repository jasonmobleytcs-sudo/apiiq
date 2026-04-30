const express = require('express');
const db      = require('../db');
const router  = express.Router();

// GET /api/logs
// Query params: limit, offset, module, status (success|error|all), method
router.get('/', (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit  || 100), 500);
  const offset = parseInt(req.query.offset || 0);
  const module = req.query.module || null;
  const status = req.query.status || 'all';   // 'success' | 'error' | 'all'
  const method = req.query.method || null;
  const search = req.query.search || null;

  const conditions = [];
  const params     = [];

  if (module)           { conditions.push('module = ?');        params.push(module); }
  if (method)           { conditions.push('method = ?');        params.push(method.toUpperCase()); }
  if (status === 'success') { conditions.push('success = 1'); }
  if (status === 'error')   { conditions.push('success = 0'); }
  if (search) {
    conditions.push('(path LIKE ? OR api_key_name LIKE ? OR response_body LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const total = db.prepare(`SELECT COUNT(*) as n FROM api_logs ${where}`).get(...params).n;
  const rows  = db.prepare(
    `SELECT * FROM api_logs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  res.json({ success: true, total, limit, offset, count: rows.length, data: rows });
});

// GET /api/logs/stats  — summary counts per module, method, status
router.get('/stats', (req, res) => {
  const byModule = db.prepare(
    `SELECT module, COUNT(*) as total,
            SUM(success) as successes,
            SUM(CASE WHEN success=0 THEN 1 ELSE 0 END) as errors,
            AVG(duration_ms) as avg_ms
     FROM api_logs GROUP BY module`
  ).all();

  const byStatus = db.prepare(
    `SELECT status_code, COUNT(*) as count FROM api_logs
     GROUP BY status_code ORDER BY count DESC`
  ).all();

  const byMethod = db.prepare(
    `SELECT method, COUNT(*) as count FROM api_logs
     GROUP BY method ORDER BY count DESC`
  ).all();

  const recent24h = db.prepare(
    `SELECT COUNT(*) as n FROM api_logs
     WHERE timestamp >= datetime('now', '-24 hours')`
  ).get().n;

  const avgDuration = db.prepare(
    `SELECT AVG(duration_ms) as avg FROM api_logs`
  ).get().avg;

  res.json({ success: true, data: { byModule, byStatus, byMethod, recent24h, avgDuration } });
});

// DELETE /api/logs  — clear all logs
router.delete('/', (req, res) => {
  const result = db.prepare('DELETE FROM api_logs').run();
  res.json({ success: true, message: `Cleared ${result.changes} log entries` });
});

// DELETE /api/logs/:id  — delete one entry
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM api_logs WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
