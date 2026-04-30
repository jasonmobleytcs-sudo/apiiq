/* ─── Config ─────────────────────────────────────────────────── */
const BASE = window.location.origin;

/* ─── Endpoint definitions ───────────────────────────────────── */
const MODULES = [
  {
    id: 'publicworks',
    label: 'Public Works',
    icon: '🗑',
    endpoints: [
      {
        id: 'pw-account',
        method: 'GET',
        path: '/api/publicworks/account/:accountNumber',
        description: 'Look up a resident\'s full account details by account number.',
        params: [
          { name: 'accountNumber', label: 'Account Number', type: 'text', in: 'path', required: true, hint: 'e.g. NN10001' }
        ]
      },
      {
        id: 'pw-phone',
        method: 'GET',
        path: '/api/publicworks/phone/:phone',
        description: 'Look up a resident by their phone number. Strips all non-digit characters.',
        params: [
          { name: 'phone', label: 'Phone Number', type: 'text', in: 'path', required: true, hint: 'e.g. 7575552101 or 757-555-2101' }
        ]
      },
      {
        id: 'pw-verify',
        method: 'POST',
        path: '/api/publicworks/verify-pin',
        description: 'Verify a resident\'s PIN for IVR authentication. Returns authenticated: true/false.',
        params: [
          { name: 'account_number', label: 'Account Number', type: 'text', in: 'body', required: true, hint: 'e.g. NN10001' },
          { name: 'pin', label: 'PIN', type: 'text', in: 'body', required: true, hint: 'e.g. 4421' }
        ]
      },
      {
        id: 'pw-services',
        method: 'GET',
        path: '/api/publicworks/account/:accountNumber/services',
        description: 'Get the service type and inspection details for an account.',
        params: [
          { name: 'accountNumber', label: 'Account Number', type: 'text', in: 'path', required: true, hint: 'e.g. NN10001' }
        ]
      },
      {
        id: 'pw-balance',
        method: 'GET',
        path: '/api/publicworks/account/:accountNumber/balance',
        description: 'Get the current outstanding balance for an account.',
        params: [
          { name: 'accountNumber', label: 'Account Number', type: 'text', in: 'path', required: true, hint: 'e.g. NN10002 (has $12.50 balance)' }
        ]
      },
      {
        id: 'pw-inspection',
        method: 'GET',
        path: '/api/publicworks/account/:accountNumber/inspection',
        description: 'Get the last inspection date and pass/fail result for an account.',
        params: [
          { name: 'accountNumber', label: 'Account Number', type: 'text', in: 'path', required: true, hint: 'e.g. NN10003 (failed inspection)' }
        ]
      },
      {
        id: 'pw-pay',
        method: 'PATCH',
        path: '/api/publicworks/account/:accountNumber/balance',
        description: 'Apply a payment to reduce the account balance.',
        params: [
          { name: 'accountNumber', label: 'Account Number', type: 'text', in: 'path', required: true, hint: 'e.g. NN10002' },
          { name: 'amount', label: 'Payment Amount ($)', type: 'number', in: 'body', required: true, hint: 'e.g. 12.50' }
        ]
      },
      {
        id: 'pw-residents',
        method: 'GET',
        path: '/api/publicworks/residents',
        description: 'List all residents in the Public Works database. Useful for demos and admin views.',
        params: []
      }
    ]
  }
];

const KEY_ENDPOINTS = {
  'key-list': {
    method: 'GET', path: '/api/keys',
    description: 'List all API keys. Values are masked — only the first 8 characters are shown.',
    params: []
  },
  'key-create': {
    method: 'POST', path: '/api/keys',
    description: 'Create a new API key. The full key is only shown once — save it immediately.',
    params: [
      { name: 'name', label: 'Key Name', type: 'text', in: 'body', required: true, hint: 'e.g. Zoom VA Key' },
      { name: 'description', label: 'Description', type: 'text', in: 'body', required: false, hint: 'e.g. Used for virtual agent demo flow' }
    ]
  },
  'key-revoke': {
    method: 'DELETE', path: '/api/keys/:id',
    description: 'Revoke (deactivate) an API key by its ID. The key will immediately stop working.',
    params: [
      { name: 'id', label: 'Key ID', type: 'text', in: 'path', required: true, hint: 'Numeric ID from GET /api/keys' }
    ]
  }
};

