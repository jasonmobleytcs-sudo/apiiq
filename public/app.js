/* ═══════════════════════════════════════════════════════════════
   APP.JS  —  View switching + API Explorer
   ═══════════════════════════════════════════════════════════════ */

const BASE = window.location.origin;

/* ─── Endpoint definitions ───────────────────────────────────── */
const MODULES = [
  {
    id: 'publicworks',
    label: 'Public Works',
    icon: '🗑',
    endpoints: [
      { id: 'pw-account',   method: 'GET',   path: '/api/publicworks/account/:accountNumber',          description: 'Look up a resident\'s full account details by account number.',                    params: [{ name:'accountNumber', label:'Account Number', type:'text', in:'path', required:true, hint:'e.g. NN10001' }] },
      { id: 'pw-phone',     method: 'GET',   path: '/api/publicworks/phone/:phone',                    description: 'Look up a resident by phone number.',                                            params: [{ name:'phone', label:'Phone Number', type:'text', in:'path', required:true, hint:'e.g. 7575552101' }] },
      { id: 'pw-verify',    method: 'POST',  path: '/api/publicworks/verify-pin',                      description: 'Verify a resident\'s PIN for IVR authentication.',                               params: [{ name:'account_number', label:'Account Number', type:'text', in:'body', required:true, hint:'e.g. NN10001' }, { name:'pin', label:'PIN', type:'text', in:'body', required:true, hint:'e.g. 4421' }] },
      { id: 'pw-services',  method: 'GET',   path: '/api/publicworks/account/:accountNumber/services', description: 'Get service type and inspection details for an account.',                         params: [{ name:'accountNumber', label:'Account Number', type:'text', in:'path', required:true, hint:'e.g. NN10001' }] },
      { id: 'pw-balance',   method: 'GET',   path: '/api/publicworks/account/:accountNumber/balance',  description: 'Get the current outstanding balance.',                                           params: [{ name:'accountNumber', label:'Account Number', type:'text', in:'path', required:true, hint:'e.g. NN10002 ($12.50 balance)' }] },
      { id: 'pw-inspection',method: 'GET',   path: '/api/publicworks/account/:accountNumber/inspection',description: 'Get last inspection date and pass/fail result.',                                params: [{ name:'accountNumber', label:'Account Number', type:'text', in:'path', required:true, hint:'e.g. NN10003 (failed)' }] },
      { id: 'pw-pay',       method: 'PATCH', path: '/api/publicworks/account/:accountNumber/balance',  description: 'Apply a payment to reduce the account balance.',                                 params: [{ name:'accountNumber', label:'Account Number', type:'text', in:'path', required:true, hint:'e.g. NN10002' }, { name:'amount', label:'Payment Amount ($)', type:'number', in:'body', required:true, hint:'e.g. 12.50' }] },
      { id: 'pw-residents', method: 'GET',   path: '/api/publicworks/residents',                       description: 'List all residents in the Public Works database.',                               params: [] },
      { id: 'pw-create',    method: 'POST',  path: '/api/publicworks/residents',                       description: 'Create a new resident record.',                                                  params: [{ name:'account_number', label:'Account Number', type:'text', in:'body', required:true, hint:'e.g. NN10041' }, { name:'name', label:'Name', type:'text', in:'body', required:true }, { name:'phone', label:'Phone', type:'text', in:'body', required:true }, { name:'address', label:'Address', type:'text', in:'body', required:true }, { name:'pin', label:'PIN', type:'text', in:'body', required:true }, { name:'service_type', label:'Service Type', type:'text', in:'body', required:true, hint:'Trash / Recycling / Trash/Recycling / Bulk Pickup' }] },
      { id: 'pw-update',    method: 'PUT',   path: '/api/publicworks/account/:accountNumber',           description: 'Update an existing resident record.',                                           params: [{ name:'accountNumber', label:'Account Number', type:'text', in:'path', required:true }, { name:'name', label:'Name', type:'text', in:'body', required:false }, { name:'phone', label:'Phone', type:'text', in:'body', required:false }, { name:'balance', label:'Balance', type:'number', in:'body', required:false }] },
      { id: 'pw-delete',    method: 'DELETE',path: '/api/publicworks/account/:accountNumber',           description: 'Delete a resident record permanently.',                                          params: [{ name:'accountNumber', label:'Account Number', type:'text', in:'path', required:true, hint:'e.g. NN10041' }] },
    ]
  }
];

