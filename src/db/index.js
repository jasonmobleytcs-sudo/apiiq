const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Railway persistent volume mounts at /data; fall back to local ./data for dev
const DB_DIR = process.env.DB_PATH
  ? path.dirname(process.env.DB_PATH)
  : fs.existsSync('/data') ? '/data' : path.join(__dirname, '../../data');

const DB_FILE = process.env.DB_PATH || path.join(DB_DIR, 'apiiq.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`[DB] Using database at: ${DB_FILE}`);

module.exports = db;
