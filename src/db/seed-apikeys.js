const db = require('./index');
const { randomUUID } = require('crypto');

function seedApiKeys() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      last_used TEXT
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as n FROM api_keys').get();
  if (count.n > 0) return;

  // Use env-provided admin key or generate one
  const adminKey = process.env.ADMIN_API_KEY || randomUUID();

  db.prepare(`
    INSERT INTO api_keys (key, name, description)
    VALUES (?, 'Admin Key', 'Default admin key — full access')
  `).run(adminKey);

  console.log('─'.repeat(60));
  console.log('[APIIQ] Admin API Key:', adminKey);
  console.log('[APIIQ] Set ADMIN_API_KEY env var to keep this key across restarts');
  console.log('─'.repeat(60));
}

module.exports = seedApiKeys;
