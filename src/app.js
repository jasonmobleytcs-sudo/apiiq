const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');

const seedApiKeys    = require('./db/seed-apikeys');
const seedPublicWorks = require('./db/seed-publicworks');
const seedLogs       = require('./db/seed-logs');
const seedHigherEd   = require('./db/seed-highered');
const seedK12        = require('./db/seed-k12');
const seedLegal      = require('./db/seed-legal');
const seedRetail     = require('./db/seed-retail');
const seedITSM       = require('./db/seed-itsm');
const seedZoomlly    = require('./db/seed-zoomlly');
const seedWorkday    = require('./db/seed-workday');

const requireApiKey  = require('./middleware/auth');
const requestLogger  = require('./middleware/logger');

const publicWorksRouter = require('./routes/publicworks');
const keysRouter        = require('./routes/keys');
const logsRouter        = require('./routes/logs');
const higherEdRouter    = require('./routes/highered');
const k12Router         = require('./routes/k12');
const legalRouter       = require('./routes/legal');
const retailRouter      = require('./routes/retail');
const itsmRouter        = require('./routes/itsm');
const zoomlllyRouter    = require('./routes/zoomlly');
const workdayRouter     = require('./routes/workday');

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
seedHigherEd();
seedK12();
seedLegal();
seedRetail();
seedITSM();
seedZoomlly();
seedWorkday();

// ─── Request logger (runs before auth so it captures 401/403 too) ─────────────
app.use(requestLogger);

// ─── Public routes ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'APIIQ', timestamp: new Date().toISOString() });
});

app.get('/screenpop', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/screenpop.html'));
});

app.get('/screenpop-zoomlly', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/screenpop-zoomlly.html'));
});

// Agent IQ panel for the Workday HCM demo. Both paths serve the same page so the
// ZCC screen pop URL can be written either way.
app.get(['/agentiq-workday', '/screenpop-workday'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/agentiq-workday.html'));
});

// ─── Protected routes (require API key) ───────────────────────────────────────
app.use('/api', requireApiKey);
app.use('/api/publicworks', publicWorksRouter);
app.use('/api/keys', keysRouter);
app.use('/api/logs', logsRouter);
app.use('/api/highered', higherEdRouter);
app.use('/api/k12', k12Router);
app.use('/api/legal', legalRouter);
app.use('/api/retail', retailRouter);
app.use('/api/itsm', itsmRouter);
app.use('/api/zoomlly', zoomlllyRouter);
app.use('/api/workday', workdayRouter);

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