/* ─── State ──────────────────────────────────────────────────── */
let currentEndpoint = null;
let apiKey = localStorage.getItem('apiiq_key') || '';

/* ─── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildSidebar();
  initKeyBar();
  bindSidebarKeys();
});

/* ─── Sidebar ────────────────────────────────────────────────── */
function buildSidebar() {
  const list = document.getElementById('moduleList');
  MODULES.forEach(mod => {
    const item = document.createElement('div');
    item.className = 'module-item';
    item.innerHTML = `
      <div class="module-header" data-id="${mod.id}">
        <span class="module-icon">${mod.icon}</span>
        <span>${mod.label}</span>
        <span class="module-chevron">▶</span>
      </div>
      <div class="module-endpoints">
        ${mod.endpoints.map(ep => `
          <button class="sidebar-endpoint" data-module="${mod.id}" data-ep="${ep.id}">
            <span class="method-badge ${ep.method.toLowerCase()}">${ep.method}</span>
            ${shortPath(ep.path)}
          </button>
        `).join('')}
      </div>
    `;
    list.appendChild(item);

    item.querySelector('.module-header').addEventListener('click', () => {
      item.classList.toggle('open');
    });

    item.querySelectorAll('.sidebar-endpoint').forEach(btn => {
      btn.addEventListener('click', () => {
        const ep = mod.endpoints.find(e => e.id === btn.dataset.ep);
        if (ep) selectEndpoint(ep, btn);
      });
    });

    // Open first module by default
    item.classList.add('open');
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

function shortPath(path) {
  return path.replace('/api/publicworks', '').replace('/api/keys', '') || '/';
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

  buildParamsForm(ep.params);
}

/* ─── Params Form ────────────────────────────────────────────── */
function buildParamsForm(params) {
  const form = document.getElementById('paramsForm');
  const section = document.getElementById('paramsSection');

  if (!params || params.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';

  form.innerHTML = params.map(p => `
    <div class="param-row">
      <label for="param_${p.name}">
        ${p.label}
        <span class="param-${p.required ? 'required' : 'optional'}">${p.required ? 'required' : 'optional'}</span>
        <span style="color:#94a3b8;font-size:10px;font-weight:400">${p.in === 'body' ? 'body' : 'path'}</span>
      </label>
      <input id="param_${p.name}" type="${p.type || 'text'}" placeholder="${p.hint || ''}" autocomplete="off" />
      ${p.hint ? `<span class="param-hint">${p.hint}</span>` : ''}
    </div>
  `).join('');
}

/* ─── API Key Bar ────────────────────────────────────────────── */
function initKeyBar() {
  const input = document.getElementById('apiKeyInput');
  input.value = apiKey;
  if (apiKey) setKeyStatus(true);

  document.getElementById('toggleKey').addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('saveKey').addEventListener('click', () => {
    apiKey = input.value.trim();
    localStorage.setItem('apiiq_key', apiKey);
    verifyKey(apiKey);
  });

  if (apiKey) verifyKey(apiKey);
}

async function verifyKey(key) {
  const status = document.getElementById('keyStatus');
  status.textContent = 'Checking…';
  status.className = 'key-status';
  try {
    const r = await fetch(`${BASE}/api/publicworks/residents`, {
      headers: { 'X-API-Key': key }
    });
    if (r.ok) {
      setKeyStatus(true);
    } else {
      setKeyStatus(false);
    }
  } catch {
    status.textContent = 'Unreachable';
    status.className = 'key-status err';
  }
}

function setKeyStatus(ok) {
  const status = document.getElementById('keyStatus');
  status.textContent = ok ? '✓ Valid' : '✗ Invalid';
  status.className = 'key-status ' + (ok ? 'ok' : 'err');
}

/* ─── Execute Request ────────────────────────────────────────── */
document.getElementById('executeBtn').addEventListener('click', async () => {
  if (!currentEndpoint) return;
  if (!apiKey) {
    alert('Enter and save your API key first.');
    return;
  }

  const ep = currentEndpoint;
  const params = ep.params || [];

  // Collect values
  const values = {};
  for (const p of params) {
    const el = document.getElementById('param_' + p.name);
    if (!el) continue;
    const val = el.value.trim();
    if (p.required && !val) {
      el.focus();
      el.style.borderColor = '#dc2626';
      setTimeout(() => el.style.borderColor = '', 1500);
      return;
    }
    values[p.name] = val;
  }

  // Build URL
  let url = BASE + ep.path;
  const bodyParams = {};
  for (const p of params) {
    if (p.in === 'path') {
      url = url.replace(':' + p.name, encodeURIComponent(values[p.name] || ''));
    } else {
      if (values[p.name] !== undefined && values[p.name] !== '') {
        bodyParams[p.name] = p.type === 'number' ? Number(values[p.name]) : values[p.name];
      }
    }
  }

  // UI: loading
  const btn = document.getElementById('executeBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending…';
  document.getElementById('responseSection').style.display = 'none';

  const t0 = Date.now();
  try {
    const opts = {
      method: ep.method,
      headers: { 'X-API-Key': apiKey }
    };
    if (['POST', 'PATCH', 'PUT'].includes(ep.method) && Object.keys(bodyParams).length > 0) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(bodyParams);
    }

    const res = await fetch(url, opts);
    const elapsed = Date.now() - t0;
    let data;
    try { data = await res.json(); } catch { data = { raw: await res.text() }; }

    showResponse(res.status, data, elapsed);
  } catch (err) {
    showResponse(0, { error: err.message }, Date.now() - t0);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="execute-icon">▶</span> Send Request';
  }
});

function showResponse(status, data, elapsed) {
  const section = document.getElementById('responseSection');
  const badge = document.getElementById('statusBadge');
  const pre = document.getElementById('responseBody');
  const timeEl = document.getElementById('responseTime');

  section.style.display = 'block';

  badge.textContent = status || 'Error';
  if (status >= 200 && status < 300) badge.className = 'status-badge ok';
  else if (status >= 400 && status < 500) badge.className = 'status-badge warn';
  else badge.className = 'status-badge err';

  timeEl.textContent = elapsed + ' ms';
  pre.innerHTML = syntaxHighlight(JSON.stringify(data, null, 2));
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ─── Copy cURL ──────────────────────────────────────────────── */
document.getElementById('copyCurlBtn').addEventListener('click', () => {
  if (!currentEndpoint) return;
  const ep = currentEndpoint;
  const params = ep.params || [];
  const values = {};
  for (const p of params) {
    const el = document.getElementById('param_' + p.name);
    if (el) values[p.name] = el.value.trim();
  }

  let url = BASE + ep.path;
  const bodyParams = {};
  for (const p of params) {
    if (p.in === 'path') {
      url = url.replace(':' + p.name, encodeURIComponent(values[p.name] || ':' + p.name));
    } else if (values[p.name]) {
      bodyParams[p.name] = p.type === 'number' ? Number(values[p.name]) : values[p.name];
    }
  }

  let curl = `curl -s -X ${ep.method} "${url}" \\\n  -H "X-API-Key: ${apiKey || 'YOUR_API_KEY'}"`;
  if (Object.keys(bodyParams).length > 0) {
    curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(bodyParams)}'`;
  }

  navigator.clipboard.writeText(curl).then(() => {
    const btn = document.getElementById('copyCurlBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy cURL', 1800);
  });
});

/* ─── JSON Syntax Highlight ──────────────────────────────────── */
function syntaxHighlight(json) {
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
    if (/^"/.test(match)) {
      if (/:$/.test(match)) return `<span class="json-key">${esc(match)}</span>`;
      return `<span class="json-string">${esc(match)}</span>`;
    }
    if (/true|false/.test(match)) return `<span class="json-bool">${match}</span>`;
    if (/null/.test(match)) return `<span class="json-null">${match}</span>`;
    return `<span class="json-number">${match}</span>`;
  });
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
