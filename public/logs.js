/* ═══════════════════════════════════════════════════════════════
   LOGS.JS  —  API request/response log viewer
   ═══════════════════════════════════════════════════════════════ */

/* ─── State ─────────────────────────────────────────────────── */
let logsData       = [];
let autoRefresh    = false;
let autoRefreshTimer = null;
let activeLogId    = null;
let logFilters     = { status: 'all', module: '', method: '', search: '' };

/* ─── Boot ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  bindLogsNav();
});

/* ─── Called when Logs tab becomes active ───────────────────── */
function initLogs() {
  loadLogs();
  loadLogStats();
}

/* ─── Bind controls ─────────────────────────────────────────── */
function bindLogsNav() {
  document.getElementById('logsRefreshBtn').addEventListener('click', () => {
    loadLogs(); loadLogStats();
  });

  document.getElementById('logsClearBtn').addEventListener('click', async () => {
    if (!confirm('Clear all log entries? This cannot be undone.')) return;
    await apiFetch('DELETE', '/api/logs', null, getApiKey());
    loadLogs(); loadLogStats();
  });

  document.getElementById('logsAutoRefresh').addEventListener('change', e => {
    autoRefresh = e.target.checked;
    if (autoRefresh) {
      autoRefreshTimer = setInterval(() => { loadLogs(); loadLogStats(); }, 5000);
    } else {
      clearInterval(autoRefreshTimer);
    }
  });

  // Filters
  document.getElementById('logFilterStatus').addEventListener('change', e => {
    logFilters.status = e.target.value; loadLogs();
  });
  document.getElementById('logFilterModule').addEventListener('change', e => {
    logFilters.module = e.target.value; loadLogs();
  });
  document.getElementById('logFilterMethod').addEventListener('change', e => {
    logFilters.method = e.target.value; loadLogs();
  });
  document.getElementById('logSearch').addEventListener('input', debounce(e => {
    logFilters.search = e.target.value.trim(); loadLogs();
  }, 350));

  // Close detail panel
  document.getElementById('logDetailClose').addEventListener('click', closeLogDetail);
}

/* ─── Load stats bar ────────────────────────────────────────── */
async function loadLogStats() {
  const key = getApiKey();
  if (!key) return;
  try {
    const r = await apiFetch('GET', '/api/logs/stats', null, key);
    const d = await r.json();
    if (!d.success) return;
    const s = d.data;

    const total   = s.byModule.reduce((a, m) => a + m.total, 0);
    const errors  = s.byModule.reduce((a, m) => a + m.errors, 0);
    const avgMs   = s.avgDuration ? Math.round(s.avgDuration) : 0;
    const errRate = total ? Math.round((errors / total) * 100) : 0;

    document.getElementById('statTotal').textContent   = total.toLocaleString();
    document.getElementById('statErrors').textContent  = errors.toLocaleString();
    document.getElementById('statErrRate').textContent = errRate + '%';
    document.getElementById('statAvgMs').textContent   = avgMs + ' ms';
    document.getElementById('stat24h').textContent     = (s.recent24h || 0).toLocaleString();

    // Error rate coloring
    const errEl = document.getElementById('statErrRate');
    errEl.className = 'stat-value ' + (errRate === 0 ? 'green' : errRate < 20 ? 'yellow' : 'red');
  } catch {}
}

/* ─── Load logs table ───────────────────────────────────────── */
async function loadLogs() {
  const key = getApiKey();
  if (!key) {
    document.getElementById('logsTableBody').innerHTML =
      `<tr><td colspan="8" class="log-empty">Enter your API key to view logs.</td></tr>`;
    return;
  }

  const params = new URLSearchParams({ limit: 200 });
  if (logFilters.status !== 'all') params.set('status', logFilters.status);
  if (logFilters.module)  params.set('module', logFilters.module);
  if (logFilters.method)  params.set('method', logFilters.method);
  if (logFilters.search)  params.set('search', logFilters.search);

  try {
    const r = await apiFetch('GET', '/api/logs?' + params, null, key);
    const d = await r.json();
    if (!d.success) return;
    logsData = d.data;
    renderLogsTable(logsData, d.total);
  } catch (err) {
    document.getElementById('logsTableBody').innerHTML =
      `<tr><td colspan="8" class="log-empty">Failed to load logs: ${err.message}</td></tr>`;
  }
}

/* ─── Render table ──────────────────────────────────────────── */
function renderLogsTable(rows, total) {
  const tbody = document.getElementById('logsTableBody');
  document.getElementById('logsTotalCount').textContent =
    `${rows.length} of ${total} entries`;

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="log-empty">No log entries match your filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(row => {
    const success = row.success === 1;
    const rowClass = success ? '' : 'log-row-error';
    const ts = formatTimestamp(row.timestamp);
    const dur = formatDuration(row.duration_ms);
    const durClass = row.duration_ms < 100 ? 'dur-fast' : row.duration_ms < 500 ? 'dur-mid' : 'dur-slow';

    return `<tr class="log-row ${rowClass}" data-id="${row.id}" onclick="openLogDetail(${row.id})">
      <td class="log-ts">${ts}</td>
      <td><span class="method-pill method-${row.method.toLowerCase()}">${row.method}</span></td>
      <td class="log-path" title="${esc(row.path)}">${esc(row.path)}</td>
      <td><span class="status-pill ${statusClass(row.status_code)}">${row.status_code || '—'}</span></td>
      <td><span class="${durClass}">${dur}</span></td>
      <td><span class="module-pill">${row.module}</span></td>
      <td class="log-key">${esc(row.api_key_name || '—')}</td>
      <td class="log-ip">${esc(row.ip_address || '—')}</td>
    </tr>`;
  }).join('');
}

