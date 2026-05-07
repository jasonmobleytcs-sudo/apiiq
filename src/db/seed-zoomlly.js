const db = require('./index');

function seedZoomlly() {
  // ── Create tables (fresh installs) ────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS zj_customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      address TEXT,
      member_since TEXT,
      subscription_plan TEXT CHECK(subscription_plan IN ('None','Basic','Premium','Ultimate','Family','Student')),
      subscription_status TEXT CHECK(subscription_status IN ('Active','Paused','Cancelled','Expired')),
      subscription_renewal TEXT,
      loyalty_tier TEXT CHECK(loyalty_tier IN ('Fan','Superfan','VIP','Platinum')),
      loyalty_points INTEGER DEFAULT 0,
      total_spend REAL DEFAULT 0.00,
      last_order_date TEXT,
      last_order_amount REAL DEFAULT 0.00,
      last_order_id TEXT,
      account_status TEXT CHECK(account_status IN ('Active','Suspended','Closed')),
      preferred_genre TEXT,
      concert_credits INTEGER DEFAULT 0,
      store_credit REAL DEFAULT 0.00
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS zj_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT UNIQUE NOT NULL,
      product_name TEXT NOT NULL,
      category TEXT CHECK(category IN ('Streaming','Concert Ticket','Merch','Bundle','Gift Card','Vinyl','Digital Download','VIP Package')),
      description TEXT,
      price REAL NOT NULL,
      stock_qty INTEGER,
      is_active INTEGER DEFAULT 1,
      event_name TEXT,
      venue TEXT,
      event_date TEXT,
      sku TEXT
    );
  `);

  // ── Master customer list ──────────────────────────────────────────────────
  const customers = [
    { customer_id: 'ZJ-001', pin: '2211', first_name: 'Alicia',    last_name: 'Thompson',  email: 'alicia.t@email.com',    phone: '404-555-1001', address: '112 Peachtree St, Atlanta, GA 30303',             member_since: '06/14/2019', subscription_plan: 'Premium',  subscription_status: 'Active',    subscription_renewal: '06/14/2026', loyalty_tier: 'VIP',       loyalty_points: 9200,  total_spend: 1100.00, last_order_date: '04/12/2026', last_order_amount: 99.99,  last_order_id: 'ORD-88821', account_status: 'Active', preferred_genre: 'R&B',       concert_credits: 2, store_credit: 20.00 },
    { customer_id: 'ZJ-002', pin: '4432', first_name: 'Brandon',   last_name: 'Okafor',    email: 'b.okafor@email.com',    phone: '214-555-2002', address: '889 Elm St, Dallas, TX 75201',                     member_since: '03/22/2020', subscription_plan: 'Basic',    subscription_status: 'Active',    subscription_renewal: '03/22/2026', loyalty_tier: 'Fan',       loyalty_points: 520,   total_spend: 75.00,   last_order_date: '03/01/2026', last_order_amount: 4.99,   last_order_id: 'ORD-44102', account_status: 'Active', preferred_genre: 'Hip-Hop',   concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-003', pin: '8874', first_name: 'Carmen',    last_name: 'Vasquez',   email: 'carmen.v@email.com',    phone: '305-555-3003', address: '2210 Ocean Dr, Miami, FL 33139',                   member_since: '11/08/2021', subscription_plan: 'Ultimate', subscription_status: 'Active',    subscription_renewal: '11/08/2026', loyalty_tier: 'Superfan',  loyalty_points: 4100,  total_spend: 620.00,  last_order_date: '04/28/2026', last_order_amount: 65.00,  last_order_id: 'ORD-77744', account_status: 'Active', preferred_genre: 'Pop',       concert_credits: 1, store_credit: 10.00 },
    { customer_id: 'ZJ-004', pin: '1193', first_name: 'Darnell',   last_name: 'Williams',  email: 'dwilliams@email.com',   phone: '312-555-4004', address: '3400 S Michigan Ave, Chicago, IL 60616',           member_since: '01/30/2018', subscription_plan: 'Family',   subscription_status: 'Active',    subscription_renewal: '01/30/2027', loyalty_tier: 'Platinum',  loyalty_points: 18500, total_spend: 3200.00, last_order_date: '05/01/2026', last_order_amount: 185.00, last_order_id: 'ORD-99201', account_status: 'Active', preferred_genre: 'Multiple',  concert_credits: 3, store_credit: 50.00 },
    { customer_id: 'ZJ-005', pin: '6655', first_name: 'Elise',     last_name: 'Martin',    email: 'elise.martin@email.com',phone: '617-555-5005', address: '77 Beacon St, Boston, MA 02108',                   member_since: '09/15/2022', subscription_plan: 'Student',  subscription_status: 'Active',    subscription_renewal: '09/15/2026', loyalty_tier: 'Fan',       loyalty_points: 300,   total_spend: 45.00,   last_order_date: '02/18/2026', last_order_amount: 4.99,   last_order_id: 'ORD-33099', account_status: 'Active', preferred_genre: 'Pop',       concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-006', pin: '3387', first_name: 'Felix',     last_name: 'Nguyen',    email: 'felix.n@email.com',     phone: '503-555-6006', address: '101 NW 23rd Ave, Portland, OR 97210',              member_since: '05/04/2020', subscription_plan: 'Basic',    subscription_status: 'Paused',    subscription_renewal: '05/04/2026', loyalty_tier: 'Fan',       loyalty_points: 410,   total_spend: 88.00,   last_order_date: '01/10/2026', last_order_amount: 4.99,   last_order_id: 'ORD-11522', account_status: 'Active', preferred_genre: 'Electronic',concert_credits: 0, store_credit: 5.00  },
    { customer_id: 'ZJ-007', pin: '9921', first_name: 'Gabrielle', last_name: 'Foster',    email: 'gfoster@email.com',     phone: '615-555-7007', address: '450 Broadway, Nashville, TN 37203',                member_since: '08/12/2019', subscription_plan: 'Premium',  subscription_status: 'Active',    subscription_renewal: '08/12/2026', loyalty_tier: 'VIP',       loyalty_points: 7800,  total_spend: 940.00,  last_order_date: '04/15/2026', last_order_amount: 45.00,  last_order_id: 'ORD-66312', account_status: 'Active', preferred_genre: 'Country',   concert_credits: 2, store_credit: 25.00 },
    { customer_id: 'ZJ-008', pin: '7743', first_name: 'Henry',     last_name: 'Zhao',      email: 'henry.zhao@email.com',  phone: '415-555-8008', address: '555 Market St, San Francisco, CA 94105',           member_since: '02/28/2021', subscription_plan: 'Ultimate', subscription_status: 'Active',    subscription_renewal: '02/28/2027', loyalty_tier: 'Superfan',  loyalty_points: 5500,  total_spend: 780.00,  last_order_date: '05/02/2026', last_order_amount: 14.99,  last_order_id: 'ORD-44890', account_status: 'Active', preferred_genre: 'Jazz',      concert_credits: 1, store_credit: 15.00 },
    { customer_id: 'ZJ-009', pin: '2266', first_name: 'Imani',     last_name: 'Johnson',   email: 'imani.j@email.com',     phone: '718-555-9009', address: '300 Atlantic Ave, Brooklyn, NY 11201',             member_since: '12/19/2020', subscription_plan: 'Basic',    subscription_status: 'Active',    subscription_renewal: '12/19/2026', loyalty_tier: 'Fan',       loyalty_points: 640,   total_spend: 95.00,   last_order_date: '03/22/2026', last_order_amount: 24.99,  last_order_id: 'ORD-22187', account_status: 'Active', preferred_genre: 'Hip-Hop',   concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-010', pin: '5548', first_name: 'Jordan',    last_name: 'Lee',       email: 'jlee@email.com',        phone: '206-555-0010', address: '1200 Pike St, Seattle, WA 98101',                  member_since: '07/07/2022', subscription_plan: 'Premium',  subscription_status: 'Active',    subscription_renewal: '07/07/2026', loyalty_tier: 'Superfan',  loyalty_points: 3800,  total_spend: 510.00,  last_order_date: '04/30/2026', last_order_amount: 9.99,   last_order_id: 'ORD-55003', account_status: 'Active', preferred_genre: 'Rock',      concert_credits: 1, store_credit: 5.00  },
    { customer_id: 'ZJ-011', pin: '8810', first_name: 'Keisha',    last_name: 'Robinson',  email: 'k.robinson@email.com',  phone: '678-555-1101', address: '5601 Peachtree Dunwoody Rd, Atlanta, GA 30342',   member_since: '04/11/2021', subscription_plan: 'None',     subscription_status: 'Cancelled',  subscription_renewal: null,         loyalty_tier: 'Fan',       loyalty_points: 150,   total_spend: 29.99,   last_order_date: '11/14/2025', last_order_amount: 9.99,   last_order_id: 'ORD-00912', account_status: 'Active', preferred_genre: 'R&B',       concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-012', pin: '3319', first_name: 'Luis',      last_name: 'Herrera',   email: 'luis.h@email.com',      phone: '210-555-1202', address: '881 Commerce St, San Antonio, TX 78205',           member_since: '10/03/2020', subscription_plan: 'Basic',    subscription_status: 'Active',    subscription_renewal: '10/03/2026', loyalty_tier: 'Fan',       loyalty_points: 480,   total_spend: 60.00,   last_order_date: '02/28/2026', last_order_amount: 4.99,   last_order_id: 'ORD-38801', account_status: 'Active', preferred_genre: 'Pop',       concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-013', pin: '7762', first_name: 'Mia',       last_name: 'Patterson', email: 'mia.p@email.com',       phone: '323-555-1303', address: '1600 Vine St, Los Angeles, CA 90028',              member_since: '06/20/2019', subscription_plan: 'Ultimate', subscription_status: 'Active',    subscription_renewal: '06/20/2026', loyalty_tier: 'VIP',       loyalty_points: 11200, total_spend: 1580.00, last_order_date: '05/03/2026', last_order_amount: 119.99, last_order_id: 'ORD-77099', account_status: 'Active', preferred_genre: 'Pop',       concert_credits: 3, store_credit: 30.00 },
    { customer_id: 'ZJ-014', pin: '4491', first_name: 'Nathan',    last_name: 'Clarke',    email: 'nclarke@email.com',     phone: '704-555-1404', address: '200 N Tryon St, Charlotte, NC 28202',              member_since: '02/14/2023', subscription_plan: 'Basic',    subscription_status: 'Active',    subscription_renewal: '02/14/2027', loyalty_tier: 'Fan',       loyalty_points: 220,   total_spend: 35.00,   last_order_date: '01/25/2026', last_order_amount: 4.99,   last_order_id: 'ORD-15544', account_status: 'Active', preferred_genre: 'Country',   concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-015', pin: '9988', first_name: 'Olivia',    last_name: 'Chen',      email: 'olivia.chen@email.com', phone: '312-555-1505', address: '500 N Michigan Ave, Chicago, IL 60611',            member_since: '09/01/2018', subscription_plan: 'Family',   subscription_status: 'Active',    subscription_renewal: '09/01/2026', loyalty_tier: 'Platinum',  loyalty_points: 22000, total_spend: 4100.00, last_order_date: '04/20/2026', last_order_amount: 250.00, last_order_id: 'ORD-98771', account_status: 'Active', preferred_genre: 'Classical', concert_credits: 4, store_credit: 75.00 },
    { customer_id: 'ZJ-016', pin: '1127', first_name: 'Patrick',   last_name: 'Murphy',    email: 'pmurphy@email.com',     phone: '617-555-1606', address: '44 School St, Boston, MA 02108',                   member_since: '11/30/2022', subscription_plan: 'Premium',  subscription_status: 'Active',    subscription_renewal: '11/30/2026', loyalty_tier: 'Superfan',  loyalty_points: 2900,  total_spend: 390.00,  last_order_date: '03/18/2026', last_order_amount: 35.00,  last_order_id: 'ORD-24400', account_status: 'Active', preferred_genre: 'Rock',      concert_credits: 1, store_credit: 10.00 },
    { customer_id: 'ZJ-017', pin: '6644', first_name: 'Quinn',     last_name: 'Rivera',    email: 'q.rivera@email.com',    phone: '787-555-1707', address: '150 Calle San Francisco, San Juan, PR 00901',      member_since: '03/08/2021', subscription_plan: 'Basic',    subscription_status: 'Active',    subscription_renewal: '03/08/2026', loyalty_tier: 'Fan',       loyalty_points: 580,   total_spend: 72.00,   last_order_date: '04/05/2026', last_order_amount: 4.99,   last_order_id: 'ORD-31200', account_status: 'Active', preferred_genre: 'R&B',       concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-018', pin: '3356', first_name: 'Rachel',    last_name: 'Kim',       email: 'rkim@email.com',        phone: '503-555-1808', address: '2000 SW Broadway, Portland, OR 97201',             member_since: '08/25/2020', subscription_plan: 'Premium',  subscription_status: 'Paused',    subscription_renewal: '08/25/2026', loyalty_tier: 'Superfan',  loyalty_points: 3100,  total_spend: 445.00,  last_order_date: '12/30/2025', last_order_amount: 9.99,   last_order_id: 'ORD-40077', account_status: 'Active', preferred_genre: 'Electronic',concert_credits: 1, store_credit: 0.00  },
    { customer_id: 'ZJ-019', pin: '8823', first_name: 'Samuel',    last_name: 'Grant',     email: 'sgrant@email.com',      phone: '615-555-1909', address: '100 Broadway, Nashville, TN 37201',                member_since: '05/17/2023', subscription_plan: 'Basic',    subscription_status: 'Active',    subscription_renewal: '05/17/2026', loyalty_tier: 'Fan',       loyalty_points: 310,   total_spend: 49.99,   last_order_date: '03/10/2026', last_order_amount: 19.99,  last_order_id: 'ORD-52100', account_status: 'Active', preferred_genre: 'Country',   concert_credits: 0, store_credit: 5.00  },
    { customer_id: 'ZJ-020', pin: '1104', first_name: 'Taylor',    last_name: 'Brooks',    email: 'tbrooks@email.com',     phone: '480-555-2000', address: '4000 N Central Ave, Phoenix, AZ 85012',            member_since: '01/12/2022', subscription_plan: 'Ultimate', subscription_status: 'Active',    subscription_renewal: '01/12/2027', loyalty_tier: 'VIP',       loyalty_points: 8900,  total_spend: 1050.00, last_order_date: '04/22/2026', last_order_amount: 185.00, last_order_id: 'ORD-63345', account_status: 'Active', preferred_genre: 'Multiple',  concert_credits: 2, store_credit: 20.00 },
    { customer_id: 'ZJ-021', pin: '5537', first_name: 'Ursula',    last_name: 'Patel',     email: 'upatel@email.com',      phone: '732-555-2101', address: '110 Frelinghuysen Ave, Newark, NJ 07114',          member_since: '07/19/2021', subscription_plan: 'None',     subscription_status: 'Expired',   subscription_renewal: null,         loyalty_tier: 'Fan',       loyalty_points: 100,   total_spend: 15.00,   last_order_date: '09/30/2025', last_order_amount: 9.99,   last_order_id: 'ORD-00214', account_status: 'Active', preferred_genre: 'Pop',       concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-022', pin: '9946', first_name: 'Victor',    last_name: 'Osei',      email: 'vosei@email.com',       phone: '404-555-2202', address: '750 Marietta St NW, Atlanta, GA 30318',            member_since: '04/29/2020', subscription_plan: 'Premium',  subscription_status: 'Active',    subscription_renewal: '04/29/2026', loyalty_tier: 'Superfan',  loyalty_points: 4600,  total_spend: 660.00,  last_order_date: '04/10/2026', last_order_amount: 79.99,  last_order_id: 'ORD-71822', account_status: 'Active', preferred_genre: 'Hip-Hop',   concert_credits: 1, store_credit: 0.00  },
    { customer_id: 'ZJ-023', pin: '7715', first_name: 'Wendy',     last_name: 'Torres',    email: 'wtorres@email.com',     phone: '713-555-2303', address: '1200 Main St, Houston, TX 77002',                  member_since: '10/10/2022', subscription_plan: 'Basic',    subscription_status: 'Cancelled', subscription_renewal: null,         loyalty_tier: 'Fan',       loyalty_points: 200,   total_spend: 40.00,   last_order_date: '06/15/2025', last_order_amount: 4.99,   last_order_id: 'ORD-10099', account_status: 'Active', preferred_genre: 'Pop',       concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-024', pin: '2288', first_name: 'Xavier',    last_name: 'Scott',     email: 'xscott@email.com',      phone: '202-555-2404', address: '600 Independence Ave SW, Washington, DC 20560',    member_since: '02/02/2019', subscription_plan: 'Ultimate', subscription_status: 'Active',    subscription_renewal: '02/02/2027', loyalty_tier: 'Platinum',  loyalty_points: 25000, total_spend: 4500.00, last_order_date: '05/04/2026', last_order_amount: 250.00, last_order_id: 'ORD-99999', account_status: 'Active', preferred_genre: 'Jazz',      concert_credits: 5, store_credit: 65.00 },
    { customer_id: 'ZJ-025', pin: '6602', first_name: 'Yvette',    last_name: 'Dupont',    email: 'ydupont@email.com',     phone: '504-555-2505', address: '300 Bourbon St, New Orleans, LA 70130',            member_since: '06/06/2021', subscription_plan: 'Premium',  subscription_status: 'Active',    subscription_renewal: '06/06/2026', loyalty_tier: 'VIP',       loyalty_points: 7100,  total_spend: 870.00,  last_order_date: '03/28/2026', last_order_amount: 95.00,  last_order_id: 'ORD-83001', account_status: 'Active', preferred_genre: 'Jazz',      concert_credits: 2, store_credit: 10.00 },
    { customer_id: 'ZJ-026', pin: '3341', first_name: 'Zachary',   last_name: 'Simmons',   email: 'zsimmons@email.com',    phone: '312-555-2606', address: '233 S Wacker Dr, Chicago, IL 60606',               member_since: '11/22/2023', subscription_plan: 'Student',  subscription_status: 'Active',    subscription_renewal: '11/22/2026', loyalty_tier: 'Fan',       loyalty_points: 280,   total_spend: 39.99,   last_order_date: '02/14/2026', last_order_amount: 4.99,   last_order_id: 'ORD-22801', account_status: 'Active', preferred_genre: 'Hip-Hop',   concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-027', pin: '8834', first_name: 'Amber',     last_name: 'Williams',  email: 'awilliams@email.com',   phone: '757-555-2707', address: '200 Granby St, Norfolk, VA 23510',                 member_since: '09/09/2020', subscription_plan: 'Basic',    subscription_status: 'Active',    subscription_renewal: '09/09/2026', loyalty_tier: 'Fan',       loyalty_points: 430,   total_spend: 55.00,   last_order_date: '03/05/2026', last_order_amount: 4.99,   last_order_id: 'ORD-34567', account_status: 'Active', preferred_genre: 'R&B',       concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-028', pin: '1160', first_name: 'Brian',     last_name: 'Nakamura',  email: 'bnakamura@email.com',   phone: '808-555-2808', address: '1 Aloha Tower Dr, Honolulu, HI 96813',             member_since: '03/14/2022', subscription_plan: 'Premium',  subscription_status: 'Active',    subscription_renewal: '03/14/2027', loyalty_tier: 'Superfan',  loyalty_points: 3400,  total_spend: 480.00,  last_order_date: '04/18/2026', last_order_amount: 65.00,  last_order_id: 'ORD-45901', account_status: 'Active', preferred_genre: 'Rock',      concert_credits: 1, store_credit: 0.00  },
    { customer_id: 'ZJ-029', pin: '5522', first_name: 'Crystal',   last_name: 'Powell',    email: 'cpowell@email.com',     phone: '901-555-2909', address: '149 Beale St, Memphis, TN 38103',                  member_since: '07/31/2021', subscription_plan: 'None',     subscription_status: 'Cancelled', subscription_renewal: null,         loyalty_tier: 'Fan',       loyalty_points: 180,   total_spend: 24.99,   last_order_date: '08/20/2025', last_order_amount: 9.99,   last_order_id: 'ORD-09901', account_status: 'Active', preferred_genre: 'R&B',       concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-030', pin: '9973', first_name: 'Derek',     last_name: 'Holloway',  email: 'dholloway@email.com',   phone: '614-555-3000', address: '50 W Broad St, Columbus, OH 43215',                member_since: '01/19/2023', subscription_plan: 'Basic',    subscription_status: 'Active',    subscription_renewal: '01/19/2027', loyalty_tier: 'Fan',       loyalty_points: 360,   total_spend: 50.00,   last_order_date: '02/05/2026', last_order_amount: 4.99,   last_order_id: 'ORD-61100', account_status: 'Active', preferred_genre: 'Country',   concert_credits: 0, store_credit: 5.00  },
    { customer_id: 'ZJ-031', pin: '7784', first_name: 'Elena',     last_name: 'Russo',     email: 'erusso@email.com',      phone: '212-555-3101', address: '350 5th Ave, New York, NY 10118',                  member_since: '05/05/2020', subscription_plan: 'Ultimate', subscription_status: 'Paused',    subscription_renewal: '05/05/2026', loyalty_tier: 'VIP',       loyalty_points: 6800,  total_spend: 820.00,  last_order_date: '11/28/2025', last_order_amount: 14.99,  last_order_id: 'ORD-78400', account_status: 'Active', preferred_genre: 'Classical', concert_credits: 0, store_credit: 15.00 },
    { customer_id: 'ZJ-032', pin: '2203', first_name: 'Frank',     last_name: 'Delgado',   email: 'fdelgado@email.com',    phone: '602-555-3202', address: '201 E Washington St, Phoenix, AZ 85004',            member_since: '08/08/2022', subscription_plan: 'Premium',  subscription_status: 'Active',    subscription_renewal: '08/08/2026', loyalty_tier: 'Superfan',  loyalty_points: 2600,  total_spend: 360.00,  last_order_date: '03/25/2026', last_order_amount: 35.00,  last_order_id: 'ORD-52244', account_status: 'Active', preferred_genre: 'Rock',      concert_credits: 1, store_credit: 0.00  },
    { customer_id: 'ZJ-033', pin: '6618', first_name: 'Gina',      last_name: 'Watkins',   email: 'gwatkins@email.com',    phone: '757-555-3303', address: '1 Coliseum Dr, Hampton, VA 23666',                 member_since: '04/04/2021', subscription_plan: 'None',     subscription_status: 'Expired',   subscription_renewal: null,         loyalty_tier: 'Fan',       loyalty_points: 110,   total_spend: 19.99,   last_order_date: '10/15/2025', last_order_amount: 9.99,   last_order_id: 'ORD-00441', account_status: 'Active', preferred_genre: 'Pop',       concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-034', pin: '3378', first_name: 'Hassan',    last_name: 'Ali',       email: 'hali@email.com',        phone: '313-555-3404', address: '400 Renaissance Center, Detroit, MI 48243',        member_since: '12/12/2022', subscription_plan: 'Basic',    subscription_status: 'Active',    subscription_renewal: '12/12/2026', loyalty_tier: 'Fan',       loyalty_points: 390,   total_spend: 58.00,   last_order_date: '02/22/2026', last_order_amount: 4.99,   last_order_id: 'ORD-72100', account_status: 'Active', preferred_genre: 'Hip-Hop',   concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-035', pin: '8851', first_name: 'Ingrid',    last_name: 'Sorensen',  email: 'isorensen@email.com',   phone: '612-555-3505', address: '800 Nicollet Mall, Minneapolis, MN 55402',         member_since: '06/28/2020', subscription_plan: 'Premium',  subscription_status: 'Active',    subscription_renewal: '06/28/2026', loyalty_tier: 'Superfan',  loyalty_points: 4900,  total_spend: 700.00,  last_order_date: '04/08/2026', last_order_amount: 99.99,  last_order_id: 'ORD-83090', account_status: 'Active', preferred_genre: 'Electronic',concert_credits: 2, store_credit: 20.00 },
    { customer_id: 'ZJ-036', pin: '1183', first_name: 'Joel',      last_name: 'Bennett',   email: 'jbennett@email.com',    phone: '206-555-3606', address: '400 Broad St, Seattle, WA 98109',                  member_since: '10/17/2021', subscription_plan: 'None',     subscription_status: 'Cancelled', subscription_renewal: null,         loyalty_tier: 'Fan',       loyalty_points: 130,   total_spend: 20.00,   last_order_date: '07/04/2025', last_order_amount: 9.99,   last_order_id: 'ORD-05500', account_status: 'Active', preferred_genre: 'Rock',      concert_credits: 0, store_credit: 0.00  },
    { customer_id: 'ZJ-037', pin: '5567', first_name: 'Karen',     last_name: 'Ellison',   email: 'kellison@email.com',    phone: '757-555-3707', address: '600 Settlers Landing Rd, Hampton, VA 23669',      member_since: '02/11/2024', subscription_plan: 'Basic',    subscription_status: 'Paused',    subscription_renewal: '02/11/2027', loyalty_tier: 'Fan',       loyalty_points: 160,   total_spend: 28.00,   last_order_date: '01/30/2026', last_order_amount: 4.99,   last_order_id: 'ORD-19800', account_status: 'Active', preferred_genre: 'Country',   concert_credits: 0, store_credit: 0.00  },
    // ── Demo records ────────────────────────────────────────────────────────
    { customer_id: 'ZJ-038', pin: '5561', first_name: 'Jason',     last_name: 'Mobley',    email: 'jason.mobley@email.com',phone: '850-217-6664', address: '1014 Greenbrier Pkwy, Newport News, VA 23608',     member_since: '03/15/2021', subscription_plan: 'Ultimate', subscription_status: 'Active',    subscription_renewal: '03/15/2027', loyalty_tier: 'VIP',       loyalty_points: 8500,  total_spend: 1240.00, last_order_date: '04/28/2026', last_order_amount: 119.99, last_order_id: 'ORD-ZJ038A', account_status: 'Active', preferred_genre: 'Multiple',  concert_credits: 2, store_credit: 15.00 },
    { customer_id: 'ZJ-039', pin: '7731', first_name: 'Mason',     last_name: 'Morris',    email: 'mason.morris@email.com',phone: '850-655-3044', address: '837 Pilot House Dr, Newport News, VA 23606',       member_since: '07/22/2022', subscription_plan: 'Premium',  subscription_status: 'Active',    subscription_renewal: '07/22/2026', loyalty_tier: 'Superfan',  loyalty_points: 3200,  total_spend: 485.00,  last_order_date: '03/15/2026', last_order_amount: 65.00,  last_order_id: 'ORD-ZJ039A', account_status: 'Active', preferred_genre: 'Rock',      concert_credits: 1, store_credit: 0.00  },
    { customer_id: 'ZJ-040', pin: '3344', first_name: 'Todd',      last_name: 'Anderson',  email: 'todd.anderson@email.com',phone: '703-728-2157', address: '2101 Village Green Pkwy, Newport News, VA 23602', member_since: '11/08/2023', subscription_plan: 'Basic',    subscription_status: 'Active',    subscription_renewal: '11/08/2026', loyalty_tier: 'Fan',       loyalty_points: 750,   total_spend: 89.99,   last_order_date: '02/10/2026', last_order_amount: 24.99,  last_order_id: 'ORD-ZJ040A', account_status: 'Active', preferred_genre: 'Country',   concert_credits: 0, store_credit: 5.00  },
  ];

  // ── Master product list ───────────────────────────────────────────────────
  const products = [
    // Streaming plans
    { product_id: 'ZJP-001', product_name: 'Basic Streaming Plan',              category: 'Streaming',       description: 'Access to 50M+ songs ad-supported',                             price: 4.99,   stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: null },
    { product_id: 'ZJP-002', product_name: 'Premium Streaming Plan',            category: 'Streaming',       description: 'Ad-free, offline mode, HD audio',                                price: 9.99,   stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: null },
    { product_id: 'ZJP-003', product_name: 'Ultimate Streaming Plan',           category: 'Streaming',       description: 'Lossless audio, exclusive content, early ticket access',          price: 14.99,  stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: null },
    { product_id: 'ZJP-004', product_name: 'Family Plan (6 accounts)',          category: 'Streaming',       description: '6 individual accounts, parental controls',                       price: 17.99,  stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: null },
    { product_id: 'ZJP-005', product_name: 'Student Plan',                      category: 'Streaming',       description: 'Verified students only — Premium features at half price',         price: 4.99,   stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: null },
    { product_id: 'ZJP-006', product_name: 'Annual Basic Plan',                 category: 'Streaming',       description: 'Basic plan — 2 months free vs monthly',                          price: 49.99,  stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: null },
    { product_id: 'ZJP-007', product_name: 'Annual Premium Plan',               category: 'Streaming',       description: 'Premium plan — 2 months free vs monthly',                        price: 99.99,  stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: null },
    { product_id: 'ZJP-008', product_name: 'Annual Ultimate Plan',              category: 'Streaming',       description: 'Ultimate plan — 2 months free vs monthly',                       price: 149.99, stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: null },
    // Concert tickets
    { product_id: 'ZJP-009', product_name: 'Summer Jam Festival — General Admission', category: 'Concert Ticket', description: 'General admission entry to Summer Jam Festival',            price: 65.00,  stock_qty: 500,  is_active: 1, event_name: 'Summer Jam Festival', venue: 'Newport News City Park',           event_date: '07/19/2026', sku: null },
    { product_id: 'ZJP-010', product_name: 'Summer Jam Festival — VIP',         category: 'VIP Package',     description: 'VIP entry with lounge access and complimentary drinks',          price: 185.00, stock_qty: 75,   is_active: 1, event_name: 'Summer Jam Festival', venue: 'Newport News City Park',           event_date: '07/19/2026', sku: null },
    { product_id: 'ZJP-011', product_name: 'Fall Acoustic Tour — Hampton',      category: 'Concert Ticket',  description: 'General admission for Fall Acoustic Tour Hampton stop',          price: 45.00,  stock_qty: 300,  is_active: 1, event_name: 'Fall Acoustic Tour',   venue: 'Hampton Coliseum',                 event_date: '10/04/2026', sku: null },
    { product_id: 'ZJP-012', product_name: 'New Year\'s Eve Countdown',         category: 'Concert Ticket',  description: 'Ring in the New Year with live performances',                    price: 95.00,  stock_qty: 200,  is_active: 1, event_name: 'New Year\'s Eve Countdown', venue: 'Virginia Beach Amphitheater',  event_date: '12/31/2026', sku: null },
    { product_id: 'ZJP-013', product_name: 'Zoomlly Underground Series — Richmond', category: 'Concert Ticket', description: 'Intimate underground venue showcase',                        price: 35.00,  stock_qty: 150,  is_active: 1, event_name: 'Zoomlly Underground Series', venue: 'The National, Richmond VA',  event_date: '09/12/2026', sku: null },
    { product_id: 'ZJP-014', product_name: 'Backstage VIP Pass Add-on',         category: 'VIP Package',     description: 'Meet & greet, soundcheck access, signed merch',                  price: 250.00, stock_qty: 20,   is_active: 1, event_name: null, venue: null, event_date: null, sku: null },
    // Merch
    { product_id: 'ZJP-015', product_name: 'Classic Logo Tee',                  category: 'Merch',           description: 'Soft cotton unisex t-shirt with Zoomlly Jams logo',              price: 24.99,  stock_qty: 200,  is_active: 1, event_name: null, venue: null, event_date: null, sku: 'ZJ-TEE-001' },
    { product_id: 'ZJP-016', product_name: 'Premium Zip Hoodie',                 category: 'Merch',           description: 'Full-zip fleece hoodie with embroidered logo',                   price: 59.99,  stock_qty: 100,  is_active: 1, event_name: null, venue: null, event_date: null, sku: 'ZJ-HOOD-001' },
    { product_id: 'ZJP-017', product_name: 'Artist Poster Pack (5)',             category: 'Merch',           description: 'Set of 5 artist poster prints, 18x24 in',                        price: 19.99,  stock_qty: 150,  is_active: 1, event_name: null, venue: null, event_date: null, sku: 'ZJ-POST-005' },
    { product_id: 'ZJP-018', product_name: 'Snapback Cap',                       category: 'Merch',           description: 'Adjustable snapback cap with embroidered logo',                  price: 29.99,  stock_qty: 80,   is_active: 1, event_name: null, venue: null, event_date: null, sku: 'ZJ-CAP-001' },
    // Vinyl & Digital
    { product_id: 'ZJP-019', product_name: 'Limited Edition Vinyl — Vol. 1',    category: 'Vinyl',           description: 'Exclusive 180g vinyl pressing, hand-numbered',                   price: 34.99,  stock_qty: 50,   is_active: 1, event_name: null, venue: null, event_date: null, sku: 'ZJ-VIN-001' },
    { product_id: 'ZJP-020', product_name: 'Vinyl Bundle (3 records)',           category: 'Vinyl',           description: 'Three-record bundle — Vols. 1, 2, and 3',                        price: 79.99,  stock_qty: 30,   is_active: 1, event_name: null, venue: null, event_date: null, sku: 'ZJ-VIN-BDL' },
    { product_id: 'ZJP-021', product_name: 'Digital Album Download',             category: 'Digital Download',description: 'Full album high-quality MP3/FLAC digital download',              price: 9.99,   stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: 'ZJ-DL-ALB' },
    { product_id: 'ZJP-022', product_name: 'Digital Single Download',            category: 'Digital Download',description: 'Individual track high-quality MP3/FLAC download',                price: 1.29,   stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: 'ZJ-DL-SNG' },
    // Bundles & Gift Cards
    { product_id: 'ZJP-023', product_name: 'Festival + 3-Month Premium Bundle', category: 'Bundle',          description: 'Summer Jam GA ticket + 3 months Premium streaming',               price: 119.99, stock_qty: 100,  is_active: 1, event_name: 'Summer Jam Festival', venue: 'Newport News City Park',           event_date: '07/19/2026', sku: null },
    { product_id: 'ZJP-024', product_name: 'Gift Card $50',                      category: 'Gift Card',       description: 'Zoomlly Jams $50 digital gift card',                             price: 50.00,  stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: 'ZJ-GC-050' },
    { product_id: 'ZJP-025', product_name: 'Gift Card $100',                     category: 'Gift Card',       description: 'Zoomlly Jams $100 digital gift card',                            price: 100.00, stock_qty: null, is_active: 1, event_name: null, venue: null, event_date: null, sku: 'ZJ-GC-100' },
  ];

  // ── Handle customers ──────────────────────────────────────────────────────
  const customerCount = db.prepare('SELECT COUNT(*) as n FROM zj_customers').get();

  if (customerCount.n > 0) {
    // Existing DB — use INSERT OR IGNORE for any missing records
    const insertOrIgnoreCustomer = db.prepare(`
      INSERT OR IGNORE INTO zj_customers
        (customer_id, pin, first_name, last_name, email, phone, address,
         member_since, subscription_plan, subscription_status, subscription_renewal,
         loyalty_tier, loyalty_points, total_spend, last_order_date, last_order_amount,
         last_order_id, account_status, preferred_genre, concert_credits, store_credit)
      VALUES
        (@customer_id, @pin, @first_name, @last_name, @email, @phone, @address,
         @member_since, @subscription_plan, @subscription_status, @subscription_renewal,
         @loyalty_tier, @loyalty_points, @total_spend, @last_order_date, @last_order_amount,
         @last_order_id, @account_status, @preferred_genre, @concert_credits, @store_credit)
    `);
    const backfillCustomers = db.transaction(() => {
      for (const c of customers) insertOrIgnoreCustomer.run(c);
    });
    backfillCustomers();
    console.log('[DB] Zoomlly customers backfill applied (INSERT OR IGNORE)');
  } else {
    // Fresh install — insert all
    const insertCustomer = db.prepare(`
      INSERT INTO zj_customers
        (customer_id, pin, first_name, last_name, email, phone, address,
         member_since, subscription_plan, subscription_status, subscription_renewal,
         loyalty_tier, loyalty_points, total_spend, last_order_date, last_order_amount,
         last_order_id, account_status, preferred_genre, concert_credits, store_credit)
      VALUES
        (@customer_id, @pin, @first_name, @last_name, @email, @phone, @address,
         @member_since, @subscription_plan, @subscription_status, @subscription_renewal,
         @loyalty_tier, @loyalty_points, @total_spend, @last_order_date, @last_order_amount,
         @last_order_id, @account_status, @preferred_genre, @concert_credits, @store_credit)
    `);
    const seedCustomers = db.transaction(() => {
      for (const c of customers) insertCustomer.run(c);
    });
    seedCustomers();
    console.log(`[DB] Zoomlly Jams seeded with ${customers.length} customers`);
  }

  // ── Handle products ───────────────────────────────────────────────────────
  const productCount = db.prepare('SELECT COUNT(*) as n FROM zj_products').get();

  if (productCount.n > 0) {
    const insertOrIgnoreProduct = db.prepare(`
      INSERT OR IGNORE INTO zj_products
        (product_id, product_name, category, description, price, stock_qty,
         is_active, event_name, venue, event_date, sku)
      VALUES
        (@product_id, @product_name, @category, @description, @price, @stock_qty,
         @is_active, @event_name, @venue, @event_date, @sku)
    `);
    const backfillProducts = db.transaction(() => {
      for (const p of products) insertOrIgnoreProduct.run(p);
    });
    backfillProducts();
    console.log('[DB] Zoomlly products backfill applied (INSERT OR IGNORE)');
  } else {
    const insertProduct = db.prepare(`
      INSERT INTO zj_products
        (product_id, product_name, category, description, price, stock_qty,
         is_active, event_name, venue, event_date, sku)
      VALUES
        (@product_id, @product_name, @category, @description, @price, @stock_qty,
         @is_active, @event_name, @venue, @event_date, @sku)
    `);
    const seedProducts = db.transaction(() => {
      for (const p of products) insertProduct.run(p);
    });
    seedProducts();
    console.log(`[DB] Zoomlly Jams seeded with ${products.length} products`);
  }
}

module.exports = seedZoomlly;
