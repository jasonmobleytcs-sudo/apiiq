const db = require('./index');

function seedLogs() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp   TEXT    DEFAULT (datetime('now')),
      method      TEXT    NOT NULL,
      path        TEXT    NOT NULL,
      status_code INTEGER,
      duration_ms INTEGER,
      api_key_name TEXT   DEFAULT 'anonymous',
      request_body TEXT,
      request_query TEXT,
      response_body TEXT,
      ip_address  TEXT,
      module      TEXT    DEFAULT 'unknown',
      success     INTEGER DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON api_logs (timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_logs_module    ON api_logs (module);
    CREATE INDEX IF NOT EXISTS idx_logs_status    ON api_logs (status_code);
  `);
  console.log('[DB] API logs table ready');
}

module.exports = seedLogs;
