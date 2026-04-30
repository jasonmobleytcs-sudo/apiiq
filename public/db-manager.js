/* ═══════════════════════════════════════════════════════════════
   DB MANAGER  —  Database dashboard, table view, add/edit/delete
   ═══════════════════════════════════════════════════════════════ */

/* ─── Database Registry ─────────────────────────────────────────
   Add a new database here and the entire UI auto-builds:
   cards, table columns, sort, add form, and edit form.
   ─────────────────────────────────────────────────────────────── */
const DB_REGISTRY = [
  {
    id: 'publicworks',
    name: 'Public Works',
    icon: '🗑',
    description: 'Newport News sanitation accounts — trash, recycling, bulk pickup, inspections, and billing.',
    color: '#2563eb',
    api: {
      list:   { method: 'GET',    path: '/api/publicworks/residents' },
      create: { method: 'POST',   path: '/api/publicworks/residents' },
      update: { method: 'PUT',    path: '/api/publicworks/account/:account_number' },
      delete: { method: 'DELETE', path: '/api/publicworks/account/:account_number' },
      idField: 'account_number'
    },
    /* Columns shown in the table */
    columns: [
      { key: 'account_number', label: 'Account #',   sortable: true,  type: 'mono' },
      { key: 'name',           label: 'Name',         sortable: true  },
      { key: 'phone',          label: 'Phone',        sortable: false },
      { key: 'address',        label: 'Address',      sortable: true  },
      { key: 'service_type',   label: 'Service',      sortable: true  },
      { key: 'balance',        label: 'Balance',      sortable: true,  format: 'currency' },
      { key: 'last_inspection',label: 'Last Inspection', sortable: true },
      { key: 'inspection_result', label: 'Result',   sortable: true,  format: 'badge' },
    ],
    /* Fields for the add / edit modal */
    fields: [
      { key: 'account_number',    label: 'Account Number',    type: 'text',   required: true,  readonlyOnEdit: true,  hint: 'e.g. NN10041' },
      { key: 'name',              label: 'Full Name',          type: 'text',   required: true },
      { key: 'gender',            label: 'Gender',             type: 'select', required: true,  options: ['M','F'] },
      { key: 'pin',               label: 'PIN',                type: 'text',   required: true,  hint: '4-digit PIN' },
      { key: 'phone',             label: 'Phone',              type: 'text',   required: true,  hint: '757-555-0000' },
      { key: 'email',             label: 'Email',              type: 'email',  required: false, fullWidth: true },
      { key: 'address',           label: 'Address',            type: 'text',   required: true,  fullWidth: true },
      { key: 'service_type',      label: 'Service Type',       type: 'select', required: true,  options: ['Trash','Recycling','Trash/Recycling','Bulk Pickup'] },
      { key: 'balance',           label: 'Balance ($)',        type: 'number', required: false, hint: '0.00' },
      { key: 'last_inspection',   label: 'Last Inspection',    type: 'text',   required: false, hint: 'MM/DD/YYYY' },
      { key: 'inspection_result', label: 'Inspection Result',  type: 'select', required: false, options: ['','Pass','Fail'] },
    ]
  }
  /* ── Add future databases here, e.g.:
  {
    id: 'water',
    name: 'Water & Sewer',
    icon: '💧',
    ...
  }
  ── */
];

/* ─── State ─────────────────────────────────────────────────── */
let activeDb      = null;   // DB_REGISTRY entry currently open
let allRows       = [];     // raw data from API
let filteredRows  = [];     // after search filter
let sortKey       = null;
let sortDir       = 'asc';
let editingRow    = null;   // null = add mode, object = edit mode
let deleteTarget  = null;