const KEY_ENDPOINTS = {
  'key-list':   { method:'GET',    path:'/api/keys', description:'List all API keys (values masked).',                         params:[] },
  'key-create': { method:'POST',   path:'/api/keys', description:'Create a new API key. Save the returned key — shown once.', params:[{ name:'name', label:'Key Name', type:'text', in:'body', required:true, hint:'e.g. Zoom VA Key' }, { name:'description', label:'Description', type:'text', in:'body', required:false }] },
  'key-revoke': { method:'DELETE', path:'/api/keys/:id', description:'Revoke an API key by its numeric ID.',                  params:[{ name:'id', label:'Key ID', type:'text', in:'path', required:true, hint:'Numeric ID from GET /api/keys' }] }
};

/* ─── State ──────────────────────────────────────────────────── */
let currentEndpoint = null;
let apiKey = localStorage.getItem('apiiq_key') || '';

/* ─── Boot ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initViewSwitcher();
  initKeyBar();
  buildSidebar();
  bindSidebarKeys();
});

/* ─── View Switcher ──────────────────────────────────────────── */
function initViewSwitcher() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
      document.getElementById('view-' + view).classList.remove('hidden');
    });
  });
}

/* ─── API Key Bar ────────────────────────────────────────────── */
function initKeyBar() {
  const input = document.getElementById('apiKeyInput');
  input.value = apiKey;
  if (apiKey) verifyKey(apiKey);

  document.getElementById('toggleKey').addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('saveKey').addEventListener('click', () => {
    apiKey = input.value.trim();
    localStorage.setItem('apiiq_key', apiKey);
    verifyKey(apiKey);
    // Reload db cards if on database view
    if (typeof renderDbCards === 'function') renderDbCards();
  });
}

async function verifyKey(key) {
  const status = document.getElementById('keyStatus');
  status.textContent = 'Checking…'; status.className = 'key-status';
  try {
    const r = await fetch(`${BASE}/api/publicworks/residents`, { headers: { 'X-API-Key': key } });
    status.textContent = r.ok ? '✓ Valid' : '✗ Invalid';
    status.className = 'key-status ' + (r.ok ? 'ok' : 'err');
  } catch {
    status.textContent = 'Unreachable'; status.className = 'key-status err';
  }
}

/* ─── Sidebar ────────────────────────────────────────────────── */
function buildSidebar() {
  const list = document.getElementById('moduleList');
  MODULES.forEach(mod => {
    const item = document.createElement('div');
    item.className = 'module-item open';
    item.innerHTML = `
      <div class="module-header">
        <span class="module-icon">${mod.icon}</span>
        <span>${mod.label}</span>
        <span class="module-chevron">▶</span>
      </div>
      <div class="module-endpoints">
        ${mod.endpoints.map(ep => `
          <button class="sidebar-endpoint" data-module="${mod.id}" data-ep="${ep.id}">
            <span class="method-badge ${ep.method.toLowerCase()}">${ep.method}</span>
            ${ep.path.replace('/api/publicworks','').replace('/api/keys','') || '/'}
          </button>
        `).join('')}
      </div>`;
    list.appendChild(item);
    item.querySelector('.module-header').addEventListener('click', () => item.classList.toggle('open'));
    item.querySelectorAll('.sidebar-endpoint').forEach(btn => {
      btn.addEventListener('click', () => {
        const ep = mod.endpoints.find(e => e.id === btn.dataset.ep);
        if (ep) selectEndpoint(ep, btn);
      });
    });
  });
}

function bindSidebarKeys() {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ep = KEY_ENDPOINTS[btn.dataset.action];
      if (ep) selectEndpoint({ ...ep, id: btn.dataset.action }, btn);
    });
  });
}

function selectEndpoint(ep, btn) {
  document.querySelectorAll('.sidebar-endpoint').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentEndpoint = ep;

  document.getElementById('welcomePanel').classList.add('hidden');
  document.getElementById('endpointPanel').classList.remove('hidden');
  document.getElementById('responseSection').style.display = 'none';
  document.getElementById('responseTime').textContent = '';

  const badge = document.getElementById('epMethodBadge');
  badge.textContent = ep.method;
  badge.className = 'method-badge-lg ' + ep.method;
  document.getElementById('epPath').textContent = ep.path;
  document.getElementById('epDesc').textContent = ep.description;
  buildParamsForm(ep.params || []);
}