/* ─── Detail Panel ──────────────────────────────────────────── */
function openLogDetail(id) {
  activeLogId = id;
  const row = logsData.find(r => r.id === id);
  if (!row) return;

  document.querySelectorAll('.log-row').forEach(r => r.classList.remove('log-row-active'));
  document.querySelector(`.log-row[data-id="${id}"]`)?.classList.add('log-row-active');

  const panel = document.getElementById('logDetailPanel');
  panel.classList.remove('hidden');

  // Header
  document.getElementById('detailMethod').textContent   = row.method;
  document.getElementById('detailMethod').className     = `method-pill method-${row.method.toLowerCase()} detail-method`;
  document.getElementById('detailPath').textContent     = row.path;
  document.getElementById('detailStatus').textContent   = row.status_code || '—';
  document.getElementById('detailStatus').className     = `status-pill ${statusClass(row.status_code)} detail-status`;
  document.getElementById('detailTs').textContent       = formatTimestamp(row.timestamp, true);
  document.getElementById('detailDur').textContent      = formatDuration(row.duration_ms);
  document.getElementById('detailDur').className        = row.duration_ms < 100 ? 'dur-fast' : row.duration_ms < 500 ? 'dur-mid' : 'dur-slow';
  document.getElementById('detailKey').textContent      = row.api_key_name || '—';
  document.getElementById('detailIp').textContent       = row.ip_address || '—';
  document.getElementById('detailModule').textContent   = row.module || '—';

  // Request
  const reqBody  = tryParse(row.request_body);
  const reqQuery = tryParse(row.request_query);
  document.getElementById('detailReqBody').innerHTML  = syntaxHL(JSON.stringify(reqBody,  null, 2));
  document.getElementById('detailReqQuery').innerHTML = syntaxHL(JSON.stringify(reqQuery, null, 2));

  // Response
  const resBody = tryParse(row.response_body);
  document.getElementById('detailResBody').innerHTML = syntaxHL(JSON.stringify(resBody, null, 2));

  // Success banner or error banner
  const banner = document.getElementById('detailBanner');
  if (row.success) {
    banner.className = 'detail-banner banner-success';
    banner.textContent = '✓ Request succeeded';
  } else {
    banner.className = 'detail-banner banner-error';
    const msg = resBody?.message || resBody?.error || `HTTP ${row.status_code}`;
    banner.textContent = `✗ ${msg}`;
  }
}

function closeLogDetail() {
  document.getElementById('logDetailPanel').classList.add('hidden');
  document.querySelectorAll('.log-row').forEach(r => r.classList.remove('log-row-active'));
  activeLogId = null;
}

/* ─── Syntax Highlighting ────────────────────────────────────── */
function syntaxHL(json) {
  if (!json || json === 'null' || json === '{}') {
    return `<span class="hl-null">— empty —</span>`;
  }
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      match => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span class="hl-key">${match}</span>`;
          return `<span class="hl-str">${match}</span>`;
        }
        if (/true|false/.test(match)) return `<span class="hl-bool">${match}</span>`;
        if (/null/.test(match))       return `<span class="hl-null">${match}</span>`;
        return `<span class="hl-num">${match}</span>`;
      }
    );
}

/* ─── Helpers ───────────────────────────────────────────────── */
function statusClass(code) {
  if (!code) return 'status-unknown';
  if (code < 300) return 'status-2xx';
  if (code < 400) return 'status-3xx';
  if (code < 500) return 'status-4xx';
  return 'status-5xx';
}

function formatTimestamp(ts, full = false) {
  if (!ts) return '—';
  const d = new Date(ts + (ts.includes('Z') ? '' : 'Z'));
  if (full) return d.toLocaleString();
  return d.toLocaleTimeString() + ' ' + d.toLocaleDateString(undefined, { month:'short', day:'numeric' });
}

function formatDuration(ms) {
  if (ms == null) return '—';
  if (ms < 1000) return ms + ' ms';
  return (ms / 1000).toFixed(1) + ' s';
}

function tryParse(str) {
  if (!str) return null;
  try { return JSON.parse(str); } catch { return { raw: str }; }
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function getApiKey() { return localStorage.getItem('apiiq_key') || ''; }

function apiFetch(method, path, body, key) {
  const opts = { method, headers: { 'X-API-Key': key } };
  if (body && ['POST','PUT','PATCH'].includes(method)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  return fetch(window.location.origin + path, opts);
}
