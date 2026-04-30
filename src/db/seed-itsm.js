const db = require('./index');

function seedITSM() {
  // ── Create table ──────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS it_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT CHECK(category IN ('Hardware','Software','Network','Access','Security','Email','Other')),
      priority TEXT CHECK(priority IN ('Critical','High','Medium','Low')),
      status TEXT CHECK(status IN ('Open','In Progress','Pending','Resolved','Closed')),
      requester_name TEXT NOT NULL,
      requester_email TEXT,
      requester_phone TEXT,
      requester_dept TEXT,
      assigned_to TEXT,
      created_date TEXT,
      updated_date TEXT,
      resolved_date TEXT,
      sla_breach TEXT CHECK(sla_breach IN ('Yes','No')) DEFAULT 'No',
      resolution_notes TEXT,
      asset_tag TEXT
    );
  `);

  // ── Master ticket list ────────────────────────────────────────────────────────
  const tickets = [
    { ticket_number: 'TKT-00001', title: 'Laptop will not power on',              category: 'Hardware',  priority: 'High',     status: 'Resolved',     requester_name: 'Brianna Washington', requester_email: 'bwashington@company.com', requester_phone: '757-555-7001', requester_dept: 'HR',          assigned_to: 'Alex Nguyen',    created_date: '2026-03-10', updated_date: '2026-03-12', resolved_date: '2026-03-12', sla_breach: 'No',  resolution_notes: 'Battery replaced. Laptop fully operational.',                     asset_tag: 'LPT-1902' },
    { ticket_number: 'TKT-00002', title: 'Unable to access shared drive',         category: 'Access',    priority: 'Medium',   status: 'Resolved',     requester_name: 'Devon Mercer',       requester_email: 'dmercer@company.com',    requester_phone: '757-555-7002', requester_dept: 'Finance',     assigned_to: 'Rita Patel',     created_date: '2026-03-11', updated_date: '2026-03-11', resolved_date: '2026-03-11', sla_breach: 'No',  resolution_notes: 'Permissions corrected in Active Directory.',                     asset_tag: null       },
    { ticket_number: 'TKT-00003', title: 'Email not syncing on mobile device',    category: 'Email',     priority: 'Low',      status: 'Closed',       requester_name: 'Keisha Fountain',    requester_email: 'kfountain@company.com',  requester_phone: '757-555-7003', requester_dept: 'Sales',       assigned_to: 'Alex Nguyen',    created_date: '2026-03-15', updated_date: '2026-03-16', resolved_date: '2026-03-16', sla_breach: 'No',  resolution_notes: 'Reconfigured Exchange account on iPhone. Issue resolved.',        asset_tag: null       },
    { ticket_number: 'TKT-00004', title: 'VPN connection dropping repeatedly',    category: 'Network',   priority: 'High',     status: 'Resolved',     requester_name: 'Priya Nair',         requester_email: 'pnair@company.com',      requester_phone: '757-555-7004', requester_dept: 'Engineering', assigned_to: 'Carlos Rivera',  created_date: '2026-03-18', updated_date: '2026-03-19', resolved_date: '2026-03-20', sla_breach: 'No',  resolution_notes: 'Updated VPN client to v4.2.1. Stable connection confirmed.',     asset_tag: 'LPT-2214' },
    { ticket_number: 'TKT-00005', title: 'Suspicious login alert from overseas',  category: 'Security',  priority: 'Critical', status: 'Closed',       requester_name: 'Michael Ruiz',       requester_email: 'mruiz@company.com',      requester_phone: '757-555-7005', requester_dept: 'Finance',     assigned_to: 'Rita Patel',     created_date: '2026-03-20', updated_date: '2026-03-20', resolved_date: '2026-03-21', sla_breach: 'No',  resolution_notes: 'Account locked, password reset, MFA enforced.',                  asset_tag: null       },
    { ticket_number: 'TKT-00006', title: 'Printer offline on 3rd floor',          category: 'Hardware',  priority: 'Medium',   status: 'Resolved',     requester_name: 'Camille Dubois',     requester_email: 'cdubois@company.com',    requester_phone: '757-555-7006', requester_dept: 'Operations',  assigned_to: 'Alex Nguyen',    created_date: '2026-03-22', updated_date: '2026-03-23', resolved_date: '2026-03-23', sla_breach: 'No',  resolution_notes: 'Replaced printer drum unit. Printer back online.',               asset_tag: 'PRT-0441' },
    { ticket_number: 'TKT-00007', title: 'Software license expired - Adobe',      category: 'Software',  priority: 'Medium',   status: 'Closed',       requester_name: 'Tyler Norwood',      requester_email: 'tnorwood@company.com',   requester_phone: '757-555-7007', requester_dept: 'Sales',       assigned_to: 'Rita Patel',     created_date: '2026-03-25', updated_date: '2026-03-26', resolved_date: '2026-03-26', sla_breach: 'No',  resolution_notes: 'Adobe CC license renewed and reactivated.',                      asset_tag: 'PC-3381'  },
    { ticket_number: 'TKT-00008', title: 'New hire workstation setup needed',     category: 'Hardware',  priority: 'Medium',   status: 'Resolved',     requester_name: 'Aaliyah Stephens',   requester_email: 'astephens@company.com',  requester_phone: '757-555-7008', requester_dept: 'HR',          assigned_to: 'Carlos Rivera',  created_date: '2026-04-01', updated_date: '2026-04-03', resolved_date: '2026-04-03', sla_breach: 'No',  resolution_notes: 'Dell Optiplex configured with standard image and credentials.',  asset_tag: 'PC-2847'  },
    { ticket_number: 'TKT-00009', title: 'Network switch down - 2nd floor west',  category: 'Network',   priority: 'Critical', status: 'Resolved',     requester_name: 'Darius Holloway',    requester_email: 'dholloway@company.com',  requester_phone: '757-555-7009', requester_dept: 'Engineering', assigned_to: 'Carlos Rivera',  created_date: '2026-04-05', updated_date: '2026-04-05', resolved_date: '2026-04-05', sla_breach: 'Yes', resolution_notes: 'Failed switch replaced. All ports restored.',                   asset_tag: 'SW-0019'  },
    { ticket_number: 'TKT-00010', title: 'Password reset request',                category: 'Access',    priority: 'Low',      status: 'Closed',       requester_name: 'Elijah Burnett',     requester_email: 'eburnett@company.com',   requester_phone: '757-555-7010', requester_dept: 'Operations',  assigned_to: 'Alex Nguyen',    created_date: '2026-04-08', updated_date: '2026-04-08', resolved_date: '2026-04-08', sla_breach: 'No',  resolution_notes: 'Password reset via self-service portal. User confirmed access.',  asset_tag: null       },
    { ticket_number: 'TKT-00011', title: 'Monitor flickering on primary display', category: 'Hardware',  priority: 'Low',      status: 'In Progress',  requester_name: 'Savannah Brooks',    requester_email: 'sbrooks@company.com',    requester_phone: '757-555-7011', requester_dept: 'Finance',     assigned_to: 'Alex Nguyen',    created_date: '2026-04-12', updated_date: '2026-04-14', resolved_date: null,         sla_breach: 'No',  resolution_notes: null,                                                             asset_tag: 'MON-0827' },
    { ticket_number: 'TKT-00012', title: 'Phishing email reported by user',       category: 'Security',  priority: 'High',     status: 'Pending',      requester_name: 'Ethan Kowalski',     requester_email: 'ekowalski@company.com',  requester_phone: '757-555-7012', requester_dept: 'Executive',   assigned_to: 'Rita Patel',     created_date: '2026-04-18', updated_date: '2026-04-18', resolved_date: null,         sla_breach: 'No',  resolution_notes: null,                                                             asset_tag: null       },
    { ticket_number: 'TKT-00013', title: 'Dev environment unreachable from VPN',  category: 'Network',   priority: 'High',     status: 'In Progress',  requester_name: 'Jason Mobley',       requester_email: 'jason.mobley@company.com', requester_phone: '850-217-6664', requester_dept: 'Engineering', assigned_to: 'Carlos Rivera',  created_date: '2026-04-22', updated_date: '2026-04-24', resolved_date: null,         sla_breach: 'No',  resolution_notes: null,                                                             asset_tag: 'LPT-3047' },
    { ticket_number: 'TKT-00014', title: 'CRM application crashing on launch',    category: 'Software',  priority: 'High',     status: 'Open',         requester_name: 'Mason Morris',       requester_email: 'mason.morris@company.com', requester_phone: '850-655-3044', requester_dept: 'Sales',       assigned_to: null,             created_date: '2026-04-25', updated_date: '2026-04-25', resolved_date: null,         sla_breach: 'No',  resolution_notes: null,                                                             asset_tag: 'PC-1177'  },
    { ticket_number: 'TKT-00015', title: 'Barcode scanner not recognized by PC',  category: 'Hardware',  priority: 'Medium',   status: 'Open',         requester_name: 'Todd Anderson',      requester_email: 'todd.anderson@company.com', requester_phone: '703-728-2157', requester_dept: 'Operations', assigned_to: null,             created_date: '2026-04-28', updated_date: '2026-04-28', resolved_date: null,         sla_breach: 'No',  resolution_notes: null,                                                             asset_tag: 'PC-0924'  },
  ];

  const count = db.prepare('SELECT COUNT(*) as n FROM it_tickets').get();

  if (count.n > 0) {
    const insertOne = db.prepare(`
      INSERT OR IGNORE INTO it_tickets
        (ticket_number, title, category, priority, status, requester_name, requester_email,
         requester_phone, requester_dept, assigned_to, created_date, updated_date, resolved_date,
         sla_breach, resolution_notes, asset_tag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of tickets.slice(12)) {
      insertOne.run(t.ticket_number, t.title, t.category, t.priority, t.status,
        t.requester_name, t.requester_email, t.requester_phone, t.requester_dept,
        t.assigned_to, t.created_date, t.updated_date, t.resolved_date,
        t.sla_breach, t.resolution_notes, t.asset_tag);
    }
    return;
  }

  // ── Fresh install: seed all ───────────────────────────────────────────────────
  const insert = db.prepare(`
    INSERT INTO it_tickets
      (ticket_number, title, category, priority, status, requester_name, requester_email,
       requester_phone, requester_dept, assigned_to, created_date, updated_date, resolved_date,
       sla_breach, resolution_notes, asset_tag)
    VALUES
      (@ticket_number, @title, @category, @priority, @status, @requester_name, @requester_email,
       @requester_phone, @requester_dept, @assigned_to, @created_date, @updated_date, @resolved_date,
       @sla_breach, @resolution_notes, @asset_tag)
  `);

  const seedAll = db.transaction(() => {
    for (const t of tickets) insert.run(t);
  });
  seedAll();
  console.log(`[DB] ITSM seeded with ${tickets.length} tickets`);
}

module.exports = seedITSM;
