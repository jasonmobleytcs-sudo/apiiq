const db = require('./index');

function seedK12() {
  // ── Create table ──────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS k12_students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT,
      grade TEXT,
      school TEXT,
      homeroom_teacher TEXT,
      guardian_name TEXT NOT NULL,
      guardian_phone TEXT NOT NULL,
      guardian_email TEXT,
      address TEXT,
      enrollment_status TEXT CHECK(enrollment_status IN ('Active','Inactive','Transferred','Graduated')),
      gpa REAL,
      attendance_pct REAL,
      bus_route TEXT,
      lunch_balance REAL DEFAULT 0.00,
      iep TEXT CHECK(iep IN ('Yes','No')) DEFAULT 'No'
    );
  `);

  // ── Master student list ───────────────────────────────────────────────────────
  const students = [
    { student_id: 'NNPS-001', pin: '4411', first_name: 'Amara',   last_name: 'Jackson',   date_of_birth: '2018-03-12', grade: 'K',  school: 'Hidenwood Elementary',         homeroom_teacher: 'Ms. Patterson',  guardian_name: 'Denise Jackson',  guardian_phone: '757-555-4001', guardian_email: 'djackson@email.com', address: '420 Hiden Blvd, Newport News, VA 23606',              enrollment_status: 'Active',  gpa: null, attendance_pct: 96.2, bus_route: 'RT-12', lunch_balance: 18.50, iep: 'No'  },
    { student_id: 'NNPS-002', pin: '8821', first_name: 'Caleb',   last_name: 'Freeman',   date_of_birth: '2014-07-05', grade: '4',  school: 'Hidenwood Elementary',         homeroom_teacher: 'Mr. Nguyen',     guardian_name: 'Kevin Freeman',   guardian_phone: '757-555-4002', guardian_email: 'kfreeman@email.com', address: '812 Lucas Creek Rd, Newport News, VA 23602',          enrollment_status: 'Active',  gpa: 3.2, attendance_pct: 94.8, bus_route: 'RT-07', lunch_balance: 5.25,  iep: 'No'  },
    { student_id: 'NNPS-003', pin: '3377', first_name: 'Destiny',  last_name: 'Malone',    date_of_birth: '2013-11-19', grade: '5',  school: 'Hidenwood Elementary',         homeroom_teacher: 'Ms. Torres',     guardian_name: 'Angela Malone',   guardian_phone: '757-555-4003', guardian_email: 'amalone@email.com', address: '301 Colony Rd, Newport News, VA 23602',               enrollment_status: 'Active',  gpa: 3.6, attendance_pct: 98.1, bus_route: 'RT-07', lunch_balance: 22.00, iep: 'No'  },
    { student_id: 'NNPS-004', pin: '6654', first_name: 'Jordan',   last_name: 'Garrett',   date_of_birth: '2015-05-28', grade: '3',  school: 'Achievable Dream Academy',     homeroom_teacher: 'Ms. Williams',   guardian_name: 'Robert Garrett',  guardian_phone: '757-555-4004', guardian_email: 'rgarrett@email.com', address: '511 28th St, Newport News, VA 23607',                 enrollment_status: 'Active',  gpa: 2.9, attendance_pct: 89.4, bus_route: 'RT-15', lunch_balance: 3.75,  iep: 'Yes' },
    { student_id: 'NNPS-005', pin: '9902', first_name: 'Naomi',    last_name: 'Pierce',    date_of_birth: '2016-01-07', grade: '2',  school: 'Achievable Dream Academy',     homeroom_teacher: 'Mr. Okafor',     guardian_name: 'Tanya Pierce',    guardian_phone: '757-555-4005', guardian_email: 'tpierce@email.com', address: '220 Jefferson Ave, Newport News, VA 23605',           enrollment_status: 'Active',  gpa: 3.8, attendance_pct: 99.0, bus_route: 'RT-15', lunch_balance: 15.00, iep: 'No'  },
    { student_id: 'NNPS-006', pin: '2213', first_name: 'Isaiah',   last_name: 'Hammond',   date_of_birth: '2012-09-14', grade: '6',  school: 'Gildersleeve Middle School',   homeroom_teacher: 'Ms. Chen',       guardian_name: 'Maurice Hammond', guardian_phone: '757-555-4006', guardian_email: 'mhammond@email.com', address: '715 Warwick Blvd, Newport News, VA 23607',            enrollment_status: 'Active',  gpa: 3.0, attendance_pct: 91.5, bus_route: 'RT-03', lunch_balance: 8.50,  iep: 'No'  },
    { student_id: 'NNPS-007', pin: '7788', first_name: 'Olivia',   last_name: 'Sutton',    date_of_birth: '2011-04-22', grade: '7',  school: 'Gildersleeve Middle School',   homeroom_teacher: 'Mr. Ballard',    guardian_name: 'Lisa Sutton',     guardian_phone: '757-555-4007', guardian_email: 'lsutton@email.com', address: '830 Denbigh Blvd, Newport News, VA 23608',            enrollment_status: 'Active',  gpa: 3.5, attendance_pct: 95.3, bus_route: 'RT-03', lunch_balance: 12.25, iep: 'No'  },
    { student_id: 'NNPS-008', pin: '5541', first_name: 'Malik',    last_name: 'Rivera',    date_of_birth: '2010-08-30', grade: '8',  school: 'Gildersleeve Middle School',   homeroom_teacher: 'Ms. Adeyemi',    guardian_name: 'Carmen Rivera',   guardian_phone: '757-555-4008', guardian_email: 'crivera@email.com', address: '415 River Rd, Newport News, VA 23601',                enrollment_status: 'Active',  gpa: 2.6, attendance_pct: 87.2, bus_route: 'RT-09', lunch_balance: 0.00,  iep: 'Yes' },
    { student_id: 'NNPS-009', pin: '1123', first_name: 'Savannah', last_name: 'Brooks',    date_of_birth: '2009-02-16', grade: '9',  school: 'Warwick High School',          homeroom_teacher: 'Mr. Harrison',   guardian_name: 'David Brooks',    guardian_phone: '757-555-4009', guardian_email: 'dbrooks@email.com', address: '622 Harpersville Rd, Newport News, VA 23601',         enrollment_status: 'Active',  gpa: 3.4, attendance_pct: 93.7, bus_route: 'RT-21', lunch_balance: 6.00,  iep: 'No'  },
    { student_id: 'NNPS-010', pin: '8899', first_name: 'Ethan',    last_name: 'Kowalski',  date_of_birth: '2008-06-03', grade: '10', school: 'Menchville High School',       homeroom_teacher: 'Ms. Okonkwo',    guardian_name: 'Patricia Kowalski',guardian_phone: '757-555-4010', guardian_email: 'pkowalski@email.com', address: '331 Pilot House Dr, Newport News, VA 23606',          enrollment_status: 'Active',  gpa: 3.7, attendance_pct: 97.4, bus_route: 'RT-18', lunch_balance: 20.75, iep: 'No'  },
    { student_id: 'NNPS-011', pin: '4462', first_name: 'Zoe',      last_name: 'Nguyen',    date_of_birth: '2007-10-11', grade: '11', school: 'Menchville High School',       homeroom_teacher: 'Mr. Caldwell',   guardian_name: 'Hanh Nguyen',     guardian_phone: '757-555-4011', guardian_email: 'hnguyen@email.com', address: '540 Beechmont Dr, Newport News, VA 23608',            enrollment_status: 'Active',  gpa: 3.9, attendance_pct: 98.8, bus_route: null,    lunch_balance: 11.50, iep: 'No'  },
    { student_id: 'NNPS-012', pin: '7713', first_name: 'Damien',   last_name: 'Watts',     date_of_birth: '2006-12-25', grade: '12', school: 'Warwick High School',          homeroom_teacher: 'Ms. Stewart',    guardian_name: 'Brenda Watts',    guardian_phone: '757-555-4012', guardian_email: 'bwatts@email.com', address: '122 Elmhurst St, Newport News, VA 23603',             enrollment_status: 'Active',  gpa: 2.8, attendance_pct: 85.1, bus_route: null,    lunch_balance: 0.00,  iep: 'No'  },
    { student_id: 'NNPS-013', pin: '5561', first_name: 'Jaylen',   last_name: 'Mobley',    date_of_birth: '2012-06-18', grade: '7',  school: 'Gildersleeve Middle School',   homeroom_teacher: 'Mr. Ballard',    guardian_name: 'Jason Mobley',    guardian_phone: '850-217-6664', guardian_email: 'jason.mobley@email.com', address: '1014 Greenbrier Pkwy, Newport News, VA 23608',      enrollment_status: 'Active',  gpa: 3.3, attendance_pct: 95.0, bus_route: 'RT-03', lunch_balance: 14.00, iep: 'No'  },
    { student_id: 'NNPS-014', pin: '7731', first_name: 'Avery',    last_name: 'Morris',    date_of_birth: '2016-09-04', grade: '3',  school: 'Hidenwood Elementary',         homeroom_teacher: 'Ms. Torres',     guardian_name: 'Mason Morris',    guardian_phone: '850-655-3044', guardian_email: 'mason.morris@email.com', address: '837 Pilot House Dr, Newport News, VA 23606',        enrollment_status: 'Active',  gpa: 3.5, attendance_pct: 97.2, bus_route: 'RT-12', lunch_balance: 9.50,  iep: 'No'  },
    { student_id: 'NNPS-015', pin: '3344', first_name: 'Blake',    last_name: 'Anderson',  date_of_birth: '2008-03-21', grade: '10', school: 'Warwick High School',          homeroom_teacher: 'Mr. Harrison',   guardian_name: 'Todd Anderson',   guardian_phone: '703-728-2157', guardian_email: 'todd.anderson@email.com', address: '2101 Village Green Pkwy, Newport News, VA 23602',  enrollment_status: 'Active',  gpa: 2.9, attendance_pct: 91.8, bus_route: 'RT-21', lunch_balance: 0.00,  iep: 'No'  },
  ];

  const count = db.prepare('SELECT COUNT(*) as n FROM k12_students').get();

  if (count.n > 0) {
    const insertOne = db.prepare(`
      INSERT OR IGNORE INTO k12_students
        (student_id, pin, first_name, last_name, date_of_birth, grade, school, homeroom_teacher,
         guardian_name, guardian_phone, guardian_email, address, enrollment_status, gpa,
         attendance_pct, bus_route, lunch_balance, iep)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of students.slice(12)) {
      insertOne.run(s.student_id, s.pin, s.first_name, s.last_name, s.date_of_birth, s.grade,
        s.school, s.homeroom_teacher, s.guardian_name, s.guardian_phone, s.guardian_email,
        s.address, s.enrollment_status, s.gpa, s.attendance_pct, s.bus_route,
        s.lunch_balance, s.iep);
    }
    return;
  }

  // ── Fresh install: seed all ───────────────────────────────────────────────────
  const insert = db.prepare(`
    INSERT INTO k12_students
      (student_id, pin, first_name, last_name, date_of_birth, grade, school, homeroom_teacher,
       guardian_name, guardian_phone, guardian_email, address, enrollment_status, gpa,
       attendance_pct, bus_route, lunch_balance, iep)
    VALUES
      (@student_id, @pin, @first_name, @last_name, @date_of_birth, @grade, @school, @homeroom_teacher,
       @guardian_name, @guardian_phone, @guardian_email, @address, @enrollment_status, @gpa,
       @attendance_pct, @bus_route, @lunch_balance, @iep)
  `);

  const seedAll = db.transaction(() => {
    for (const s of students) insert.run(s);
  });
  seedAll();
  console.log(`[DB] K-12 seeded with ${students.length} students`);
}

module.exports = seedK12;
