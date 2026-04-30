const db = require('./index');

function seedHigherEd() {
  // ── Create table ──────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS he_students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      date_of_birth TEXT,
      enrollment_status TEXT CHECK(enrollment_status IN ('Active','Inactive','Graduated','Suspended')),
      major TEXT,
      gpa REAL,
      credits_completed INTEGER DEFAULT 0,
      credits_required INTEGER DEFAULT 120,
      expected_graduation TEXT,
      advisor TEXT,
      housing TEXT CHECK(housing IN ('On-Campus','Off-Campus','Commuter')),
      financial_aid_status TEXT CHECK(financial_aid_status IN ('Approved','Pending','None')),
      balance REAL DEFAULT 0.00,
      address TEXT
    );
  `);

  // ── Master student list ───────────────────────────────────────────────────────
  const students = [
    { student_id: 'NNU-2024-001', pin: '3821', first_name: 'Darius',   last_name: 'Holloway',  email: 'dholloway@nnu.edu',  phone: '757-555-3001', date_of_birth: '2002-04-11', enrollment_status: 'Active',    major: 'Computer Science',    gpa: 3.6, credits_completed: 72,  credits_required: 120, expected_graduation: '2026-05', advisor: 'Dr. Karen Patel',    housing: 'On-Campus',  financial_aid_status: 'Approved', balance: 0.00,    address: '1 University Dr, Newport News, VA 23606' },
    { student_id: 'NNU-2024-002', pin: '7742', first_name: 'Brianna',   last_name: 'Washington', email: 'bwashington@nnu.edu', phone: '757-555-3002', date_of_birth: '2001-09-22', enrollment_status: 'Active',    major: 'Business',            gpa: 3.2, credits_completed: 90,  credits_required: 120, expected_graduation: '2025-12', advisor: 'Dr. Marcus Reid',    housing: 'Off-Campus', financial_aid_status: 'Approved', balance: 1200.00, address: '412 Denbigh Blvd, Newport News, VA 23608' },
    { student_id: 'NNU-2024-003', pin: '9913', first_name: 'Marcus',    last_name: 'Tran',       email: 'mtran@nnu.edu',       phone: '757-555-3003', date_of_birth: '2003-01-15', enrollment_status: 'Active',    major: 'Nursing',             gpa: 3.8, credits_completed: 45,  credits_required: 128, expected_graduation: '2027-05', advisor: 'Prof. Linda Osei',   housing: 'On-Campus',  financial_aid_status: 'Approved', balance: 0.00,    address: '1 University Dr, Newport News, VA 23606' },
    { student_id: 'NNU-2024-004', pin: '4481', first_name: 'Aaliyah',   last_name: 'Stephens',   email: 'astephens@nnu.edu',   phone: '757-555-3004', date_of_birth: '2002-07-30', enrollment_status: 'Active',    major: 'Education',           gpa: 3.5, credits_completed: 60,  credits_required: 120, expected_graduation: '2026-05', advisor: 'Dr. Thomas Bell',    housing: 'Commuter',   financial_aid_status: 'Pending',  balance: 650.00,  address: '810 Warwick Blvd, Newport News, VA 23607' },
    { student_id: 'NNU-2024-005', pin: '2256', first_name: 'Devon',     last_name: 'Mercer',     email: 'dmercer@nnu.edu',     phone: '757-555-3005', date_of_birth: '2001-11-04', enrollment_status: 'Active',    major: 'Engineering',         gpa: 3.1, credits_completed: 96,  credits_required: 128, expected_graduation: '2025-12', advisor: 'Dr. Karen Patel',    housing: 'Off-Campus', financial_aid_status: 'None',     balance: 3200.00, address: '221 Colony Rd, Newport News, VA 23602' },
    { student_id: 'NNU-2024-006', pin: '6631', first_name: 'Keisha',    last_name: 'Fountain',   email: 'kfountain@nnu.edu',   phone: '757-555-3006', date_of_birth: '2003-05-19', enrollment_status: 'Active',    major: 'Psychology',          gpa: 2.8, credits_completed: 30,  credits_required: 120, expected_graduation: '2027-05', advisor: 'Prof. Sarah Yuen',   housing: 'On-Campus',  financial_aid_status: 'Approved', balance: 0.00,    address: '1 University Dr, Newport News, VA 23606' },
    { student_id: 'NNU-2024-007', pin: '1198', first_name: 'Tyler',     last_name: 'Norwood',    email: 'tnorwood@nnu.edu',    phone: '757-555-3007', date_of_birth: '2002-03-08', enrollment_status: 'Inactive',  major: 'Business',            gpa: 2.1, credits_completed: 48,  credits_required: 120, expected_graduation: null,      advisor: 'Dr. Marcus Reid',    housing: 'Off-Campus', financial_aid_status: 'None',     balance: 4500.00, address: '344 Jefferson Ave, Newport News, VA 23605' },
    { student_id: 'NNU-2024-008', pin: '8814', first_name: 'Jasmine',   last_name: 'Crosby',     email: 'jcrosby@nnu.edu',     phone: '757-555-3008', date_of_birth: '2001-12-01', enrollment_status: 'Graduated', major: 'Biology',             gpa: 3.9, credits_completed: 120, credits_required: 120, expected_graduation: '2024-05', advisor: 'Dr. Nina Okafor',    housing: 'Off-Campus', financial_aid_status: 'Approved', balance: 0.00,    address: '517 Hilton Blvd, Newport News, VA 23605' },
    { student_id: 'NNU-2024-009', pin: '7701', first_name: 'Elijah',    last_name: 'Burnett',    email: 'eburnett@nnu.edu',    phone: '757-555-3009', date_of_birth: '2002-08-17', enrollment_status: 'Active',    major: 'Criminal Justice',    gpa: 2.9, credits_completed: 66,  credits_required: 120, expected_graduation: '2026-05', advisor: 'Prof. James Howell', housing: 'Commuter',   financial_aid_status: 'Approved', balance: 425.00,  address: '730 Oyster Point Rd, Newport News, VA 23602' },
    { student_id: 'NNU-2024-010', pin: '3345', first_name: 'Priya',     last_name: 'Nair',       email: 'pnair@nnu.edu',       phone: '757-555-3010', date_of_birth: '2003-02-27', enrollment_status: 'Active',    major: 'Computer Science',    gpa: 3.7, credits_completed: 36,  credits_required: 120, expected_graduation: '2027-05', advisor: 'Dr. Karen Patel',    housing: 'On-Campus',  financial_aid_status: 'Approved', balance: 0.00,    address: '1 University Dr, Newport News, VA 23606' },
    { student_id: 'NNU-2024-011', pin: '9920', first_name: 'Michael',   last_name: 'Ruiz',       email: 'mruiz@nnu.edu',       phone: '757-555-3011', date_of_birth: '2001-06-14', enrollment_status: 'Suspended', major: 'Engineering',         gpa: 2.3, credits_completed: 54,  credits_required: 128, expected_graduation: null,      advisor: 'Dr. Karen Patel',    housing: 'Off-Campus', financial_aid_status: 'Pending',  balance: 1875.00, address: '620 Harpersville Rd, Newport News, VA 23601' },
    { student_id: 'NNU-2024-012', pin: '5572', first_name: 'Camille',   last_name: 'Dubois',     email: 'cdubois@nnu.edu',     phone: '757-555-3012', date_of_birth: '2002-10-09', enrollment_status: 'Active',    major: 'Nursing',             gpa: 3.4, credits_completed: 80,  credits_required: 128, expected_graduation: '2026-12', advisor: 'Prof. Linda Osei',   housing: 'Commuter',   financial_aid_status: 'Approved', balance: 0.00,    address: '215 Beechmont Dr, Newport News, VA 23608' },
    { student_id: 'NNU-2024-013', pin: '5561', first_name: 'Jason',     last_name: 'Mobley',     email: 'jason.mobley@nnu.edu', phone: '850-217-6664', date_of_birth: '1990-03-15', enrollment_status: 'Active',   major: 'Computer Science',    gpa: 3.8, credits_completed: 108, credits_required: 120, expected_graduation: '2025-12', advisor: 'Dr. Karen Patel',    housing: 'Off-Campus', financial_aid_status: 'Approved', balance: 0.00,    address: '1014 Greenbrier Pkwy, Newport News, VA 23608' },
    { student_id: 'NNU-2024-014', pin: '7731', first_name: 'Mason',     last_name: 'Morris',     email: 'mason.morris@nnu.edu', phone: '850-655-3044', date_of_birth: '1992-07-22', enrollment_status: 'Active',   major: 'Business',            gpa: 3.1, credits_completed: 84,  credits_required: 120, expected_graduation: '2025-12', advisor: 'Dr. Marcus Reid',    housing: 'Off-Campus', financial_aid_status: 'None',     balance: 850.00,  address: '837 Pilot House Dr, Newport News, VA 23606' },
    { student_id: 'NNU-2024-015', pin: '3344', first_name: 'Todd',      last_name: 'Anderson',   email: 'todd.anderson@nnu.edu', phone: '703-728-2157', date_of_birth: '1988-11-05', enrollment_status: 'Active',  major: 'Criminal Justice',    gpa: 2.9, credits_completed: 78,  credits_required: 120, expected_graduation: '2026-05', advisor: 'Prof. James Howell', housing: 'Commuter',   financial_aid_status: 'None',     balance: 0.00,    address: '2101 Village Green Pkwy, Newport News, VA 23602' },
  ];

  const count = db.prepare('SELECT COUNT(*) as n FROM he_students').get();

  if (count.n > 0) {
    // Insert missing demo records
    const insertOne = db.prepare(`
      INSERT OR IGNORE INTO he_students
        (student_id, pin, first_name, last_name, email, phone, date_of_birth, enrollment_status,
         major, gpa, credits_completed, credits_required, expected_graduation, advisor,
         housing, financial_aid_status, balance, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of students.slice(12)) {
      insertOne.run(s.student_id, s.pin, s.first_name, s.last_name, s.email, s.phone,
        s.date_of_birth, s.enrollment_status, s.major, s.gpa, s.credits_completed,
        s.credits_required, s.expected_graduation, s.advisor, s.housing,
        s.financial_aid_status, s.balance, s.address);
    }
    return;
  }

  // ── Fresh install: seed all ───────────────────────────────────────────────────
  const insert = db.prepare(`
    INSERT INTO he_students
      (student_id, pin, first_name, last_name, email, phone, date_of_birth, enrollment_status,
       major, gpa, credits_completed, credits_required, expected_graduation, advisor,
       housing, financial_aid_status, balance, address)
    VALUES
      (@student_id, @pin, @first_name, @last_name, @email, @phone, @date_of_birth, @enrollment_status,
       @major, @gpa, @credits_completed, @credits_required, @expected_graduation, @advisor,
       @housing, @financial_aid_status, @balance, @address)
  `);

  const seedAll = db.transaction(() => {
    for (const s of students) insert.run(s);
  });
  seedAll();
  console.log(`[DB] Higher Ed seeded with ${students.length} students`);
}

module.exports = seedHigherEd;
