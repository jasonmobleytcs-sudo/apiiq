# APIIQ — Claude Code Project Memory

> This file is the authoritative context document for Claude Code.
> Read this before doing anything else in this project.
> Last updated: 2026-04-30

---

## What This Project Is

**APIIQ** is a city government API demo platform built for **Zoom Contact Center (ZCC)** and **Zoom Virtual Agent (ZVA)** live demonstrations. It simulates a real municipal backend — starting with Newport News, VA Public Works — so Zoom sales and solutions engineers can show realistic IVR/AI flows that look up resident accounts, check balances, verify PINs, and confirm service schedules.

It is **not a prototype** — it is a fully working REST API with a polished frontend dashboard, deployed live on Railway.

---

## Live Deployment

| Item | Value |
|------|-------|
| **Production URL** | `https://apiiq-production.up.railway.app` |
| **Railway project** | `apiiq` (service: `apiiq`) |
| **GitHub repo** | `https://github.com/jasonmobleytcs-sudo/apiiq` |
| **Admin API Key** | `cef44c87-ac22-49e5-9edc-5f3205186e58` |
| **DB path on Railway** | `/data/apiiq.db` (persistent volume — survives restarts) |
| **Deploy method** | Push to `main` → Railway auto-deploys via GitHub |

To deploy: `git push` — Railway picks it up automatically.  
To deploy manually: `railway up --detach` (must run `railway service apiiq` first to link).

---

## Tech Stack

- **Runtime**: Node.js ≥18 · Express 4
- **Database**: SQLite via `better-sqlite3` (synchronous, no connection pool needed)
- **Auth**: API key middleware — accepts from `X-API-Key` header, `?api_key=` query param, or `Authorization: Bearer <key>`
- **Frontend**: Vanilla JS + CSS served as static files from Express — no build tool, no bundler
- **Hosting**: Railway (nixpacks auto-detects Node; `railway.json` sets start command)
- **Logging**: Custom middleware captures every `/api/*` request/response to `api_logs` SQLite table

---

## Project File Structure

```
apiiq/
├── CLAUDE.md                   ← YOU ARE HERE — read this first
├── SESSION_CONTEXT.md          ← Older context doc (superseded by this file)
├── CONVERSATION_LOG.md         ← Full raw transcript of the build session
├── package.json
├── nixpacks.toml               ← Railway build config
├── railway.json                ← Railway start command config
│
├── src/
│   ├── app.js                  ← Express server: wires all middleware + routes, seeds DB on startup
│   ├── db/
│   │   ├── index.js            ← SQLite connection; auto-creates /data dir; uses /data/apiiq.db on Railway
│   │   ├── seed-apikeys.js     ← Seeds admin key from ADMIN_API_KEY env var or generates UUID
│   │   ├── seed-publicworks.js ← Seeds 43 Newport News residents; handles pickup_day migration
│   │   └── seed-logs.js        ← Creates api_logs table with indexes
│   ├── middleware/
│   │   ├── auth.js             ← API key auth (X-API-Key, ?api_key=, Bearer)
│   │   └── logger.js           ← Intercepts res.json to log req/res; skips /api/logs path
│   └── routes/
│       ├── publicworks.js      ← Full CRUD for pw_residents table
│       ├── keys.js             ← API key management (list, create, revoke)
│       └── logs.js             ← Log viewer (list, stats, clear)
│
└── public/                     ← Served as static files by Express
    ├── index.html              ← 3-tab UI: Databases | API Explorer | Logs
    ├── style.css               ← All styles (dark sidebar, method badges, log colors, etc.)
    ├── app.js                  ← View switcher, API Explorer logic, cURL copy, JSON highlighting
    ├── db-manager.js           ← DB_REGISTRY pattern — card grid, table, sort, search, modals
    └── logs.js                 ← Log table, stats bar, filters, auto-refresh, detail panel
```

---

## Database: Public Works (`pw_residents`)

**43 residents** — account numbers NN10001 through NN10043.

### Schema

