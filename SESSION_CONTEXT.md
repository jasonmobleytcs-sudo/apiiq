# APIIQ — Session Context for Claude (Cross-Device Continuity)

> Last updated: 2026-04-30  
> Full conversation log: `CONVERSATION_LOG.md`

---

## What APIIQ Is

A city government API demo platform built for **Zoom Contact Center / Zoom Virtual Agent** demos.  
Hosted on **Railway**: `https://apiiq-production.up.railway.app`  
Repo: pushed to GitHub, connected to Railway for auto-deploy.

Stack: **Node.js + Express + SQLite (better-sqlite3)** · Static frontend served from Express · No build tool.

---

## File Structure

```
apiiq/
├── src/
│   ├── app.js                  ← Express server, middleware wiring
│   ├── db/
│   │   ├── index.js            ← SQLite connection (/data/apiiq.db on Railway volume)
│   │   ├── seed-apikeys.js     ← Seeds admin key from ADMIN_API_KEY env var
│   │   ├── seed-publicworks.js ← 42 Newport News residents (NN10001–NN10042)
│   │   └── seed-logs.js        ← Creates api_logs table
│   ├── middleware/
│   │   ├── auth.js             ← X-API-Key header, ?api_key= param, or Bearer token
│   │   └── logger.js           ← Logs all /api/* calls to api_logs table
│   └── routes/
│       ├── publicworks.js      ← Full CRUD for residents
│       ├── keys.js             ← API key management
│       └── logs.js             ← Log viewer endpoints
├── public/
│   ├── index.html              ← 3-tab UI: Databases | API Explorer | Logs
│   ├── style.css
│   ├── app.js                  ← View switcher, API Explorer, cURL copy
│   ├── db-manager.js           ← DB_REGISTRY pattern, table/modal UI
│   └── logs.js                 ← Log table, stats bar, detail panel
├── SESSION_CONTEXT.md          ← This file
└── CONVERSATION_LOG.md         ← Full raw conversation transcript
```

---

## Credentials & Keys

| Item | Value |
|------|-------|
| Admin API Key | `cef44c87-ac22-49e5-9edc-5f3205186e58` |
| Railway URL | `https://apiiq-production.up.railway.app` |
| Railway project | `apiiq` (service: `apiiq`) |
| DB path (Railway) | `/data/apiiq.db` (persistent volume) |

---

## Public Works Database

- 42 residents total: **NN10001–NN10042**
- Key demo records:
  - **Jason Mobley** — NN10041 · 850-217-6664
  - **Mason Morris** — NN10042 · 850-655-3044 · balance $22.75

### Key Endpoints

```
GET  /api/publicworks/phone/:phone          ← ANI lookup (main Zoom use case)
GET  /api/publicworks/account/:accountNumber
POST /api/publicworks/verify-pin            ← IVR PIN auth
GET  /api/publicworks/account/:accountNumber/balance
PATCH /api/publicworks/account/:accountNumber/balance  ← payment
GET  /api/publicworks/residents             ← list all
POST /api/publicworks/residents             ← create
PUT  /api/publicworks/account/:accountNumber ← update
DELETE /api/publicworks/account/:accountNumber
```

### API Response Shape

```json
{
  "success": true,
  "data": {
    "id": 42,
    "name": "Mason Morris",
    "account_number": "NN10042",
    "phone": "850-655-3044",
    "address": "837 Pilot House Dr, Newport News, VA 23606",
    "service_type": "Trash",
    "balance": 22.75,
    "inspection_result": "Pass",
    "last_inspection": "04/22/2026",
    "email": "mason.morris@email.com"
  }
}
```

**Access data at `response.data.data` (not `response.data`).**

---

## Auth Middleware

Accepts API key from any of these:
- Header: `X-API-Key: <key>`
- Query param: `?api_key=<key>`
- Header: `Authorization: Bearer <key>`

---

## Zoom Contact Center Script (Current Working Version)

The script widget reads the caller ANI from `global_system`, normalizes it to 10 digits, and looks up the resident by phone number.

**Confirmed working as of 2026-04-30** — two successful hits in logs at 13:02 and 13:04.

```javascript
async function main() {
  const API_KEY  = "cef44c87-ac22-49e5-9edc-5f3205186e58";
  const BASE_URL = "https://apiiq-production.up.railway.app";

  log.info("NVVA Public Works — starting lookup.");

  // Step 1: Read ANI
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

  // Step 2: Normalize phone
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

### Zoom Variables to Create

| Variable Name | Type | Description |
|---------------|------|-------------|
| `pw_found` | String | "true" or "false" |
| `pw_name` | String | Resident full name |
| `pw_account` | String | Account number (e.g. NN10042) |
| `pw_address` | String | Street address |
| `pw_balance` | String | Balance amount |
| `pw_service` | String | Service type (Trash, Recycling, etc.) |
| `pw_inspection` | String | Pass or Fail |
| `pw_phone` | String | Normalized 10-digit phone |

---

## Known Issues & Fixes

| Issue | Fix |
|-------|-----|
| Zoom Authorization header sends Bearer token, not X-API-Key | Auth middleware parses all three auth formats |
| `response.data.name` returned undefined | Correct path is `response.data.data.name` |
| `var_get("global_system.Engagement.ANI")` returns empty in real runtime | Read full `global_system` string and JSON.parse it |
| Markdown link corruption in scripts (`log.info` → `[log.info](http://log.info)`) | Always copy scripts fresh from Claude, never from email/PDF |
| Script not hitting API (logs empty) | Was crashing before req.get() — fixed by confirming req.get() with hardcoded phone first |

---

## Adding a New City Department Database

Follow the publicworks pattern:
1. `src/db/seed-<dept>.js` — create table + seed data
2. `src/routes/<dept>.js` — Express router with CRUD endpoints
3. Wire into `src/app.js` — seed call + `app.use('/api/<dept>', router)`
4. Add to `DB_REGISTRY` in `public/db-manager.js` — UI builds automatically
5. Add to `MODULES` array in `public/app.js` — API Explorer sidebar builds automatically