/* ─── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderDbCards();
  bindDbNav();
});

/* ─── Render DB Cards ───────────────────────────────────────── */
function renderDbCards() {
  const grid = document.getElementById('dbCards');
  grid.innerHTML = '';
  DB_REGISTRY.forEach(db => {
    const card = document.createElement('div');
    card.className = 'db-card';
    card.style.setProperty('--card-color', db.color || '#2563eb');
    card.innerHTML = `
      <div class="db-card-icon">${db.icon}</div>
      <div class="db-card-name">${db.name}</div>
      <div class="db-card-desc">${db.description}</div>
      <div class="db-card-footer">
        <span class="db-card-count" id="count-${db.id}">Loading…</span>
        <span class="db-card-arrow">→</span>
      </div>
    `;
    card.addEventListener('click', () => openDatabase(db));
    grid.appendChild(card);
    // Load count
    loadCount(db);
  });
}

async function loadCount(db) {
  const key = getApiKey();
  if (!key) { document.getElementById(`count-${db.id}`).textContent = '—'; return; }
  try {
    const r = await apiFetch(db.api.list.method, db.api.list.path, null, key);
    const data = await r.json();
    const n = data.count ?? data.data?.length ?? '?';
    document.getElementById(`count-${db.id}`).textContent = `${n} records`;
  } catch {
    document.getElementById(`count-${db.id}`).textContent = '—';
  }
}

/* ─── Open a Database ───────────────────────────────────────── */
async function openDatabase(db) {
  activeDb = db;
  sortKey = null; sortDir = 'asc';

  document.getElementById('db-home').classList.add('hidden');
  document.getElementById('db-table-view').classList.remove('hidden');
  document.getElementById('tableTitle').textContent = db.name;
  document.getElementById('tableSearch').value = '';

  buildTableHead(db);
  await loadTableData();
}

/* ─── Nav bindings ──────────────────────────────────────────── */
function bindDbNav() {
  document.getElementById('backToDbs').addEventListener('click', () => {
    document.getElementById('db-table-view').classList.add('hidden');
    document.getElementById('db-home').classList.remove('hidden');
    renderDbCards();
  });

  document.getElementById('tableSearch').addEventListener('input', e => {
    applySearch(e.target.value.trim().toLowerCase());
  });

  document.getElementById('addRowBtn').addEventListener('click', () => openModal(null));

  // Modal buttons
  document.getElementById('modalClose').addEventListener('click',  closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalSave').addEventListener('click',   saveRecord);

  // Confirm delete modal
  document.getElementById('confirmClose').addEventListener('click',  () => closeConfirm());
  document.getElementById('confirmCancel').addEventListener('click', () => closeConfirm());
  document.getElementById('confirmDelete').addEventListener('click', () => doDelete());

  // Close modals on overlay click
  document.getElementById('recordModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.getElementById('confirmModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeConfirm(); });
}

/* ─── Build Table Header ────────────────────────────────────── */
function buildTableHead(db) {
  const thead = document.getElementById('tableHead');
  const row = document.createElement('tr');
  db.columns.forEach(col => {
    const th = document.createElement('th');
    th.dataset.key = col.key;
    if (col.sortable) {
      th.className = 'sortable';
      th.innerHTML = `${col.label} <span class="sort-icon">⇅</span>`;
      th.addEventListener('click', () => toggleSort(col.key));
    } else {
      th.textContent = col.label;
    }
    row.appendChild(th);
  });
  // Actions column
  const thAct = document.createElement('th');
  thAct.textContent = 'Actions';
  row.appendChild(thAct);
  thead.innerHTML = '';
  thead.appendChild(row);
}

/* ─── Load Table Data ───────────────────────────────────────── */
async function loadTableData() {
  const key = getApiKey();
  if (!key) { showTableEmpty('Enter your API key in the nav bar to load data.'); return; }

  try {
    const r = await apiFetch(activeDb.api.list.method, activeDb.api.list.path, null, key);
    const data = await r.json();
    allRows = data.data || [];
    filteredRows = [...allRows];
    const q = document.getElementById('tableSearch').value.trim().toLowerCase();
    if (q) applySearch(q);
    else renderTable();
    updateMeta();
  } catch (err) {
    showTableEmpty('Failed to load data: ' + err.message);
  }
}