```sql
CREATE TABLE pw_residents (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL,
  gender           TEXT CHECK(gender IN ('M','F')),
  address          TEXT NOT NULL,
  phone            TEXT NOT NULL,
  account_number   TEXT UNIQUE NOT NULL,
  pin              TEXT NOT NULL,
  service_type     TEXT NOT NULL,
  pickup_day       TEXT,                        -- Monday/Tuesday/Wednesday/Thursday/Friday
  last_inspection  TEXT,
  inspection_result TEXT CHECK(inspection_result IN ('Pass','Fail')),
  balance          REAL DEFAULT 0.00,
  email            TEXT
);
```

### Key Demo Records

| Account | Name | Phone | Balance | Pickup Day | Notes |
|---------|------|-------|---------|------------|-------|
| NN10041 | Jason Mobley | 850-217-6664 | $0.00 | Monday | Demo record |
| NN10042 | Mason Morris | 850-655-3044 | $22.75 | Tuesday | Demo record, has balance |
| NN10043 | Todd Anderson | 703-728-2157 | $0.00 | Wednesday | Demo record |

### Pickup Day Assignment (Mon–Fri cycle)

Assigned by account number order: NN10001=Monday, NN10002=Tuesday, ... NN10005=Friday, NN10006=Monday, etc.

### DB Migration Strategy

The seed file (`seed-publicworks.js`) handles live DB migrations automatically on startup:
- Uses `PRAGMA table_info()` to check if a column exists before `ALTER TABLE`
- Backfills new columns on existing records before returning
- Inserts new records (like Todd Anderson) with an existence check — safe to redeploy

**Never manually edit the Railway SQLite file.** Always update `seed-publicworks.js` and redeploy.

---

## API Reference

### Authentication

Every `/api/*` route requires an API key via one of:
```
X-API-Key: cef44c87-ac22-49e5-9edc-5f3205186e58
?api_key=cef44c87-ac22-49e5-9edc-5f3205186e58
Authorization: Bearer cef44c87-ac22-49e5-9edc-5f3205186e58
```

### Public Works Endpoints

```
GET    /api/publicworks/residents                         → List all 43 residents
GET    /api/publicworks/account/:accountNumber            → Full record by account number
GET    /api/publicworks/phone/:phone                      → Lookup by phone (strips non-digits)
POST   /api/publicworks/verify-pin                        → IVR PIN auth { account_number, pin }
GET    /api/publicworks/account/:accountNumber/services   → service_type, pickup_day, inspection
GET    /api/publicworks/account/:accountNumber/balance    → balance only
GET    /api/publicworks/account/:accountNumber/inspection → inspection date + result
PATCH  /api/publicworks/account/:accountNumber/balance    → Apply payment { amount }
POST   /api/publicworks/residents                         → Create new resident
PUT    /api/publicworks/account/:accountNumber            → Update resident
DELETE /api/publicworks/account/:accountNumber            → Delete resident
```

### API Response Shape

**All responses follow this pattern:**
```json
{ "success": true, "data": { ...resident fields... } }
```

**CRITICAL**: In Zoom scripts, resident data is at `response.data.data` — NOT `response.data`.
```javascript
const resident = response.data.data;  // ← correct
const resident = response.data;        // ← WRONG — this is { success, data }
```

### Phone Lookup Normalization

The `/phone/:phone` endpoint strips all non-digits from the input and the stored number before matching. So `703-728-2157`, `7037282157`, and `+17037282157` all find Todd Anderson.

---

## Frontend UI

Three tabs at the top:

1. **Databases** — Card grid showing all registered databases with record counts. Click a card to open full sortable/searchable/editable table with Add/Edit/Delete modals.

2. **API Explorer** — Postman-style request builder. Select an endpoint from the sidebar, fill in parameters, hit Send. Shows response with syntax highlighting, status badge, response time, and cURL copy.

3. **Logs** — Live API log viewer with stats bar (total calls, errors, avg response time, last 24h), filters by status/module/method/search, auto-refresh toggle, and a detail side panel showing full request/response bodies.

### DB_REGISTRY Pattern

To add a new city department database, add one entry to `DB_REGISTRY` in `public/db-manager.js`. The entire UI (cards, table columns, sort, add form, edit form) builds automatically from that config. Also add to `MODULES` in `public/app.js` for the API Explorer sidebar.

---

## Zoom Contact Center Integration

### Working Script (as of 2026-04-30)

