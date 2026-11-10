const db = require('./index');

// Workday HCM demo tenant for Vantage Industries.
//
// Fictional company on purpose: this one gets shown to any customer, so nothing
// here should look like a real employer's data. Phone numbers match the demo
// numbers already used by the other APIIQ databases so the same handset can
// drive a screen pop against Public Works, ITSM or Workday.
//
// Three tables, because an HR service desk call is not answered from the worker
// record alone: the agent needs the pending time off and the open cases too.
//   wd_workers   — the worker profile (what Workday calls a Worker)
//   wd_time_off  — absence requests
//   wd_hr_cases  — HR help desk cases
function seedWorkday() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wd_workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id TEXT UNIQUE NOT NULL,
      employee_id TEXT,
      legal_first_name TEXT NOT NULL,
      legal_last_name TEXT NOT NULL,
      preferred_name TEXT,
      work_email TEXT,
      mobile_phone TEXT,
      work_phone TEXT,
      business_title TEXT,
      job_profile TEXT,
      job_family TEXT,
      management_level TEXT,
      supervisory_org TEXT,
      cost_center TEXT,
      department TEXT,
      location TEXT,
      time_type TEXT CHECK(time_type IN ('Full time','Part time')),
      worker_type TEXT CHECK(worker_type IN ('Employee','Contingent Worker')),
      manager_name TEXT,
      manager_worker_id TEXT,
      hire_date TEXT,
      length_of_service TEXT,
      employment_status TEXT CHECK(employment_status IN ('Active','On Leave','Terminated')),
      compensation_grade TEXT,
      pay_rate_type TEXT CHECK(pay_rate_type IN ('Salaried','Hourly')),
      pay_group TEXT,
      pto_balance_hours REAL DEFAULT 0,
      sick_balance_hours REAL DEFAULT 0,
      pto_taken_ytd REAL DEFAULT 0,
      benefits_plan TEXT,
      retirement_enrolled TEXT CHECK(retirement_enrolled IN ('Yes','No')) DEFAULT 'No',
      last_review_rating TEXT,
      next_review_date TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS wd_time_off (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT UNIQUE NOT NULL,
      worker_id TEXT NOT NULL,
      absence_type TEXT CHECK(absence_type IN ('PTO','Sick','Bereavement','Jury Duty','Parental Leave','Unpaid')),
      start_date TEXT,
      end_date TEXT,
      hours REAL,
      status TEXT CHECK(status IN ('Submitted','Approved','Denied','Cancelled')),
      submitted_date TEXT,
      approved_by TEXT,
      comment TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS wd_hr_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_number TEXT UNIQUE NOT NULL,
      worker_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT CHECK(category IN ('Benefits','Payroll','Time Off','Personal Info','Job Change','Onboarding','Policy','Other')),
      status TEXT CHECK(status IN ('New','In Progress','Pending Employee','Resolved','Closed')),
      priority TEXT CHECK(priority IN ('High','Medium','Low')),
      opened_date TEXT,
      updated_date TEXT,
      assigned_to TEXT,
      resolution TEXT
    );
  `);

  const workers = [
    // ── Demo records: these three phone numbers drive the screen pop ──────────
    { worker_id: '100041', employee_id: 'E100041', legal_first_name: 'Jason',    legal_last_name: 'Mobley',   preferred_name: 'Jason',  work_email: 'jason.mobley@vantageind.com',    mobile_phone: '850-217-6664', work_phone: '757-555-2041', business_title: 'Senior Solutions Architect',   job_profile: 'Solutions Architect III',  job_family: 'Technology',      management_level: 'Individual Contributor', supervisory_org: 'Enterprise Architecture', cost_center: 'CC-4400 Technology', department: 'Information Technology', location: 'Pensacola, FL',    time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Dana Whitfield',  manager_worker_id: '100008', hire_date: '2019-03-18', length_of_service: '7 years 8 months', employment_status: 'Active',   compensation_grade: 'T4',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 96.5, sick_balance_hours: 48.0, pto_taken_ytd: 63.5, benefits_plan: 'PPO Family + Dental + Vision', retirement_enrolled: 'Yes', last_review_rating: 'Exceeds Expectations', next_review_date: '2027-02-15', emergency_contact_name: 'Rachel Mobley',  emergency_contact_phone: '850-217-6612' },
    { worker_id: '100042', employee_id: 'E100042', legal_first_name: 'Mason',    legal_last_name: 'Morris',   preferred_name: 'Mason',  work_email: 'mason.morris@vantageind.com',    mobile_phone: '850-655-3044', work_phone: '757-555-2042', business_title: 'Regional Sales Manager',      job_profile: 'Sales Manager II',         job_family: 'Sales',           management_level: 'Manager',                supervisory_org: 'Southeast Sales',        cost_center: 'CC-2100 Sales',      department: 'Sales',                  location: 'Atlanta, GA',      time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Priya Raghavan',  manager_worker_id: '100005', hire_date: '2022-07-11', length_of_service: '4 years 4 months', employment_status: 'Active',   compensation_grade: 'S3',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 24.0, sick_balance_hours: 16.0, pto_taken_ytd: 112.0, benefits_plan: 'HDHP + HSA',                   retirement_enrolled: 'Yes', last_review_rating: 'Meets Expectations',   next_review_date: '2027-01-20', emergency_contact_name: 'Lauren Morris',  emergency_contact_phone: '850-655-3011' },
    { worker_id: '100043', employee_id: 'E100043', legal_first_name: 'Todd',     legal_last_name: 'Anderson', preferred_name: 'Todd',   work_email: 'todd.anderson@vantageind.com',   mobile_phone: '703-728-2157', work_phone: '757-555-2043', business_title: 'Warehouse Operations Lead',   job_profile: 'Operations Lead I',        job_family: 'Operations',      management_level: 'Team Lead',              supervisory_org: 'Distribution Center 2',  cost_center: 'CC-3300 Operations', department: 'Operations',             location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Carlos Benitez',  manager_worker_id: '100011', hire_date: '2024-09-30', length_of_service: '2 years 1 month',  employment_status: 'On Leave', compensation_grade: 'O2',  pay_rate_type: 'Hourly',   pay_group: 'US Biweekly',     pto_balance_hours: 8.0,  sick_balance_hours: 0.0,  pto_taken_ytd: 88.0,  benefits_plan: 'PPO Employee Only',            retirement_enrolled: 'No',  last_review_rating: 'Meets Expectations',   next_review_date: '2027-04-01', emergency_contact_name: 'Gail Anderson',  emergency_contact_phone: '703-728-2100' },

    // ── Leadership and supporting cast ───────────────────────────────────────
    { worker_id: '100001', employee_id: 'E100001', legal_first_name: 'Eleanor',  legal_last_name: 'Vance',    preferred_name: 'Ellie',  work_email: 'eleanor.vance@vantageind.com',   mobile_phone: '757-555-1001', work_phone: '757-555-2001', business_title: 'Chief Executive Officer',     job_profile: 'Executive',                job_family: 'Executive',       management_level: 'Executive',              supervisory_org: 'Office of the CEO',      cost_center: 'CC-1000 Executive',  department: 'Executive',              location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: null,              manager_worker_id: null,     hire_date: '2015-01-05', length_of_service: '11 years 10 months', employment_status: 'Active', compensation_grade: 'E1', pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 180.0, sick_balance_hours: 80.0, pto_taken_ytd: 40.0, benefits_plan: 'Executive PPO + Dental + Vision', retirement_enrolled: 'Yes', last_review_rating: 'Exceeds Expectations', next_review_date: '2027-01-05', emergency_contact_name: 'Martin Vance', emergency_contact_phone: '757-555-1002' },
    { worker_id: '100005', employee_id: 'E100005', legal_first_name: 'Priya',    legal_last_name: 'Raghavan', preferred_name: 'Priya',  work_email: 'priya.raghavan@vantageind.com',  mobile_phone: '757-555-1005', work_phone: '757-555-2005', business_title: 'VP, Global Sales',            job_profile: 'Vice President',           job_family: 'Sales',           management_level: 'Vice President',         supervisory_org: 'Global Sales',           cost_center: 'CC-2100 Sales',      department: 'Sales',                  location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Eleanor Vance',   manager_worker_id: '100001', hire_date: '2017-06-12', length_of_service: '9 years 5 months',  employment_status: 'Active',   compensation_grade: 'E3',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 142.0, sick_balance_hours: 64.0, pto_taken_ytd: 58.0, benefits_plan: 'PPO Family + Dental + Vision', retirement_enrolled: 'Yes', last_review_rating: 'Exceeds Expectations', next_review_date: '2027-03-01', emergency_contact_name: 'Anil Raghavan', emergency_contact_phone: '757-555-1006' },
    { worker_id: '100008', employee_id: 'E100008', legal_first_name: 'Dana',     legal_last_name: 'Whitfield', preferred_name: 'Dana',  work_email: 'dana.whitfield@vantageind.com',  mobile_phone: '757-555-1008', work_phone: '757-555-2008', business_title: 'Director, Enterprise Architecture', job_profile: 'Director',           job_family: 'Technology',      management_level: 'Director',               supervisory_org: 'Enterprise Architecture', cost_center: 'CC-4400 Technology', department: 'Information Technology', location: 'Remote - US',      time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Victor Osei',     manager_worker_id: '100004', hire_date: '2018-11-05', length_of_service: '8 years 0 months',  employment_status: 'Active',   compensation_grade: 'M4',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 118.0, sick_balance_hours: 56.0, pto_taken_ytd: 72.0, benefits_plan: 'PPO Family + Dental',          retirement_enrolled: 'Yes', last_review_rating: 'Exceeds Expectations', next_review_date: '2027-02-01', emergency_contact_name: 'Grace Whitfield', emergency_contact_phone: '757-555-1009' },
    { worker_id: '100004', employee_id: 'E100004', legal_first_name: 'Victor',   legal_last_name: 'Osei',     preferred_name: 'Vic',    work_email: 'victor.osei@vantageind.com',     mobile_phone: '757-555-1004', work_phone: '757-555-2004', business_title: 'Chief Information Officer',   job_profile: 'Executive',                job_family: 'Technology',      management_level: 'Executive',              supervisory_org: 'Information Technology', cost_center: 'CC-4400 Technology', department: 'Information Technology', location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Eleanor Vance',   manager_worker_id: '100001', hire_date: '2016-04-18', length_of_service: '10 years 7 months', employment_status: 'Active',   compensation_grade: 'E2',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 160.0, sick_balance_hours: 72.0, pto_taken_ytd: 48.0, benefits_plan: 'Executive PPO + Dental + Vision', retirement_enrolled: 'Yes', last_review_rating: 'Exceeds Expectations', next_review_date: '2027-01-15', emergency_contact_name: 'Ama Osei', emergency_contact_phone: '757-555-1007' },
    { worker_id: '100011', employee_id: 'E100011', legal_first_name: 'Carlos',   legal_last_name: 'Benitez',  preferred_name: 'Carlos', work_email: 'carlos.benitez@vantageind.com',  mobile_phone: '757-555-1011', work_phone: '757-555-2011', business_title: 'Director, Distribution',      job_profile: 'Director',                 job_family: 'Operations',      management_level: 'Director',               supervisory_org: 'Distribution',           cost_center: 'CC-3300 Operations', department: 'Operations',             location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Eleanor Vance',   manager_worker_id: '100001', hire_date: '2020-02-24', length_of_service: '6 years 9 months',  employment_status: 'Active',   compensation_grade: 'M3',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 88.0,  sick_balance_hours: 40.0, pto_taken_ytd: 96.0, benefits_plan: 'HDHP + HSA + Dental',          retirement_enrolled: 'Yes', last_review_rating: 'Meets Expectations',   next_review_date: '2027-03-10', emergency_contact_name: 'Rosa Benitez', emergency_contact_phone: '757-555-1012' },

    // ── Individual contributors ──────────────────────────────────────────────
    { worker_id: '100014', employee_id: 'E100014', legal_first_name: 'Brianna',  legal_last_name: 'Washington', preferred_name: 'Bri', work_email: 'brianna.washington@vantageind.com', mobile_phone: '757-555-7001', work_phone: '757-555-2014', business_title: 'HR Business Partner',         job_profile: 'HR Business Partner II',   job_family: 'Human Resources', management_level: 'Individual Contributor', supervisory_org: 'People Operations',      cost_center: 'CC-1500 HR',         department: 'Human Resources',        location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Nadia Oyelaran',  manager_worker_id: '100013', hire_date: '2021-05-17', length_of_service: '5 years 6 months',  employment_status: 'Active',   compensation_grade: 'P3',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 72.0,  sick_balance_hours: 32.0, pto_taken_ytd: 80.0, benefits_plan: 'PPO Employee + Spouse',        retirement_enrolled: 'Yes', last_review_rating: 'Exceeds Expectations', next_review_date: '2027-05-01', emergency_contact_name: 'Dwayne Washington', emergency_contact_phone: '757-555-7099' },
    { worker_id: '100013', employee_id: 'E100013', legal_first_name: 'Nadia',    legal_last_name: 'Oyelaran', preferred_name: 'Nadia',  work_email: 'nadia.oyelaran@vantageind.com',  mobile_phone: '757-555-1013', work_phone: '757-555-2013', business_title: 'Chief People Officer',        job_profile: 'Executive',                job_family: 'Human Resources', management_level: 'Executive',              supervisory_org: 'People Operations',      cost_center: 'CC-1500 HR',         department: 'Human Resources',        location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Eleanor Vance',   manager_worker_id: '100001', hire_date: '2018-08-20', length_of_service: '8 years 2 months',  employment_status: 'Active',   compensation_grade: 'E2',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 136.0, sick_balance_hours: 68.0, pto_taken_ytd: 52.0, benefits_plan: 'Executive PPO + Dental + Vision', retirement_enrolled: 'Yes', last_review_rating: 'Exceeds Expectations', next_review_date: '2027-02-20', emergency_contact_name: 'Tunde Oyelaran', emergency_contact_phone: '757-555-1099' },
    { worker_id: '100021', employee_id: 'E100021', legal_first_name: 'Devon',    legal_last_name: 'Mercer',   preferred_name: 'Devon',  work_email: 'devon.mercer@vantageind.com',    mobile_phone: '757-555-7002', work_phone: '757-555-2021', business_title: 'Senior Financial Analyst',    job_profile: 'Financial Analyst III',    job_family: 'Finance',         management_level: 'Individual Contributor', supervisory_org: 'Corporate Finance',      cost_center: 'CC-1200 Finance',    department: 'Finance',                location: 'Remote - US',      time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Harriet Lamb',    manager_worker_id: '100020', hire_date: '2020-10-05', length_of_service: '6 years 1 month',   employment_status: 'Active',   compensation_grade: 'P3',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 104.0, sick_balance_hours: 40.0, pto_taken_ytd: 56.0, benefits_plan: 'HDHP + HSA',                   retirement_enrolled: 'Yes', last_review_rating: 'Meets Expectations',   next_review_date: '2027-04-15', emergency_contact_name: 'Cara Mercer', emergency_contact_phone: '757-555-7098' },
    { worker_id: '100020', employee_id: 'E100020', legal_first_name: 'Harriet',  legal_last_name: 'Lamb',     preferred_name: 'Harriet', work_email: 'harriet.lamb@vantageind.com',   mobile_phone: '757-555-1020', work_phone: '757-555-2020', business_title: 'Controller',                  job_profile: 'Controller',               job_family: 'Finance',         management_level: 'Director',               supervisory_org: 'Corporate Finance',      cost_center: 'CC-1200 Finance',    department: 'Finance',                location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Eleanor Vance',   manager_worker_id: '100001', hire_date: '2019-09-09', length_of_service: '7 years 2 months',  employment_status: 'Active',   compensation_grade: 'M4',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 96.0,  sick_balance_hours: 48.0, pto_taken_ytd: 64.0, benefits_plan: 'PPO Family + Dental',          retirement_enrolled: 'Yes', last_review_rating: 'Exceeds Expectations', next_review_date: '2027-03-20', emergency_contact_name: 'Ian Lamb', emergency_contact_phone: '757-555-1098' },
    { worker_id: '100026', employee_id: 'E100026', legal_first_name: 'Keisha',   legal_last_name: 'Fountain', preferred_name: 'Keisha', work_email: 'keisha.fountain@vantageind.com', mobile_phone: '757-555-7003', work_phone: '757-555-2026', business_title: 'Account Executive',           job_profile: 'Account Executive II',     job_family: 'Sales',           management_level: 'Individual Contributor', supervisory_org: 'Southeast Sales',        cost_center: 'CC-2100 Sales',      department: 'Sales',                  location: 'Charlotte, NC',    time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Mason Morris',    manager_worker_id: '100042', hire_date: '2023-02-13', length_of_service: '3 years 9 months',  employment_status: 'Active',   compensation_grade: 'S2',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 56.0,  sick_balance_hours: 24.0, pto_taken_ytd: 40.0, benefits_plan: 'PPO Employee Only',            retirement_enrolled: 'Yes', last_review_rating: 'Exceeds Expectations', next_review_date: '2027-02-13', emergency_contact_name: 'Marcus Fountain', emergency_contact_phone: '757-555-7097' },
    { worker_id: '100029', employee_id: 'E100029', legal_first_name: 'Priya',    legal_last_name: 'Nair',     preferred_name: 'Priya N.', work_email: 'priya.nair@vantageind.com',   mobile_phone: '757-555-7004', work_phone: '757-555-2029', business_title: 'Staff Software Engineer',     job_profile: 'Software Engineer IV',     job_family: 'Technology',      management_level: 'Individual Contributor', supervisory_org: 'Platform Engineering',   cost_center: 'CC-4400 Technology', department: 'Information Technology', location: 'Remote - US',      time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Dana Whitfield',  manager_worker_id: '100008', hire_date: '2021-01-11', length_of_service: '5 years 10 months', employment_status: 'Active',   compensation_grade: 'T5',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 128.0, sick_balance_hours: 56.0, pto_taken_ytd: 32.0, benefits_plan: 'PPO Family + Dental + Vision', retirement_enrolled: 'Yes', last_review_rating: 'Exceeds Expectations', next_review_date: '2027-01-11', emergency_contact_name: 'Sanjay Nair', emergency_contact_phone: '757-555-7096' },
    { worker_id: '100031', employee_id: 'E100031', legal_first_name: 'Michael',  legal_last_name: 'Ruiz',     preferred_name: 'Mike',   work_email: 'michael.ruiz@vantageind.com',    mobile_phone: '757-555-7005', work_phone: '757-555-2031', business_title: 'Payroll Specialist',          job_profile: 'Payroll Specialist II',    job_family: 'Human Resources', management_level: 'Individual Contributor', supervisory_org: 'People Operations',      cost_center: 'CC-1500 HR',         department: 'Human Resources',        location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Nadia Oyelaran',  manager_worker_id: '100013', hire_date: '2022-11-28', length_of_service: '3 years 11 months', employment_status: 'Active',   compensation_grade: 'P2',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 64.0,  sick_balance_hours: 32.0, pto_taken_ytd: 48.0, benefits_plan: 'HDHP + HSA',                   retirement_enrolled: 'Yes', last_review_rating: 'Meets Expectations',   next_review_date: '2027-05-28', emergency_contact_name: 'Elena Ruiz', emergency_contact_phone: '757-555-7095' },
    { worker_id: '100034', employee_id: 'E100034', legal_first_name: 'Camille',  legal_last_name: 'Dubois',   preferred_name: 'Cami',   work_email: 'camille.dubois@vantageind.com',  mobile_phone: '757-555-7006', work_phone: '757-555-2034', business_title: 'Facilities Coordinator',      job_profile: 'Facilities Coordinator I', job_family: 'Operations',      management_level: 'Individual Contributor', supervisory_org: 'Corporate Facilities',   cost_center: 'CC-3300 Operations', department: 'Operations',             location: 'Newport News, VA', time_type: 'Part time', worker_type: 'Employee',          manager_name: 'Carlos Benitez',  manager_worker_id: '100011', hire_date: '2025-03-03', length_of_service: '1 year 8 months',   employment_status: 'Active',   compensation_grade: 'O1',  pay_rate_type: 'Hourly',   pay_group: 'US Biweekly',     pto_balance_hours: 32.0,  sick_balance_hours: 16.0, pto_taken_ytd: 24.0, benefits_plan: 'Part Time Medical',            retirement_enrolled: 'No',  last_review_rating: 'Meets Expectations',   next_review_date: '2027-03-03', emergency_contact_name: 'Luc Dubois', emergency_contact_phone: '757-555-7094' },
    { worker_id: '100037', employee_id: 'E100037', legal_first_name: 'Tyler',    legal_last_name: 'Norwood',  preferred_name: 'Ty',     work_email: 'tyler.norwood@vantageind.com',   mobile_phone: '757-555-7007', work_phone: '757-555-2037', business_title: 'Marketing Specialist',        job_profile: 'Marketing Specialist II',  job_family: 'Marketing',       management_level: 'Individual Contributor', supervisory_org: 'Demand Generation',      cost_center: 'CC-2500 Marketing',  department: 'Marketing',              location: 'Remote - US',      time_type: 'Full time', worker_type: 'Contingent Worker', manager_name: 'Priya Raghavan',  manager_worker_id: '100005', hire_date: '2026-06-01', length_of_service: '5 months',          employment_status: 'Active',   compensation_grade: 'C1',  pay_rate_type: 'Hourly',   pay_group: 'Contingent',      pto_balance_hours: 0.0,   sick_balance_hours: 0.0,  pto_taken_ytd: 0.0,  benefits_plan: 'Not Eligible',                 retirement_enrolled: 'No',  last_review_rating: null,                   next_review_date: null,         emergency_contact_name: 'Janet Norwood', emergency_contact_phone: '757-555-7093' },
    { worker_id: '100039', employee_id: 'E100039', legal_first_name: 'Aaliyah',  legal_last_name: 'Stephens', preferred_name: 'Aaliyah', work_email: 'aaliyah.stephens@vantageind.com', mobile_phone: '757-555-7008', work_phone: '757-555-2039', business_title: 'Talent Acquisition Partner',  job_profile: 'Recruiter II',             job_family: 'Human Resources', management_level: 'Individual Contributor', supervisory_org: 'Talent Acquisition',     cost_center: 'CC-1500 HR',         department: 'Human Resources',        location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Nadia Oyelaran',  manager_worker_id: '100013', hire_date: '2026-10-05', length_of_service: '1 month',           employment_status: 'Active',   compensation_grade: 'P2',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 13.3,  sick_balance_hours: 6.7,  pto_taken_ytd: 0.0,  benefits_plan: 'PPO Employee Only',            retirement_enrolled: 'No',  last_review_rating: null,                   next_review_date: '2027-04-05', emergency_contact_name: 'Renee Stephens', emergency_contact_phone: '757-555-7092' },
    { worker_id: '100045', employee_id: 'E100045', legal_first_name: 'Elijah',   legal_last_name: 'Burnett',  preferred_name: 'Eli',    work_email: 'elijah.burnett@vantageind.com',  mobile_phone: '757-555-7010', work_phone: '757-555-2045', business_title: 'Customer Support Specialist', job_profile: 'Support Specialist II',    job_family: 'Customer Service', management_level: 'Individual Contributor', supervisory_org: 'Customer Support',      cost_center: 'CC-2800 Service',    department: 'Customer Service',       location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Carlos Benitez',  manager_worker_id: '100011', hire_date: '2023-08-14', length_of_service: '3 years 3 months',  employment_status: 'Active',   compensation_grade: 'O2',  pay_rate_type: 'Hourly',   pay_group: 'US Biweekly',     pto_balance_hours: 48.0,  sick_balance_hours: 24.0, pto_taken_ytd: 56.0, benefits_plan: 'PPO Employee + Children',      retirement_enrolled: 'Yes', last_review_rating: 'Meets Expectations',   next_review_date: '2027-02-14', emergency_contact_name: 'Simone Burnett', emergency_contact_phone: '757-555-7091' },
    { worker_id: '100048', employee_id: 'E100048', legal_first_name: 'Savannah', legal_last_name: 'Brooks',   preferred_name: 'Savannah', work_email: 'savannah.brooks@vantageind.com', mobile_phone: '757-555-7011', work_phone: '757-555-2048', business_title: 'Accounts Payable Clerk',    job_profile: 'AP Clerk I',               job_family: 'Finance',         management_level: 'Individual Contributor', supervisory_org: 'Corporate Finance',      cost_center: 'CC-1200 Finance',    department: 'Finance',                location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Harriet Lamb',    manager_worker_id: '100020', hire_date: '2024-04-22', length_of_service: '2 years 6 months',  employment_status: 'Active',   compensation_grade: 'P1',  pay_rate_type: 'Hourly',   pay_group: 'US Biweekly',     pto_balance_hours: 40.0,  sick_balance_hours: 20.0, pto_taken_ytd: 32.0, benefits_plan: 'HDHP + HSA',                   retirement_enrolled: 'No',  last_review_rating: 'Meets Expectations',   next_review_date: '2027-04-22', emergency_contact_name: 'Dale Brooks', emergency_contact_phone: '757-555-7090' },
    { worker_id: '100052', employee_id: 'E100052', legal_first_name: 'Darius',   legal_last_name: 'Holloway', preferred_name: 'Darius', work_email: 'darius.holloway@vantageind.com', mobile_phone: '757-555-7009', work_phone: '757-555-2052', business_title: 'Network Engineer',            job_profile: 'Network Engineer III',     job_family: 'Technology',      management_level: 'Individual Contributor', supervisory_org: 'Platform Engineering',   cost_center: 'CC-4400 Technology', department: 'Information Technology', location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Dana Whitfield',  manager_worker_id: '100008', hire_date: '2022-01-24', length_of_service: '4 years 9 months',  employment_status: 'Active',   compensation_grade: 'T4',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 80.0,  sick_balance_hours: 40.0, pto_taken_ytd: 72.0, benefits_plan: 'PPO Employee + Spouse',        retirement_enrolled: 'Yes', last_review_rating: 'Meets Expectations',   next_review_date: '2027-01-24', emergency_contact_name: 'Tanya Holloway', emergency_contact_phone: '757-555-7089' },
    { worker_id: '100055', employee_id: 'E100055', legal_first_name: 'Ethan',    legal_last_name: 'Kowalski', preferred_name: 'Ethan',  work_email: 'ethan.kowalski@vantageind.com',  mobile_phone: '757-555-7012', work_phone: '757-555-2055', business_title: 'Chief Financial Officer',     job_profile: 'Executive',                job_family: 'Finance',         management_level: 'Executive',              supervisory_org: 'Office of the CFO',      cost_center: 'CC-1200 Finance',    department: 'Finance',                location: 'Newport News, VA', time_type: 'Full time', worker_type: 'Employee',          manager_name: 'Eleanor Vance',   manager_worker_id: '100001', hire_date: '2017-02-06', length_of_service: '9 years 9 months',  employment_status: 'Active',   compensation_grade: 'E2',  pay_rate_type: 'Salaried', pay_group: 'US Semi-Monthly', pto_balance_hours: 152.0, sick_balance_hours: 72.0, pto_taken_ytd: 44.0, benefits_plan: 'Executive PPO + Dental + Vision', retirement_enrolled: 'Yes', last_review_rating: 'Exceeds Expectations', next_review_date: '2027-02-06', emergency_contact_name: 'Marta Kowalski', emergency_contact_phone: '757-555-7088' },
  ];

  const timeOff = [
    // Jason has one pending and some history — gives the agent something to work with
    { request_id: 'ABS-00101', worker_id: '100041', absence_type: 'PTO',            start_date: '2026-11-24', end_date: '2026-11-28', hours: 40.0, status: 'Submitted', submitted_date: '2026-11-03', approved_by: null,             comment: 'Thanksgiving week' },
    { request_id: 'ABS-00102', worker_id: '100041', absence_type: 'PTO',            start_date: '2026-07-07', end_date: '2026-07-11', hours: 40.0, status: 'Approved',  submitted_date: '2026-06-10', approved_by: 'Dana Whitfield', comment: 'Summer vacation' },
    { request_id: 'ABS-00103', worker_id: '100041', absence_type: 'Sick',           start_date: '2026-09-15', end_date: '2026-09-15', hours: 8.0,  status: 'Approved',  submitted_date: '2026-09-15', approved_by: 'Dana Whitfield', comment: null },
    { request_id: 'ABS-00104', worker_id: '100041', absence_type: 'PTO',            start_date: '2026-04-02', end_date: '2026-04-03', hours: 16.0, status: 'Approved',  submitted_date: '2026-03-20', approved_by: 'Dana Whitfield', comment: null },
    { request_id: 'ABS-00110', worker_id: '100042', absence_type: 'PTO',            start_date: '2026-12-22', end_date: '2026-12-31', hours: 56.0, status: 'Submitted', submitted_date: '2026-11-08', approved_by: null,             comment: 'Holiday break - balance may not cover' },
    { request_id: 'ABS-00111', worker_id: '100042', absence_type: 'PTO',            start_date: '2026-08-04', end_date: '2026-08-15', hours: 80.0, status: 'Approved',  submitted_date: '2026-07-01', approved_by: 'Priya Raghavan', comment: null },
    { request_id: 'ABS-00120', worker_id: '100043', absence_type: 'Parental Leave', start_date: '2026-10-20', end_date: '2027-01-12', hours: 480.0, status: 'Approved', submitted_date: '2026-09-01', approved_by: 'Carlos Benitez', comment: 'FMLA concurrent' },
    { request_id: 'ABS-00130', worker_id: '100026', absence_type: 'PTO',            start_date: '2026-11-17', end_date: '2026-11-18', hours: 16.0, status: 'Approved',  submitted_date: '2026-10-28', approved_by: 'Mason Morris',   comment: null },
    { request_id: 'ABS-00131', worker_id: '100029', absence_type: 'PTO',            start_date: '2026-12-01', end_date: '2026-12-05', hours: 40.0, status: 'Submitted', submitted_date: '2026-11-05', approved_by: null,             comment: null },
    { request_id: 'ABS-00132', worker_id: '100052', absence_type: 'Jury Duty',      start_date: '2026-11-16', end_date: '2026-11-17', hours: 16.0, status: 'Approved',  submitted_date: '2026-10-30', approved_by: 'Dana Whitfield', comment: 'Summons on file' },
    { request_id: 'ABS-00133', worker_id: '100045', absence_type: 'Sick',           start_date: '2026-11-04', end_date: '2026-11-05', hours: 16.0, status: 'Approved',  submitted_date: '2026-11-04', approved_by: 'Carlos Benitez', comment: null },
    { request_id: 'ABS-00134', worker_id: '100048', absence_type: 'PTO',            start_date: '2026-11-27', end_date: '2026-11-27', hours: 8.0,  status: 'Denied',    submitted_date: '2026-11-02', approved_by: 'Harriet Lamb',   comment: 'Month end close coverage required' },
  ];

  const hrCases = [
    { case_number: 'HR-002041', worker_id: '100041', subject: 'Dependent not showing on dental plan after open enrollment', category: 'Benefits',      status: 'In Progress',     priority: 'Medium', opened_date: '2026-11-06', updated_date: '2026-11-09', assigned_to: 'Brianna Washington', resolution: null },
    { case_number: 'HR-002042', worker_id: '100041', subject: 'Direct deposit split between two accounts',                  category: 'Payroll',       status: 'Resolved',        priority: 'Low',    opened_date: '2026-08-12', updated_date: '2026-08-14', assigned_to: 'Michael Ruiz',      resolution: 'Second account added, effective next pay period. Confirmed with employee.' },
    { case_number: 'HR-002043', worker_id: '100042', subject: 'PTO balance appears short after August leave',               category: 'Time Off',      status: 'Pending Employee', priority: 'Medium', opened_date: '2026-11-07', updated_date: '2026-11-08', assigned_to: 'Brianna Washington', resolution: null },
    { case_number: 'HR-002044', worker_id: '100043', subject: 'Parental leave pay schedule question',                       category: 'Benefits',      status: 'In Progress',     priority: 'High',   opened_date: '2026-10-22', updated_date: '2026-11-04', assigned_to: 'Michael Ruiz',      resolution: null },
    { case_number: 'HR-002045', worker_id: '100039', subject: 'New hire I-9 verification follow up',                        category: 'Onboarding',    status: 'New',             priority: 'High',   opened_date: '2026-11-09', updated_date: '2026-11-09', assigned_to: 'Aaliyah Stephens',  resolution: null },
    { case_number: 'HR-002046', worker_id: '100026', subject: 'Update home address after relocation',                       category: 'Personal Info', status: 'Closed',          priority: 'Low',    opened_date: '2026-09-18', updated_date: '2026-09-19', assigned_to: 'Brianna Washington', resolution: 'Address updated in Workday. Payroll tax jurisdiction recalculated.' },
    { case_number: 'HR-002047', worker_id: '100052', subject: 'Tuition reimbursement eligibility',                          category: 'Policy',        status: 'In Progress',     priority: 'Low',    opened_date: '2026-10-30', updated_date: '2026-11-06', assigned_to: 'Brianna Washington', resolution: null },
    { case_number: 'HR-002048', worker_id: '100048', subject: 'Denied time off request - requesting review',                category: 'Time Off',      status: 'New',             priority: 'Medium', opened_date: '2026-11-03', updated_date: '2026-11-03', assigned_to: null,                resolution: null },
    { case_number: 'HR-002049', worker_id: '100029', subject: 'Promotion effective date and comp change',                   category: 'Job Change',    status: 'Resolved',        priority: 'Medium', opened_date: '2026-09-02', updated_date: '2026-09-12', assigned_to: 'Dana Whitfield',    resolution: 'Promotion to Software Engineer IV effective 2026-10-01. Comp change processed.' },
    { case_number: 'HR-002050', worker_id: '100045', subject: 'HSA contribution limit question',                            category: 'Benefits',      status: 'Closed',          priority: 'Low',    opened_date: '2026-07-21', updated_date: '2026-07-22', assigned_to: 'Michael Ruiz',      resolution: 'Explained 2026 IRS family limit. Employee adjusted election.' },
  ];

  const existing = db.prepare('SELECT COUNT(*) as n FROM wd_workers').get();
  if (existing.n > 0) return;

  const insertWorker = db.prepare(`
    INSERT INTO wd_workers
      (worker_id, employee_id, legal_first_name, legal_last_name, preferred_name, work_email,
       mobile_phone, work_phone, business_title, job_profile, job_family, management_level,
       supervisory_org, cost_center, department, location, time_type, worker_type,
       manager_name, manager_worker_id, hire_date, length_of_service, employment_status,
       compensation_grade, pay_rate_type, pay_group, pto_balance_hours, sick_balance_hours,
       pto_taken_ytd, benefits_plan, retirement_enrolled, last_review_rating, next_review_date,
       emergency_contact_name, emergency_contact_phone)
    VALUES
      (@worker_id, @employee_id, @legal_first_name, @legal_last_name, @preferred_name, @work_email,
       @mobile_phone, @work_phone, @business_title, @job_profile, @job_family, @management_level,
       @supervisory_org, @cost_center, @department, @location, @time_type, @worker_type,
       @manager_name, @manager_worker_id, @hire_date, @length_of_service, @employment_status,
       @compensation_grade, @pay_rate_type, @pay_group, @pto_balance_hours, @sick_balance_hours,
       @pto_taken_ytd, @benefits_plan, @retirement_enrolled, @last_review_rating, @next_review_date,
       @emergency_contact_name, @emergency_contact_phone)
  `);

  const insertTimeOff = db.prepare(`
    INSERT INTO wd_time_off
      (request_id, worker_id, absence_type, start_date, end_date, hours, status,
       submitted_date, approved_by, comment)
    VALUES
      (@request_id, @worker_id, @absence_type, @start_date, @end_date, @hours, @status,
       @submitted_date, @approved_by, @comment)
  `);

  const insertCase = db.prepare(`
    INSERT INTO wd_hr_cases
      (case_number, worker_id, subject, category, status, priority,
       opened_date, updated_date, assigned_to, resolution)
    VALUES
      (@case_number, @worker_id, @subject, @category, @status, @priority,
       @opened_date, @updated_date, @assigned_to, @resolution)
  `);

  const seedAll = db.transaction(() => {
    for (const w of workers)  insertWorker.run(w);
    for (const t of timeOff)  insertTimeOff.run(t);
    for (const c of hrCases)  insertCase.run(c);
  });
  seedAll();

  console.log(`[DB] Workday seeded with ${workers.length} workers, ${timeOff.length} absence requests, ${hrCases.length} HR cases`);
}

module.exports = seedWorkday;
