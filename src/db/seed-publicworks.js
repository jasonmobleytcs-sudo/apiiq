const db = require('./index');

function seedPublicWorks() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pw_residents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      gender TEXT CHECK(gender IN ('M','F')),
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      account_number TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      service_type TEXT NOT NULL,
      last_inspection TEXT,
      inspection_result TEXT CHECK(inspection_result IN ('Pass','Fail')),
      balance REAL DEFAULT 0.00,
      email TEXT
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as n FROM pw_residents').get();
  if (count.n > 0) return;

  const insert = db.prepare(`
    INSERT INTO pw_residents
      (name, gender, address, phone, account_number, pin, service_type, last_inspection, inspection_result, balance, email)
    VALUES
      (@name, @gender, @address, @phone, @account_number, @pin, @service_type, @last_inspection, @inspection_result, @balance, @email)
  `);

  const residents = [
    { name: 'Marcus Hill', gender: 'M', address: '1205 28th St, Newport News, VA 23607', phone: '757-555-2101', account_number: 'NN10001', pin: '4421', service_type: 'Trash', last_inspection: '03/12/2026', inspection_result: 'Pass', balance: 0.00, email: 'marcus.hill@email.com' },
    { name: 'Angela Brooks', gender: 'F', address: '5421 Chestnut Ave, Newport News, VA 23605', phone: '757-555-2102', account_number: 'NN10002', pin: '8832', service_type: 'Trash/Recycling', last_inspection: '03/10/2026', inspection_result: 'Pass', balance: 12.50, email: 'angela.brooks@email.com' },
    { name: 'Derrick Johnson', gender: 'M', address: '3109 Roanoke Ave, Newport News, VA 23607', phone: '757-555-2103', account_number: 'NN10003', pin: '7744', service_type: 'Recycling', last_inspection: '02/25/2026', inspection_result: 'Fail', balance: 0.00, email: 'derrick.j@email.com' },
    { name: 'Latoya Smith', gender: 'F', address: '8802 Jefferson Ave, Newport News, VA 23605', phone: '757-555-2104', account_number: 'NN10004', pin: '2291', service_type: 'Trash', last_inspection: '03/01/2026', inspection_result: 'Pass', balance: 5.00, email: 'latoya.smith@email.com' },
    { name: 'Kevin Turner', gender: 'M', address: '17 Ivy Farms Rd, Newport News, VA 23601', phone: '757-555-2105', account_number: 'NN10005', pin: '9910', service_type: 'Bulk Pickup', last_inspection: '02/28/2026', inspection_result: 'Pass', balance: 0.00, email: 'kevin.turner@email.com' },
    { name: 'Melissa Carter', gender: 'F', address: '420 Denbigh Blvd, Newport News, VA 23608', phone: '757-555-2106', account_number: 'NN10006', pin: '3388', service_type: 'Trash', last_inspection: '03/15/2026', inspection_result: 'Pass', balance: 0.00, email: 'melissa.c@email.com' },
    { name: 'Brian Foster', gender: 'M', address: '730 Harpersville Rd, Newport News, VA 23601', phone: '757-555-2107', account_number: 'NN10007', pin: '7722', service_type: 'Recycling', last_inspection: '03/05/2026', inspection_result: 'Pass', balance: 3.75, email: 'brian.f@email.com' },
    { name: 'Tiffany Reed', gender: 'F', address: '1920 Warwick Blvd, Newport News, VA 23607', phone: '757-555-2108', account_number: 'NN10008', pin: '6655', service_type: 'Trash', last_inspection: '03/02/2026', inspection_result: 'Fail', balance: 0.00, email: 'tiffany.r@email.com' },
    { name: 'James Walker', gender: 'M', address: '1012 J Clyde Morris Blvd, Newport News, VA 23602', phone: '757-555-2109', account_number: 'NN10009', pin: '1177', service_type: 'Trash/Recycling', last_inspection: '03/14/2026', inspection_result: 'Pass', balance: 0.00, email: 'james.walker@email.com' },
    { name: 'Erica Davis', gender: 'F', address: '250 Elmhurst St, Newport News, VA 23603', phone: '757-555-2110', account_number: 'NN10010', pin: '8844', service_type: 'Trash', last_inspection: '02/27/2026', inspection_result: 'Pass', balance: 6.25, email: 'erica.d@email.com' },
    { name: 'Robert King', gender: 'M', address: '612 Pilot House Dr, Newport News, VA 23606', phone: '757-555-2111', account_number: 'NN10011', pin: '4422', service_type: 'Trash', last_inspection: '03/11/2026', inspection_result: 'Pass', balance: 0.00, email: 'rking@email.com' },
    { name: 'Danielle Moore', gender: 'F', address: '812 Lucas Creek Rd, Newport News, VA 23602', phone: '757-555-2112', account_number: 'NN10012', pin: '9912', service_type: 'Recycling', last_inspection: '03/08/2026', inspection_result: 'Pass', balance: 0.00, email: 'dmoore@email.com' },
    { name: 'Anthony Scott', gender: 'M', address: '922 Colony Rd, Newport News, VA 23602', phone: '757-555-2113', account_number: 'NN10013', pin: '2209', service_type: 'Trash', last_inspection: '02/20/2026', inspection_result: 'Fail', balance: 0.00, email: 'ascott@email.com' },
    { name: 'Jasmine White', gender: 'F', address: '431 Hiden Blvd, Newport News, VA 23606', phone: '757-555-2114', account_number: 'NN10014', pin: '8841', service_type: 'Trash/Recycling', last_inspection: '03/13/2026', inspection_result: 'Pass', balance: 8.00, email: 'jwhite@email.com' },
    { name: 'Steven Adams', gender: 'M', address: '511 Hilton Blvd, Newport News, VA 23605', phone: '757-555-2115', account_number: 'NN10015', pin: '7728', service_type: 'Bulk Pickup', last_inspection: '03/01/2026', inspection_result: 'Pass', balance: 0.00, email: 'sadams@email.com' },
    { name: 'Nicole Green', gender: 'F', address: '729 74th St, Newport News, VA 23605', phone: '757-555-2116', account_number: 'NN10016', pin: '3310', service_type: 'Trash', last_inspection: '02/26/2026', inspection_result: 'Pass', balance: 0.00, email: 'ngreen@email.com' },
    { name: 'Brandon Lee', gender: 'M', address: '601 River Rd, Newport News, VA 23601', phone: '757-555-2117', account_number: 'NN10017', pin: '9902', service_type: 'Recycling', last_inspection: '03/09/2026', inspection_result: 'Pass', balance: 2.50, email: 'blee@email.com' },
    { name: 'Rachel Hall', gender: 'F', address: '1400 Old Oyster Point Rd, Newport News, VA 23602', phone: '757-555-2118', account_number: 'NN10018', pin: '4419', service_type: 'Trash', last_inspection: '03/06/2026', inspection_result: 'Pass', balance: 0.00, email: 'rhall@email.com' },
    { name: 'Christopher Young', gender: 'M', address: '808 Turnberry Blvd, Newport News, VA 23602', phone: '757-555-2119', account_number: 'NN10019', pin: '7711', service_type: 'Trash', last_inspection: '03/04/2026', inspection_result: 'Fail', balance: 0.00, email: 'cyoung@email.com' },
    { name: 'Lauren Allen', gender: 'F', address: '223 Beechmont Dr, Newport News, VA 23608', phone: '757-555-2120', account_number: 'NN10020', pin: '6688', service_type: 'Recycling', last_inspection: '03/07/2026', inspection_result: 'Pass', balance: 4.75, email: 'lallen@email.com' },
    { name: 'David Perez', gender: 'M', address: '331 Denbigh Blvd, Newport News, VA 23608', phone: '757-555-2121', account_number: 'NN10021', pin: '5521', service_type: 'Trash', last_inspection: '03/10/2026', inspection_result: 'Pass', balance: 0.00, email: 'dperez@email.com' },
    { name: 'Megan Ward', gender: 'F', address: '912 Harpersville Rd, Newport News, VA 23601', phone: '757-555-2122', account_number: 'NN10022', pin: '8845', service_type: 'Trash/Recycling', last_inspection: '03/12/2026', inspection_result: 'Pass', balance: 7.25, email: 'mward@email.com' },
    { name: 'Tyler Cox', gender: 'M', address: '441 Colony Rd, Newport News, VA 23602', phone: '757-555-2123', account_number: 'NN10023', pin: '1198', service_type: 'Trash', last_inspection: '02/22/2026', inspection_result: 'Fail', balance: 0.00, email: 'tcox@email.com' },
    { name: 'Brittany Howard', gender: 'F', address: '123 Ivy Farms Rd, Newport News, VA 23601', phone: '757-555-2124', account_number: 'NN10024', pin: '6642', service_type: 'Recycling', last_inspection: '03/05/2026', inspection_result: 'Pass', balance: 0.00, email: 'bhoward@email.com' },
    { name: 'Justin Bell', gender: 'M', address: '200 Warwick Blvd, Newport News, VA 23607', phone: '757-555-2125', account_number: 'NN10025', pin: '7719', service_type: 'Trash', last_inspection: '03/03/2026', inspection_result: 'Pass', balance: 1.50, email: 'jbell@email.com' },
    { name: 'Heather Ross', gender: 'F', address: '889 J Clyde Morris Blvd, Newport News, VA 23602', phone: '757-555-2126', account_number: 'NN10026', pin: '8821', service_type: 'Trash', last_inspection: '03/11/2026', inspection_result: 'Pass', balance: 0.00, email: 'hross@email.com' },
    { name: 'Kyle Jenkins', gender: 'M', address: '901 Lucas Creek Rd, Newport News, VA 23602', phone: '757-555-2127', account_number: 'NN10027', pin: '2255', service_type: 'Recycling', last_inspection: '03/08/2026', inspection_result: 'Pass', balance: 0.00, email: 'kjenkins@email.com' },
    { name: 'Amanda Price', gender: 'F', address: '410 Hilton Blvd, Newport News, VA 23605', phone: '757-555-2128', account_number: 'NN10028', pin: '4491', service_type: 'Trash', last_inspection: '03/06/2026', inspection_result: 'Fail', balance: 0.00, email: 'aprice@email.com' },
    { name: 'Sean Bennett', gender: 'M', address: '75 Beechmont Dr, Newport News, VA 23608', phone: '757-555-2129', account_number: 'NN10029', pin: '3377', service_type: 'Trash', last_inspection: '03/09/2026', inspection_result: 'Pass', balance: 3.00, email: 'sbennett@email.com' },
    { name: 'Courtney Bailey', gender: 'F', address: '102 Elmhurst St, Newport News, VA 23603', phone: '757-555-2130', account_number: 'NN10030', pin: '9915', service_type: 'Trash/Recycling', last_inspection: '03/07/2026', inspection_result: 'Pass', balance: 0.00, email: 'cbailey@email.com' },
    { name: 'Eric Simmons', gender: 'M', address: '522 Denbigh Blvd, Newport News, VA 23608', phone: '757-555-2131', account_number: 'NN10031', pin: '8812', service_type: 'Trash', last_inspection: '03/12/2026', inspection_result: 'Pass', balance: 0.00, email: 'esimmons@email.com' },
    { name: 'Olivia Powell', gender: 'F', address: '811 River Rd, Newport News, VA 23601', phone: '757-555-2132', account_number: 'NN10032', pin: '7723', service_type: 'Recycling', last_inspection: '03/10/2026', inspection_result: 'Pass', balance: 5.50, email: 'opowell@email.com' },
    { name: 'Nathan Bryant', gender: 'M', address: '715 Jefferson Ave, Newport News, VA 23605', phone: '757-555-2133', account_number: 'NN10033', pin: '6601', service_type: 'Trash', last_inspection: '02/28/2026', inspection_result: 'Fail', balance: 0.00, email: 'nbryant@email.com' },
    { name: 'Hannah Cooper', gender: 'F', address: '245 28th St, Newport News, VA 23607', phone: '757-555-2134', account_number: 'NN10034', pin: '1134', service_type: 'Trash', last_inspection: '03/04/2026', inspection_result: 'Pass', balance: 0.00, email: 'hcooper@email.com' },
    { name: 'Aaron Richardson', gender: 'M', address: '622 Colony Rd, Newport News, VA 23602', phone: '757-555-2135', account_number: 'NN10035', pin: '9982', service_type: 'Bulk Pickup', last_inspection: '03/02/2026', inspection_result: 'Pass', balance: 0.00, email: 'arichardson@email.com' },
    { name: 'Chloe Ward', gender: 'F', address: '310 Old Oyster Point Rd, Newport News, VA 23602', phone: '757-555-2136', account_number: 'NN10036', pin: '5542', service_type: 'Trash', last_inspection: '03/01/2026', inspection_result: 'Pass', balance: 2.25, email: 'cward@email.com' },
    { name: 'Zachary Gray', gender: 'M', address: '77 Hiden Blvd, Newport News, VA 23606', phone: '757-555-2137', account_number: 'NN10037', pin: '7788', service_type: 'Recycling', last_inspection: '03/06/2026', inspection_result: 'Pass', balance: 0.00, email: 'zgray@email.com' },
    { name: 'Madison Perry', gender: 'F', address: '940 Pilot House Dr, Newport News, VA 23606', phone: '757-555-2138', account_number: 'NN10038', pin: '8829', service_type: 'Trash', last_inspection: '03/08/2026', inspection_result: 'Pass', balance: 0.00, email: 'mperry@email.com' },
    { name: 'Caleb Coleman', gender: 'M', address: '510 Harpersville Rd, Newport News, VA 23601', phone: '757-555-2139', account_number: 'NN10039', pin: '6648', service_type: 'Trash', last_inspection: '02/27/2026', inspection_result: 'Fail', balance: 0.00, email: 'ccoleman@email.com' },
    { name: 'Victoria Hughes', gender: 'F', address: '812 Warwick Blvd, Newport News, VA 23607', phone: '757-555-2140', account_number: 'NN10040', pin: '2298', service_type: 'Trash/Recycling', last_inspection: '03/09/2026', inspection_result: 'Pass', balance: 6.75, email: 'vhughes@email.com' }
  ];

  const seedAll = db.transaction(() => {
    for (const r of residents) insert.run(r);
  });
  seedAll();
  console.log(`[DB] Public Works seeded with ${residents.length} residents`);
}

module.exports = seedPublicWorks;