This script runs in a **Script widget** inside a Zoom Contact Center flow. It reads the caller's phone number (ANI) from the Zoom runtime, normalizes it, looks up the resident, and stores results in global variables.

```javascript
async function main() {
  const API_KEY  = "cef44c87-ac22-49e5-9edc-5f3205186e58";
  const BASE_URL = "https://apiiq-production.up.railway.app";

  log.info("NVVA Public Works — starting lookup.");

  // Step 1: Read ANI from global_system
  let rawAni = "";
  try {
    const gsRaw = var_get("global_system");
    log.debug("global_system type: " + typeof gsRaw);

    if (typeof gsRaw === "string" && gsRaw.trim()) {
      const gs = JSON.parse(gsRaw);
      rawAni = gs && gs.Engagement && gs.Engagement.ANI ? gs.Engagement.ANI : "";
    } else if (typeof gsRaw === "object" && gsRaw !== null) {
      rawAni = gsRaw.Engagement && gsRaw.Engagement.ANI ? gsRaw.Engagement.ANI : "";
    }
    log.info("Raw ANI: " + rawAni);
  } catch (e) {
    log.error("ANI read failed: " + e.message);
  }

  // Step 2: Normalize to 10 digits
  let phone = rawAni.replace(/\D/g, "");
  if (phone.length === 11 && phone.charAt(0) === "1") {
    phone = phone.slice(1);
  }
  log.info("Normalized phone: " + phone);

  if (!phone || phone.length !== 10) {
    log.warn("No valid 10-digit phone — aborting.");
    global_var_set("pw_found", "false");
    global_var_set("pw_name", "");
    global_var_set("pw_account", "");
    return;
  }

  // Step 3: API lookup
  try {
    const url = BASE_URL + "/api/publicworks/phone/" + phone + "?api_key=" + API_KEY;
    log.info("Calling: " + url);

    const response = await req.get(url);
    log.info("Status: " + response.status);

    const resident = response.data.data;
    global_var_set("pw_found",      "true");
    global_var_set("pw_name",       resident.name);
    global_var_set("pw_account",    resident.account_number);
    global_var_set("pw_address",    resident.address);
    global_var_set("pw_balance",    String(resident.balance));
    global_var_set("pw_service",    resident.service_type);
    global_var_set("pw_pickup_day", resident.pickup_day);
    global_var_set("pw_inspection", resident.inspection_result);
    global_var_set("pw_phone",      phone);

    log.info("SUCCESS: " + resident.name + " (" + resident.account_number + ")");
  } catch (e) {
    log.error("Lookup failed: " + e.message);
    global_var_set("pw_found",   "false");
    global_var_set("pw_name",    "");
    global_var_set("pw_account", "");
  }
}
```

### Zoom Global Variables to Create

Create these in Zoom Contact Center under your variable group:

| Variable | Type | Description |
|----------|------|-------------|
| `pw_found` | String | "true" or "false" — did we find a matching account? |
| `pw_name` | String | Resident full name |
| `pw_account` | String | Account number (e.g. NN10042) |
| `pw_address` | String | Street address |
| `pw_balance` | String | Balance amount as string |
| `pw_service` | String | Service type (Trash, Recycling, etc.) |
| `pw_pickup_day` | String | Day of week for trash pickup |
| `pw_inspection` | String | Pass or Fail |
| `pw_phone` | String | Normalized 10-digit phone used for lookup |

### Zoom Script Widget Requirements

- **Function name field**: must be `main`
- **Widget must be wired in the flow**: needs an incoming connector AND an outgoing connector
- **Use `?api_key=` in the URL** (not just X-API-Key header) — Zoom's `req.get()` doesn't accept custom headers the same way
- **Do not copy scripts from email, PDF, or chat history** — markdown processors corrupt `log.info(...)` into `[log.info](http://log.info)(...)` which silently breaks execution. Always copy fresh from this file or from the Claude session.

### How ANI Works in Zoom

