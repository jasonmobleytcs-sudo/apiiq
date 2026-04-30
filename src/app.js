const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const seedApiKeys = require('./db/seed-apikeys');
const seedPublicWorks = require('./db/seed-publicworks');
const requireApiKey = require('./middleware/auth');
const publicWorksRouter = require('./routes/publicworks');
const keysRouter = require('./routes/keys');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Seed all databases on startup
seedApiKeys();
seedPublicWorks();

// ─── Public routes ───────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'APIIQ', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    service: 'APIIQ',
    description: 'City Government API Demo Platform',
    version: '1.0.0',
    authentication: 'All /api/* routes require an API key via X-API-Key header or ?api_key= query param.',
    modules: {
      publicworks: {
        base: '/api/publicworks',
        description: 'Newport News Public Works & Sanitation',
        endpoints: [
          'GET  /api/publicworks/account/:accountNumber',
          'GET  /api/publicworks/phone/:phone',
          'POST /api/publicworks/verify-pin',
          'GET  /api/publicworks/account/:accountNumber/services',
          'GET  /api/publicworks/account/:accountNumber/balance',
          'GET  /api/publicworks/account/:accountNumber/inspection',
          'PATCH /api/publicworks/account/:accountNumber/balance',
          'GET  /api/publicworks/residents'
        ]
      },
      keys: {
        base: '/api/keys',
        description: 'API key management (requires valid key)',
        endpoints: [
          'GET    /api/keys',
          'POST   /api/keys',
          'DELETE /api/keys/:id',
          'PATCH  /api/keys/:id/activate'
        ]
      }
    }
  });
});

// ─── Protected routes (require API key) ──────────────────────────────────────

app.use('/api', requireApiKey);
app.use('/api/publicworks', publicWorksRouter);
app.use('/api/keys', keysRouter);

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
