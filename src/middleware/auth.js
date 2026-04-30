const db = require('../db');

function requireApiKey(req, res, next) {
  // Accept: X-API-Key header, ?api_key= query param, or Authorization: Bearer <key>
  const authHeader = req.headers['authorization'] || '';
  const bearerKey  = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  const key = req.headers['x-api-key'] || req.query.api_key || bearerKey || null;

  if (!key) {
    return res.status(401).json({
      success: false,
      message: 'API key required. Pass via X-API-Key header or ?api_key= query param.'
    });
  }

  const record = db.prepare(
    'SELECT id, name, active FROM api_keys WHERE key = ?'
  ).get(key);

  if (!record) {
    return res.status(403).json({ success: false, message: 'Invalid API key' });
  }

  if (!record.active) {
    return res.status(403).json({ success: false, message: 'API key is inactive' });
  }

  db.prepare("UPDATE api_keys SET last_used = datetime('now') WHERE id = ?").run(record.id);

  req.apiKeyName = record.name;
  next();
}

module.exports = requireApiKey;