- ANI arrives as E.164 format: `+18506553044`
- `var_get("global_system.Engagement.ANI")` returns **empty** in the real Zoom runtime (dot-notation doesn't work)
- Correct approach: read the full `global_system` string, `JSON.parse()` it, then navigate `gs.Engagement.ANI`
- After stripping non-digits and removing a leading `1` from 11-digit numbers, you get the 10-digit phone for the API call

---

## Known Issues & How They Were Fixed

| Issue | Root Cause | Fix Applied |
|-------|-----------|-------------|
| Zoom returns `API key required` | Zoom Authorization header sends `Bearer <token>`, not `X-API-Key` | Auth middleware now parses all three formats |
| `response.data.name` is undefined | API returns `{ success, data: {...} }` so data is nested one level deeper | Use `response.data.data.name` |
| `var_get("global_system.Engagement.ANI")` returns empty | Zoom runtime doesn't support dot-notation on `var_get` | Parse full `global_system` JSON string manually |
| Script not hitting API (logs show zero phone lookups) | Script was crashing before `req.get()` on the ANI parse | Confirmed with hardcoded-phone test script; then rewrote ANI logic |
| Markdown corrupts script code | Chat/email/PDF renders `log.info` as a hyperlink | Always copy scripts from this CLAUDE.md file directly |
| Railway `railway variables --set` fails | Service wasn't linked in CLI session | Run `railway service apiiq` first to link |

---

## Adding a New City Department Database

Follow this exact pattern — adding one block to the registry is all the UI needs:

### 1. Create seed file: `src/db/seed-<dept>.js`
```javascript
const db = require('./index');
function seed<Dept>() {
  db.exec(`CREATE TABLE IF NOT EXISTS <dept>_table (...)`);
  const count = db.prepare('SELECT COUNT(*) as n FROM <dept>_table').get();
  if (count.n > 0) return;
  // insert seed data
}
module.exports = seed<Dept>;
```

### 2. Create route file: `src/routes/<dept>.js`
```javascript
const express = require('express');
const db = require('../db');
const router = express.Router();
// add GET/POST/PUT/DELETE routes
module.exports = router;
```

### 3. Wire into `src/app.js`
```javascript
const seed<Dept> = require('./db/seed-<dept>');
const <dept>Router = require('./routes/<dept>');
seed<Dept>();
app.use('/api/<dept>', <dept>Router);
```

### 4. Add to `public/db-manager.js` — DB_REGISTRY array
```javascript
{
  id: '<dept>',
  name: 'Department Name',
  icon: '💧',
  description: 'One-line description.',
  color: '#16a34a',
  api: {
    list:    { method: 'GET',    path: '/api/<dept>/records' },
    create:  { method: 'POST',   path: '/api/<dept>/records' },
    update:  { method: 'PUT',    path: '/api/<dept>/record/:id' },
    delete:  { method: 'DELETE', path: '/api/<dept>/record/:id' },
    idField: 'id'
  },
  columns: [ /* table columns */ ],
  fields:  [ /* modal form fields */ ]
}
```

### 5. Add to `public/app.js` — MODULES array
```javascript
{
  id: '<dept>',
  label: 'Department Name',
  icon: '💧',
  endpoints: [ /* endpoint definitions for API Explorer */ ]
}
```

---

## Local Development

```bash
cd /Users/COPPSADMIN/Library/CloudStorage/Dropbox/TCS/API\ Projects/API\ Master/apiiq
npm install
npm run dev      # nodemon auto-restarts on changes
# open http://localhost:3000
```

The local DB is created at `./apiiq.db` (falls back from `/data/` when that dir doesn't exist).

---

## Git Workflow

```bash
git add <files>
git commit -m "description"
git push          # Railway auto-deploys from main branch
```

Railway deployment takes ~60–90 seconds after push. You can verify it's live:
```bash
curl -s https://apiiq-production.up.railway.app/health
```

---

## Current Status (2026-04-30)

- [x] Full Express/SQLite API live on Railway
- [x] 43 Public Works residents with pickup_day field
- [x] API key auth, request logging, log viewer UI
- [x] Zoom Contact Center Script widget working (confirmed in logs)
- [x] ANI lookup confirmed: Mason Morris (NN10042) and Todd Anderson (NN10043) are live demo records
- [ ] Next: potentially add more city departments (Water & Sewer, Permits, etc.)
- [ ] Next: potentially add more Zoom flow widgets (balance check, PIN verify, payment)
