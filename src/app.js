const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');

const seedApiKeys    = require('./db/seed-apikeys');
const seedPublicWorks = require('./db/seed-publicworks');
const seedLogs       = require('./db/seed-logs');

const requireApiKey  = require('./middleware/auth');
const requestLogger  = require('./middleware/logger');

const publicWorksRouter = require('./routes/publicworks');
const keysRouter        = require('./routes/keys');
const logsRouter        = require('./routes/logs');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ─── Seed databases on startup ────────────────────────────────────────────────
seedApiKeys();
seedPublicWorks();
seedLogs();

// ─── Request logger (runs before auth so it captures 401/403 too) ─────────────
app.use(requestLogger);

// ─── Public routes ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'APIIQ', timestamp: new Date().toISOString() });
});

app.get('/screenpop', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/screenpop.html'));
});

// ─── Protected routes (require API key) ───────────────────────────────────────
app.use('/api', requireApiKey);
app.use('/api/publicworks', publicWorksRouter);
app.use('/api/keys', keysRouter);
app.use('/api/logs', logsRouter);

// ─── Error handlers ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`APIIQ running on port ${PORT}`);
});
