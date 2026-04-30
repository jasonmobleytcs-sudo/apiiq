const db = require('./index');

function seedRetail() {
  // ── Create table ──────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS retail_customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      address TEXT,
      loyalty_tier TEXT CHECK(loyalty_tier IN ('Bronze','Silver','Gold','Platinum')),
      loyalty_points INTEGER DEFAULT 0,
      total_spend REAL DEFAULT 0.00,
      last_purchase_date TEXT,
      last_purchase_amount REAL DEFAULT 0.00,
      member_since TEXT,
      preferred_store TEXT,
      account_status TEXT CHECK(account_status IN ('Active','Suspended','Closed')),
      store_credit REAL DEFAULT 0.00
    );
  `);

  // ── Master customer list ──────────────────────────────────────────────────────
  const customers = [
    { customer_id: 'HRO-001', pin: '4411', first_name: 'Marcus',    last_name: 'Hill',       email: 'marcus.hill@email.com',      phone: '757-555-6001', address: '1205 28th St, Newport News, VA 23607',             loyalty_tier: 'Silver',   loyalty_points: 1240, total_spend: 1540.00, last_purchase_date: '2026-03-15', last_purchase_amount: 89.99,  member_since: '2022-04-10', preferred_store: 'Newport News', account_status: 'Active',    store_credit: 0.00   },
    { customer_id: 'HRO-002', pin: '8821', first_name: 'Angela',    last_name: 'Brooks',     email: 'angela.brooks@email.com',    phone: '757-555-6002', address: '5421 Chestnut Ave, Newport News, VA 23605',        loyalty_tier: 'Bronze',   loyalty_points: 380,  total_spend: 382.50,  last_purchase_date: '2026-01-22', last_purchase_amount: 45.00,  member_since: '2023-11-07', preferred_store: 'Hampton',      account_status: 'Active',    store_credit: 10.00  },
    { customer_id: 'HRO-003', pin: '3377', first_name: 'Kevin',     last_name: 'Turner',     email: 'kevin.turner@email.com',     phone: '757-555-6003', address: '17 Ivy Farms Rd, Newport News, VA 23601',          loyalty_tier: 'Platinum', loyalty_points: 8920, total_spend: 8742.00, last_purchase_date: '2026-04-10', last_purchase_amount: 312.49, member_since: '2020-06-18', preferred_store: 'Newport News', account_status: 'Active',    store_credit: 50.00  },
    { customer_id: 'HRO-004', pin: '6654', first_name: 'Latoya',    last_name: 'Smith',      email: 'latoya.smith@email.com',     phone: '757-555-6004', address: '8802 Jefferson Ave, Newport News, VA 23605',       loyalty_tier: 'Gold',     loyalty_points: 3670, total_spend: 3210.00, last_purchase_date: '2026-02-28', last_purchase_amount: 154.95, member_since: '2021-09-03', preferred_store: 'Virginia Beach', account_status: 'Active',  store_credit: 25.00  },
    { customer_id: 'HRO-005', pin: '9902', first_name: 'Brian',     last_name: 'Foster',     email: 'brian.f@email.com',          phone: '757-555-6005', address: '730 Harpersville Rd, Newport News, VA 23601',      loyalty_tier: 'Silver',   loyalty_points: 1850, total_spend: 1920.00, last_purchase_date: '2026-04-01', last_purchase_amount: 67.50,  member_since: '2022-01-15', preferred_store: 'Newport News', account_status: 'Active',    store_credit: 0.00   },
    { customer_id: 'HRO-006', pin: '2213', first_name: 'Tiffany',   last_name: 'Reed',       email: 'tiffany.r@email.com',        phone: '757-555-6006', address: '1920 Warwick Blvd, Newport News, VA 23607',        loyalty_tier: 'Bronze',   loyalty_points: 210,  total_spend: 215.80,  last_purchase_date: '2026-01-10', last_purchase_amount: 32.99,  member_since: '2024-03-22', preferred_store: 'Hampton',      account_status: 'Active',    store_credit: 0.00   },
    { customer_id: 'HRO-007', pin: '7788', first_name: 'James',     last_name: 'Walker',     email: 'james.walker@email.com',     phone: '757-555-6007', address: '1012 J Clyde Morris Blvd, Newport News, VA 23602', loyalty_tier: 'Platinum', loyalty_points: 11200,total_spend: 11450.00,last_purchase_date: '2026-04-20', last_purchase_amount: 498.00, member_since: '2019-08-29', preferred_store: 'Chesapeake',   account_status: 'Active',    store_credit: 100.00 },
    { customer_id: 'HRO-008', pin: '5541', first_name: 'Erica',     last_name: 'Davis',      email: 'erica.d@email.com',          phone: '757-555-6008', address: '250 Elmhurst St, Newport News, VA 23603',          loyalty_tier: 'Gold',     loyalty_points: 4410, total_spend: 4380.00, last_purchase_date: '2026-03-07', last_purchase_amount: 203.45, member_since: '2021-02-14', preferred_store: 'Virginia Beach', account_status: 'Active',  store_credit: 0.00   },
    { customer_id: 'HRO-009', pin: '1123', first_name: 'Robert',    last_name: 'King',       email: 'rking@email.com',            phone: '757-555-6009', address: '612 Pilot House Dr, Newport News, VA 23606',       loyalty_tier: 'Bronze',   loyalty_points: 490,  total_spend: 467.25,  last_purchase_date: '2026-02-14', last_purchase_amount: 78.00,  member_since: '2023-05-11', preferred_store: 'Newport News', account_status: 'Active',    store_credit: 5.00   },
    { customer_id: 'HRO-010', pin: '8899', first_name: 'Danielle',  last_name: 'Moore',      email: 'dmoore@email.com',           phone: '757-555-6010', address: '812 Lucas Creek Rd, Newport News, VA 23602',       loyalty_tier: 'Silver',   loyalty_points: 1620, total_spend: 1580.00, last_purchase_date: '2026-03-29', last_purchase_amount: 115.99, member_since: '2022-10-08', preferred_store: 'Hampton',      account_status: 'Active',    store_credit: 0.00   },
    { customer_id: 'HRO-011', pin: '4462', first_name: 'Anthony',   last_name: 'Scott',      email: 'ascott@email.com',           phone: '757-555-6011', address: '922 Colony Rd, Newport News, VA 23602',            loyalty_tier: 'Platinum', loyalty_points: 7350, total_spend: 6890.00, last_purchase_date: '2026-04-15', last_purchase_amount: 389.00, member_since: '2020-12-01', preferred_store: 'Chesapeake',   account_status: 'Suspended', store_credit: 0.00   },
    { customer_id: 'HRO-012', pin: '7713', first_name: 'Jasmine',   last_name: 'White',      email: 'jwhite@email.com',           phone: '757-555-6012', address: '431 Hiden Blvd, Newport News, VA 23606',           loyalty_tier: 'Gold',     loyalty_points: 2980, total_spend: 2750.00, last_purchase_date: '2026-04-05', last_purchase_amount: 134.99, member_since: '2021-07-19', preferred_store: 'Virginia Beach', account_status: 'Active',  store_credit: 15.00  },
    { customer_id: 'HRO-013', pin: '5561', first_name: 'Jason',     last_name: 'Mobley',     email: 'jason.mobley@email.com',     phone: '850-217-6664', address: '1014 Greenbrier Pkwy, Newport News, VA 23608',     loyalty_tier: 'Gold',     loyalty_points: 4200, total_spend: 4150.00, last_purchase_date: '2026-04-18', last_purchase_amount: 219.99, member_since: '2021-03-10', preferred_store: 'Newport News', account_status: 'Active',    store_credit: 0.00   },
    { customer_id: 'HRO-014', pin: '7731', first_name: 'Mason',     last_name: 'Morris',     email: 'mason.morris@email.com',     phone: '850-655-3044', address: '837 Pilot House Dr, Newport News, VA 23606',       loyalty_tier: 'Silver',   loyalty_points: 1850, total_spend: 1720.00, last_purchase_date: '2026-03-25', last_purchase_amount: 97.50,  member_since: '2022-06-22', preferred_store: 'Hampton',      account_status: 'Active',    store_credit: 20.00  },
    { customer_id: 'HRO-015', pin: '3344', first_name: 'Todd',      last_name: 'Anderson',   email: 'todd.anderson@email.com',    phone: '703-728-2157', address: '2101 Village Green Pkwy, Newport News, VA 23602',  loyalty_tier: 'Bronze',   loyalty_points: 320,  total_spend: 298.75,  last_purchase_date: '2026-02-09', last_purchase_amount: 54.99,  member_since: '2023-08-14', preferred_store: 'Newport News', account_status: 'Active',    store_credit: 0.00   },
  ];

  const count = db.prepare('SELECT COUNT(*) as n FROM retail_customers').get();

  if (count.n > 0) {
    const insertOne = db.prepare(`
      INSERT OR IGNORE INTO retail_customers
        (customer_id, pin, first_name, last_name, email, phone, address, loyalty_tier,
         loyalty_points, total_spend, last_purchase_date, last_purchase_amount, member_since,
         preferred_store, account_status, store_credit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of customers.slice(12)) {
      insertOne.run(c.customer_id, c.pin, c.first_name, c.last_name, c.email, c.phone,
        c.address, c.loyalty_tier, c.loyalty_points, c.total_spend, c.last_purchase_date,
        c.last_purchase_amount, c.member_since, c.preferred_store, c.account_status, c.store_credit);
    }
    return;
  }

  // ── Fresh install: seed all ───────────────────────────────────────────────────
  const insert = db.prepare(`
    INSERT INTO retail_customers
      (customer_id, pin, first_name, last_name, email, phone, address, loyalty_tier,
       loyalty_points, total_spend, last_purchase_date, last_purchase_amount, member_since,
       preferred_store, account_status, store_credit)
    VALUES
      (@customer_id, @pin, @first_name, @last_name, @email, @phone, @address, @loyalty_tier,
       @loyalty_points, @total_spend, @last_purchase_date, @last_purchase_amount, @member_since,
       @preferred_store, @account_status, @store_credit)
  `);

  const seedAll = db.transaction(() => {
    for (const c of customers) insert.run(c);
  });
  seedAll();
  console.log(`[DB] Retail seeded with ${customers.length} customers`);
}

module.exports = seedRetail;