/* ─── Params Form ────────────────────────────────────────────── */
function buildParamsForm(params) {
  const form = document.getElementById('paramsForm');
  const section = document.getElementById('paramsSection');
  if (!params.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  form.innerHTML = params.map(p => `
    <div class="param-row">
      <label for="param_${p.name}">
        ${p.label}
        <span class="param-${p.required ? 'required' : 'optional'}">${p.required ? 'required' : 'optional'}</span>
        <span style="color:#94a3b8;font-size:10px;font-weight:400">${p.in}</span>
      </label>
      <input id="param_${p.name}" type="${p.type || 'text'}" placeholder="${p.hint || ''}" autocomplete="off" />
    </div>`).join('');
}

/* ─── Execute ────────────────────────────────────────────────── */
document.getElementById('executeBtn').addEventListener('click', async () => {
  if (!currentEndpoint) return;
  if (!apiKey) { alert('Enter and save your API key first.'); return; }

  const ep = currentEndpoint;
  const values = {};
  for (const p of ep.params || []) {
    const el = document.getElementById('param_' + p.name);
    if (!el) continue;
    const val = el.value.trim();
    if (p.required && !val) { el.focus(); el.style.borderColor = '#dc2626'; setTimeout(() => el.style.borderColor = '', 1500); return; }
    values[p.name] = val;
  }

  let url = BASE + ep.path;
  const bodyParams = {};
  for (const p of ep.params || []) {
    if (p.in === 'path') url = url.replace(':' + p.name, encodeURIComponent(values[p.name] || ''));
    else if (values[p.name]) bodyParams[p.name] = p.type === 'number' ? Number(values[p.name]) : values[p.name];
  }

  const btn = document.getElementById('executeBtn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Sending…';
  document.getElementById('responseSection').style.display = 'none';

  const t0 = Date.now();
  try {
    const opts = { method: ep.method, headers: { 'X-API-Key': apiKey } };
    if (['POST','PATCH','PUT'].includes(ep.method) && Object.keys(bodyParams).length) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(bodyParams);
    }
    const res = await fetch(url, opts);
    const elapsed = Date.now() - t0;
    let data; try { data = await res.json(); } catch { data = { raw: await res.text() }; }
    showResponse(res.status, data, elapsed);
  } catch (err) {
    showResponse(0, { error: err.message }, Date.now() - t0);
  } finally {
    btn.disabled = false; btn.innerHTML = '<span class="execute-icon">▶</span> Send Request';
  }
});

function showResponse(status, data, elapsed) {
  const section = document.getElementById('responseSection');
  const badge   = document.getElementById('statusBadge');
  section.style.display = 'block';
  badge.textContent = status || 'Error';
  badge.className = 'status-badge ' + (status >= 200 && status < 300 ? 'ok' : status >= 400 && status < 500 ? 'warn' : 'err');
  document.getElementById('responseTime').textContent = elapsed + ' ms';
  document.getElementById('responseBody').innerHTML = syntaxHighlight(JSON.stringify(data, null, 2));
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ─── Copy cURL ──────────────────────────────────────────────── */
document.getElementById('copyCurlBtn').addEventListener('click', () => {
  if (!currentEndpoint) return;
  const ep = currentEndpoint;
  let url = BASE + ep.path;
  const bodyParams = {};
  for (const p of ep.params || []) {
    const el = document.getElementById('param_' + p.name);
    const val = el ? el.value.trim() : '';
    if (p.in === 'path') url = url.replace(':' + p.name, encodeURIComponent(val || ':' + p.name));
    else if (val) bodyParams[p.name] = p.type === 'number' ? Number(val) : val;
  }
  let curl = `curl -s -X ${ep.method} "${url}" \\\n  -H "X-API-Key: ${apiKey || 'YOUR_API_KEY'}"`;
  if (Object.keys(bodyParams).length) curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(bodyParams)}'`;
  navigator.clipboard.writeText(curl).then(() => {
    const b = document.getElementById('copyCurlBtn');
    b.textContent = 'Copied!'; setTimeout(() => b.textContent = 'Copy cURL', 1800);
  });
});

/* ─── JSON syntax highlight ──────────────────────────────────── */
function syntaxHighlight(json) {
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, m => {
    if (/^"/.test(m)) return /:$/.test(m) ? `<span class="json-key">${esc(m)}</span>` : `<span class="json-string">${esc(m)}</span>`;
    if (/true|false/.test(m)) return `<span class="json-bool">${m}</span>`;
    if (/null/.test(m)) return `<span class="json-null">${m}</span>`;
    return `<span class="json-number">${m}</span>`;
  });
}
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
