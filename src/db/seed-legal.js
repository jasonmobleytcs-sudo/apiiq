const db = require('./index');

function seedLegal() {
  // ── Create table ──────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS legal_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_number TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT,
      client_phone TEXT NOT NULL,
      client_address TEXT,
      case_type TEXT CHECK(case_type IN ('Civil','Criminal','Family','Corporate','Immigration','Estate','Real Estate')),
      case_status TEXT CHECK(case_status IN ('Open','In Progress','Pending','Closed','Appealed','On Hold')),
      attorney TEXT,
      opposing_party TEXT,
      court TEXT,
      filed_date TEXT,
      next_hearing_date TEXT,
      retainer_amount REAL DEFAULT 0.00,
      balance_due REAL DEFAULT 0.00,
      docket_number TEXT
    );
  `);

  // ── Master case list ──────────────────────────────────────────────────────────
  const cases = [
    { case_number: 'CVL-2024-001', pin: '3821', client_name: 'Marcus Hill',        client_email: 'marcus.hill@email.com',    client_phone: '757-555-5001', client_address: '1205 28th St, Newport News, VA 23607',             case_type: 'Civil',        case_status: 'Closed',      attorney: 'Sarah Chen',      opposing_party: 'Riverside Property LLC',    court: 'Newport News Circuit Court',       filed_date: '2024-02-10', next_hearing_date: null,       retainer_amount: 3500.00, balance_due: 0.00,    docket_number: 'CL24-0021' },
    { case_number: 'CVL-2024-002', pin: '7742', client_name: 'Angela Brooks',       client_email: 'angela.brooks@email.com',  client_phone: '757-555-5002', client_address: '5421 Chestnut Ave, Newport News, VA 23605',        case_type: 'Family',       case_status: 'In Progress', attorney: 'Marcus Williams', opposing_party: 'Derrick Brooks',            court: 'Newport News Circuit Court',       filed_date: '2024-05-15', next_hearing_date: '2026-06-12', retainer_amount: 2500.00, balance_due: 750.00,  docket_number: 'DR24-0198' },
    { case_number: 'CVL-2024-003', pin: '9913', client_name: 'Kevin Turner',        client_email: 'kevin.turner@email.com',   client_phone: '757-555-5003', client_address: '17 Ivy Farms Rd, Newport News, VA 23601',          case_type: 'Criminal',     case_status: 'Pending',     attorney: 'Patricia Okafor', opposing_party: 'Commonwealth of Virginia',  court: 'Hampton General District Court',   filed_date: '2024-08-22', next_hearing_date: '2026-05-20', retainer_amount: 5000.00, balance_due: 1200.00, docket_number: 'CR24-0774' },
    { case_number: 'CVL-2024-004', pin: '4481', client_name: 'Latoya Smith',        client_email: 'latoya.smith@email.com',   client_phone: '757-555-5004', client_address: '8802 Jefferson Ave, Newport News, VA 23605',       case_type: 'Estate',       case_status: 'Open',        attorney: 'Sarah Chen',      opposing_party: null,                        court: 'Newport News Circuit Court',       filed_date: '2024-11-03', next_hearing_date: '2026-07-08', retainer_amount: 1800.00, balance_due: 400.00,  docket_number: 'CH24-0412' },
    { case_number: 'CVL-2024-005', pin: '2256', client_name: 'Brian Foster',        client_email: 'brian.f@email.com',        client_phone: '757-555-5005', client_address: '730 Harpersville Rd, Newport News, VA 23601',      case_type: 'Real Estate',  case_status: 'Closed',      attorney: 'David Reyes',     opposing_party: 'Harbor Side Developers',    court: 'Virginia Beach Circuit Court',     filed_date: '2024-01-18', next_hearing_date: null,       retainer_amount: 4000.00, balance_due: 0.00,    docket_number: 'CL24-0055' },
    { case_number: 'CVL-2024-006', pin: '6631', client_name: 'James Walker',        client_email: 'james.walker@email.com',   client_phone: '757-555-5006', client_address: '1012 J Clyde Morris Blvd, Newport News, VA 23602', case_type: 'Corporate',    case_status: 'In Progress', attorney: 'Marcus Williams', opposing_party: 'Atlantic Supply Co.',       court: 'Virginia Beach Circuit Court',     filed_date: '2024-09-07', next_hearing_date: '2026-08-14', retainer_amount: 7500.00, balance_due: 2100.00, docket_number: 'CL24-0891' },
    { case_number: 'CVL-2024-007', pin: '1198', client_name: 'Melissa Carter',      client_email: 'melissa.c@email.com',      client_phone: '757-555-5007', client_address: '420 Denbigh Blvd, Newport News, VA 23608',         case_type: 'Immigration',  case_status: 'Pending',     attorney: 'Patricia Okafor', opposing_party: 'USCIS',                     court: 'Hampton General District Court',   filed_date: '2024-12-01', next_hearing_date: '2026-09-03', retainer_amount: 3000.00, balance_due: 900.00,  docket_number: 'IM24-0033' },
    { case_number: 'CVL-2024-008', pin: '8814', client_name: 'Robert King',         client_email: 'rking@email.com',          client_phone: '757-555-5008', client_address: '612 Pilot House Dr, Newport News, VA 23606',       case_type: 'Civil',        case_status: 'Appealed',    attorney: 'Sarah Chen',      opposing_party: 'City of Newport News',      court: 'Newport News Circuit Court',       filed_date: '2024-03-29', next_hearing_date: '2026-10-21', retainer_amount: 4500.00, balance_due: 0.00,    docket_number: 'CL24-0302' },
    { case_number: 'CVL-2024-009', pin: '7701', client_name: 'Erica Davis',         client_email: 'erica.d@email.com',        client_phone: '757-555-5009', client_address: '250 Elmhurst St, Newport News, VA 23603',          case_type: 'Family',       case_status: 'On Hold',     attorney: 'David Reyes',     opposing_party: 'Marcus Davis',              court: 'Newport News Circuit Court',       filed_date: '2024-06-14', next_hearing_date: '2026-06-30', retainer_amount: 2000.00, balance_due: 600.00,  docket_number: 'DR24-0445' },
    { case_number: 'CVL-2024-010', pin: '3345', client_name: 'Nathan Bryant',       client_email: 'nbryant@email.com',        client_phone: '757-555-5010', client_address: '715 Jefferson Ave, Newport News, VA 23605',        case_type: 'Criminal',     case_status: 'Closed',      attorney: 'Patricia Okafor', opposing_party: 'Commonwealth of Virginia',  court: 'Hampton General District Court',   filed_date: '2024-04-08', next_hearing_date: null,       retainer_amount: 6000.00, balance_due: 0.00,    docket_number: 'CR24-0511' },
    { case_number: 'CVL-2024-011', pin: '9920', client_name: 'Victoria Hughes',     client_email: 'vhughes@email.com',        client_phone: '757-555-5011', client_address: '812 Warwick Blvd, Newport News, VA 23607',         case_type: 'Real Estate',  case_status: 'In Progress', attorney: 'David Reyes',     opposing_party: 'Peninsula Realty Group',    court: 'Virginia Beach Circuit Court',     filed_date: '2024-10-17', next_hearing_date: '2026-07-22', retainer_amount: 3800.00, balance_due: 1500.00, docket_number: 'CL24-1102' },
    { case_number: 'CVL-2024-012', pin: '5572', client_name: 'Danielle Moore',      client_email: 'dmoore@email.com',         client_phone: '757-555-5012', client_address: '812 Lucas Creek Rd, Newport News, VA 23602',       case_type: 'Corporate',    case_status: 'Open',        attorney: 'Marcus Williams', opposing_party: 'Moore & Associates LLC',    court: 'Newport News Circuit Court',       filed_date: '2025-01-09', next_hearing_date: '2026-08-05', retainer_amount: 5500.00, balance_due: 2800.00, docket_number: 'CL25-0018' },
    { case_number: 'CVL-2024-013', pin: '5561', client_name: 'Jason Mobley',        client_email: 'jason.mobley@email.com',   client_phone: '850-217-6664', client_address: '1014 Greenbrier Pkwy, Newport News, VA 23608',     case_type: 'Civil',        case_status: 'Open',        attorney: 'Sarah Chen',      opposing_party: 'Greenbrier HOA',            court: 'Newport News Circuit Court',       filed_date: '2025-03-14', next_hearing_date: '2026-06-18', retainer_amount: 2500.00, balance_due: 0.00,    docket_number: 'CL25-0214' },
    { case_number: 'CVL-2024-014', pin: '7731', client_name: 'Mason Morris',        client_email: 'mason.morris@email.com',   client_phone: '850-655-3044', client_address: '837 Pilot House Dr, Newport News, VA 23606',       case_type: 'Family',       case_status: 'In Progress', attorney: 'Marcus Williams', opposing_party: 'Sandra Morris',             court: 'Newport News Circuit Court',       filed_date: '2025-02-01', next_hearing_date: '2026-07-15', retainer_amount: 3000.00, balance_due: 850.00,  docket_number: 'DR25-0077' },
    { case_number: 'CVL-2024-015', pin: '3344', client_name: 'Todd Anderson',       client_email: 'todd.anderson@email.com',  client_phone: '703-728-2157', client_address: '2101 Village Green Pkwy, Newport News, VA 23602',  case_type: 'Real Estate',  case_status: 'Pending',     attorney: 'David Reyes',     opposing_party: 'Village Green Partners',    court: 'Virginia Beach Circuit Court',     filed_date: '2025-04-10', next_hearing_date: '2026-09-09', retainer_amount: 4000.00, balance_due: 0.00,    docket_number: 'CL25-0388' },
  ];

  const count = db.prepare('SELECT COUNT(*) as n FROM legal_cases').get();

  if (count.n > 0) {
    const insertOne = db.prepare(`
      INSERT OR IGNORE INTO legal_cases
        (case_number, pin, client_name, client_email, client_phone, client_address, case_type,
         case_status, attorney, opposing_party, court, filed_date, next_hearing_date,
         retainer_amount, balance_due, docket_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of cases.slice(12)) {
      insertOne.run(c.case_number, c.pin, c.client_name, c.client_email, c.client_phone,
        c.client_address, c.case_type, c.case_status, c.attorney, c.opposing_party, c.court,
        c.filed_date, c.next_hearing_date, c.retainer_amount, c.balance_due, c.docket_number);
    }
    return;
  }

  // ── Fresh install: seed all ───────────────────────────────────────────────────
  const insert = db.prepare(`
    INSERT INTO legal_cases
      (case_number, pin, client_name, client_email, client_phone, client_address, case_type,
       case_status, attorney, opposing_party, court, filed_date, next_hearing_date,
       retainer_amount, balance_due, docket_number)
    VALUES
      (@case_number, @pin, @client_name, @client_email, @client_phone, @client_address, @case_type,
       @case_status, @attorney, @opposing_party, @court, @filed_date, @next_hearing_date,
       @retainer_amount, @balance_due, @docket_number)
  `);

  const seedAll = db.transaction(() => {
    for (const c of cases) insert.run(c);
  });
  seedAll();
  console.log(`[DB] Legal seeded with ${cases.length} cases`);
}

module.exports = seedLegal;