/* ─── Search / Filter ───────────────────────────────────────── */
function applySearch(q) {
  if (!q) {
    filteredRows = [...allRows];
  } else {
    filteredRows = allRows.filter(row =>
      activeDb.columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
    );
  }
  if (sortKey) applySortToFiltered();
  renderTable();
  updateMeta();
}

/* ─── Sort ──────────────────────────────────────────────────── */
function toggleSort(key) {
  if (sortKey === key) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey = key; sortDir = 'asc';
  }
  applySortToFiltered();
  renderTable();
  updateSortIcons();
}

function applySortToFiltered() {
  filteredRows.sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (av == null) av = '';
    if (bv == null) bv = '';
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av;
    }
    av = String(av).toLowerCase(); bv = String(bv).toLowerCase();
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });
}

function updateSortIcons() {
  document.querySelectorAll('#tableHead th').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    const icon = th.querySelector('.sort-icon');
    if (!icon) return;
    if (th.dataset.key === sortKey) {
      th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
      icon.textContent = sortDir === 'asc' ? '↑' : '↓';
    } else {
      icon.textContent = '⇅';
    }
  });
}

/* ─── Render Table Rows ─────────────────────────────────────── */
function renderTable() {
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('tableEmpty');

  tbody.innerHTML = '';
  if (filteredRows.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  filteredRows.forEach(row => {
    const tr = document.createElement('tr');
    activeDb.columns.forEach(col => {
      const td = document.createElement('td');
      if (col.type === 'mono') td.className = 'mono';
      td.innerHTML = formatCell(row[col.key], col.format);
      tr.appendChild(td);
    });
    // Actions
    const tdAct = document.createElement('td');
    tdAct.innerHTML = `<div class="row-actions">
      <button class="btn-row btn-row-edit"   data-id="${row[activeDb.api.idField]}">Edit</button>
      <button class="btn-row btn-row-delete" data-id="${row[activeDb.api.idField]}">Delete</button>
    </div>`;
    tdAct.querySelector('.btn-row-edit').addEventListener('click',   () => openModal(row));
    tdAct.querySelector('.btn-row-delete').addEventListener('click', () => confirmDelete(row));
    tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
}

function formatCell(val, format) {
  if (val == null || val === '') return '<span style="color:var(--text-light)">—</span>';
  if (format === 'currency') return `$${Number(val).toFixed(2)}`;
  if (format === 'badge') {
    const cls = val === 'Pass' ? 'badge-pass' : val === 'Fail' ? 'badge-fail' : 'badge-neutral';
    return `<span class="badge ${cls}">${val}</span>`;
  }
  // Escape HTML
  return String(val).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function updateMeta() {
  document.getElementById('tableCount').textContent = `${allRows.length} total records`;
  if (filteredRows.length !== allRows.length) {
    document.getElementById('tableFiltered').textContent = `· ${filteredRows.length} shown`;
  } else {
    document.getElementById('tableFiltered').textContent = '';
  }
}

function showTableEmpty(msg) {
  document.getElementById('tableBody').innerHTML = '';
  const el = document.getElementById('tableEmpty');
  el.textContent = msg;
  el.classList.remove('hidden');
}

/* ─── Add / Edit Modal ──────────────────────────────────────── */
function openModal(row) {
  editingRow = row;
  const isEdit = row !== null;
  document.getElementById('modalTitle').textContent = isEdit
    ? `Edit — ${row[activeDb.api.idField]}`
    : `Add New ${activeDb.name} Record`;

  const form = document.getElementById('modalForm');
  form.innerHTML = '';

  activeDb.fields.forEach(f => {
    const div = document.createElement('div');
    div.className = 'field-group' + (f.fullWidth ? ' field-full' : '');

    let inputEl;
    if (f.type === 'select') {
      inputEl = `<select id="mf_${f.key}" ${isEdit && f.readonlyOnEdit ? 'disabled' : ''}>
        ${(f.options || []).map(o => `<option value="${o}" ${row && row[f.key] === o ? 'selected' : ''}>${o || '— none —'}</option>`).join('')}
      </select>`;
    } else {
      const val = row ? (row[f.key] ?? '') : '';
      const ro  = isEdit && f.readonlyOnEdit ? 'readonly' : '';
      inputEl = `<input id="mf_${f.key}" type="${f.type || 'text'}"
        value="${String(val).replace(/"/g,'&quot;')}"
        placeholder="${f.hint || ''}" ${ro} autocomplete="off" />`;
    }

    div.innerHTML = `
      <label for="mf_${f.key}">
        ${f.label}
        ${f.required ? '<span class="field-req">required</span>' : ''}
      </label>
      ${inputEl}
    `;
    form.appendChild(div);
  });

  document.getElementById('recordModal').classList.remove('hidden');
  // Focus first editable field
  const first = form.querySelector('input:not([readonly]), select');
  if (first) setTimeout(() => first.focus(), 80);
}

function closeModal() {
  document.getElementById('recordModal').classList.add('hidden');
  editingRow = null;
}

async function saveRecord() {
  const db = activeDb;
  const body = {};
  let valid = true;

  db.fields.forEach(f => {
    const el = document.getElementById('mf_' + f.key);
    if (!el) return;
    const val = el.value.trim();
    el.classList.remove('field-error');
    if (f.required && !val && !(editingRow && f.readonlyOnEdit)) {
      el.classList.add('field-error');
      el.focus();
      valid = false;
    }
    body[f.key] = f.type === 'number' ? (val === '' ? 0 : Number(val)) : val;
  });
  if (!valid) return;

  const saveBtn = document.getElementById('modalSave');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    let method, path;
    if (editingRow) {
      method = db.api.update.method;
      path   = db.api.update.path.replace(':' + db.api.idField, encodeURIComponent(editingRow[db.api.idField]));
    } else {
      method = db.api.create.method;
      path   = db.api.create.path;
    }

    const r = await apiFetch(method, path, body, getApiKey());
    const data = await r.json();

    if (!r.ok) {
      alert('Error: ' + (data.message || r.status));
      return;
    }

    closeModal();
    await loadTableData();
    renderDbCards(); // refresh card counts
  } catch (err) {
    alert('Request failed: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Record';
  }
}

/* ─── Delete ────────────────────────────────────────────────── */
function confirmDelete(row) {
  deleteTarget = row;
  const id = row[activeDb.api.idField];
  document.getElementById('confirmMsg').textContent =
    `Are you sure you want to permanently delete record "${id}"? This cannot be undone.`;
  document.getElementById('confirmModal').classList.remove('hidden');
}

function closeConfirm() {
  document.getElementById('confirmModal').classList.add('hidden');
  deleteTarget = null;
}

async function doDelete() {
  if (!deleteTarget) return;
  const db = activeDb;
  const id = deleteTarget[db.api.idField];
  const path = db.api.delete.path.replace(':' + db.api.idField, encodeURIComponent(id));

  const btn = document.getElementById('confirmDelete');
  btn.disabled = true; btn.textContent = 'Deleting…';

  try {
    const r = await apiFetch(db.api.delete.method, path, null, getApiKey());
    if (!r.ok) {
      const d = await r.json();
      alert('Error: ' + (d.message || r.status));
      return;
    }
    closeConfirm();
    await loadTableData();
    renderDbCards();
  } catch (err) {
    alert('Request failed: ' + err.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Delete';
  }
}

/* ─── Helpers ───────────────────────────────────────────────── */
function getApiKey() {
  return localStorage.getItem('apiiq_key') || '';
}

function apiFetch(method, path, body, key) {
  const opts = {
    method,
    headers: { 'X-API-Key': key }
  };
  if (body && ['POST','PUT','PATCH'].includes(method)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  return fetch(window.location.origin + path, opts);
}
