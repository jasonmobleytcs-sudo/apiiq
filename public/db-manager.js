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
      { key: 'pickup_day',     label: 'Pickup Day',   sortable: true  },
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
      { key: 'pickup_day',        label: 'Pickup Day',         type: 'select', required: false, options: ['','Monday','Tuesday','Wednesday','Thursday','Friday'] },
      { key: 'balance',           label: 'Balance ($)',        type: 'number', required: false, hint: '0.00' },
      { key: 'last_inspection',   label: 'Last Inspection',    type: 'text',   required: false, hint: 'MM/DD/YYYY' },
      { key: 'inspection_result', label: 'Inspection Result',  type: 'select', required: false, options: ['','Pass','Fail'] },
    ]
  }
  ,
  {
    id: 'highered',
    name: 'Higher Education',
    icon: '🎓',
    description: 'Newport News University student records — enrollment, academics, financial aid, and balances.',
    color: '#7c3aed',
    api: {
      list:   { method: 'GET',    path: '/api/highered/students' },
      create: { method: 'POST',   path: '/api/highered/students' },
      update: { method: 'PUT',    path: '/api/highered/student/:student_id' },
      delete: { method: 'DELETE', path: '/api/highered/student/:student_id' },
      idField: 'student_id'
    },
    columns: [
      { key: 'student_id',         label: 'Student ID',      sortable: true,  type: 'mono' },
      { key: 'first_name',         label: 'First Name',      sortable: true  },
      { key: 'last_name',          label: 'Last Name',       sortable: true  },
      { key: 'major',              label: 'Major',           sortable: true  },
      { key: 'enrollment_status',  label: 'Status',          sortable: true,  format: 'badge' },
      { key: 'gpa',                label: 'GPA',             sortable: true  },
      { key: 'balance',            label: 'Balance',         sortable: true,  format: 'currency' },
      { key: 'housing',            label: 'Housing',         sortable: true  },
      { key: 'financial_aid_status', label: 'Financial Aid', sortable: true  },
    ],
    fields: [
      { key: 'student_id',         label: 'Student ID',          type: 'text',   required: true,  readonlyOnEdit: true, hint: 'e.g. NNU-2024-016' },
      { key: 'first_name',         label: 'First Name',          type: 'text',   required: true  },
      { key: 'last_name',          label: 'Last Name',           type: 'text',   required: true  },
      { key: 'pin',                label: 'PIN',                 type: 'text',   required: true,  hint: '4-digit PIN' },
      { key: 'phone',              label: 'Phone',               type: 'text',   required: true,  hint: '757-555-0000' },
      { key: 'email',              label: 'Email',               type: 'email',  required: false, fullWidth: true },
      { key: 'address',            label: 'Address',             type: 'text',   required: false, fullWidth: true },
      { key: 'date_of_birth',      label: 'Date of Birth',       type: 'text',   required: false, hint: 'YYYY-MM-DD' },
      { key: 'major',              label: 'Major',               type: 'text',   required: false },
      { key: 'enrollment_status',  label: 'Enrollment Status',   type: 'select', required: false, options: ['Active','Inactive','Graduated','Suspended'] },
      { key: 'gpa',                label: 'GPA',                 type: 'number', required: false, hint: '0.00–4.00' },
      { key: 'credits_completed',  label: 'Credits Completed',   type: 'number', required: false },
      { key: 'credits_required',   label: 'Credits Required',    type: 'number', required: false, hint: '120' },
      { key: 'expected_graduation',label: 'Expected Graduation', type: 'text',   required: false, hint: 'YYYY-MM' },
      { key: 'advisor',            label: 'Advisor',             type: 'text',   required: false },
      { key: 'housing',            label: 'Housing',             type: 'select', required: false, options: ['','On-Campus','Off-Campus','Commuter'] },
      { key: 'financial_aid_status',label: 'Financial Aid Status',type: 'select',required: false, options: ['Approved','Pending','None'] },
      { key: 'balance',            label: 'Balance ($)',         type: 'number', required: false, hint: '0.00' },
    ]
  },
  {
    id: 'k12',
    name: 'K-12 Schools',
    icon: '🏫',
    description: 'Newport News City Public Schools — student enrollment, attendance, lunch balances, and guardian contacts.',
    color: '#ea580c',
    api: {
      list:   { method: 'GET',    path: '/api/k12/students' },
      create: { method: 'POST',   path: '/api/k12/students' },
      update: { method: 'PUT',    path: '/api/k12/student/:student_id' },
      delete: { method: 'DELETE', path: '/api/k12/student/:student_id' },
      idField: 'student_id'
    },
    columns: [
      { key: 'student_id',        label: 'Student ID',       sortable: true,  type: 'mono' },
      { key: 'first_name',        label: 'First Name',       sortable: true  },
      { key: 'last_name',         label: 'Last Name',        sortable: true  },
      { key: 'grade',             label: 'Grade',            sortable: true  },
      { key: 'school',            label: 'School',           sortable: true  },
      { key: 'guardian_name',     label: 'Guardian',         sortable: true  },
      { key: 'guardian_phone',    label: 'Guardian Phone',   sortable: false },
      { key: 'lunch_balance',     label: 'Lunch Balance',    sortable: true,  format: 'currency' },
      { key: 'attendance_pct',    label: 'Attendance %',     sortable: true  },
      { key: 'enrollment_status', label: 'Status',           sortable: true,  format: 'badge' },
    ],
    fields: [
      { key: 'student_id',        label: 'Student ID',           type: 'text',   required: true,  readonlyOnEdit: true, hint: 'e.g. NNPS-016' },
      { key: 'first_name',        label: 'First Name',           type: 'text',   required: true  },
      { key: 'last_name',         label: 'Last Name',            type: 'text',   required: true  },
      { key: 'pin',               label: 'PIN',                  type: 'text',   required: true,  hint: '4-digit PIN' },
      { key: 'guardian_name',     label: 'Guardian Name',        type: 'text',   required: true  },
      { key: 'guardian_phone',    label: 'Guardian Phone',       type: 'text',   required: true,  hint: '757-555-0000' },
      { key: 'guardian_email',    label: 'Guardian Email',       type: 'email',  required: false },
      { key: 'address',           label: 'Address',              type: 'text',   required: false, fullWidth: true },
      { key: 'date_of_birth',     label: 'Date of Birth',        type: 'text',   required: false, hint: 'YYYY-MM-DD' },
      { key: 'grade',             label: 'Grade',                type: 'text',   required: false, hint: 'K, 1–12' },
      { key: 'school',            label: 'School',               type: 'text',   required: false },
      { key: 'homeroom_teacher',  label: 'Homeroom Teacher',     type: 'text',   required: false },
      { key: 'enrollment_status', label: 'Enrollment Status',    type: 'select', required: false, options: ['Active','Inactive','Transferred','Graduated'] },
      { key: 'gpa',               label: 'GPA',                  type: 'number', required: false, hint: '0.00–4.00' },
      { key: 'attendance_pct',    label: 'Attendance %',         type: 'number', required: false, hint: '85.0–100.0' },
      { key: 'bus_route',         label: 'Bus Route',            type: 'text',   required: false },
      { key: 'lunch_balance',     label: 'Lunch Balance ($)',     type: 'number', required: false, hint: '0.00' },
      { key: 'iep',               label: 'IEP',                  type: 'select', required: false, options: ['No','Yes'] },
    ]
  },
  {
    id: 'legal',
    name: 'Legal Services',
    icon: '⚖️',
    description: 'Coastal Virginia Legal Group case management — clients, attorneys, hearings, and billing.',
    color: '#0f766e',
    api: {
      list:   { method: 'GET',    path: '/api/legal/cases' },
      create: { method: 'POST',   path: '/api/legal/cases' },
      update: { method: 'PUT',    path: '/api/legal/case/:case_number' },
      delete: { method: 'DELETE', path: '/api/legal/case/:case_number' },
      idField: 'case_number'
    },
    columns: [
      { key: 'case_number',       label: 'Case #',           sortable: true,  type: 'mono' },
      { key: 'client_name',       label: 'Client',           sortable: true  },
      { key: 'client_phone',      label: 'Phone',            sortable: false },
      { key: 'case_type',         label: 'Type',             sortable: true  },
      { key: 'case_status',       label: 'Status',           sortable: true,  format: 'badge' },
      { key: 'attorney',          label: 'Attorney',         sortable: true  },
      { key: 'next_hearing_date', label: 'Next Hearing',     sortable: true  },
      { key: 'balance_due',       label: 'Balance Due',      sortable: true,  format: 'currency' },
    ],
    fields: [
      { key: 'case_number',       label: 'Case Number',         type: 'text',   required: true,  readonlyOnEdit: true, hint: 'e.g. CVL-2024-016' },
      { key: 'client_name',       label: 'Client Name',         type: 'text',   required: true  },
      { key: 'pin',               label: 'PIN',                 type: 'text',   required: true,  hint: '4-digit PIN' },
      { key: 'client_phone',      label: 'Client Phone',        type: 'text',   required: true,  hint: '757-555-0000' },
      { key: 'client_email',      label: 'Client Email',        type: 'email',  required: false },
      { key: 'client_address',    label: 'Client Address',      type: 'text',   required: false, fullWidth: true },
      { key: 'case_type',         label: 'Case Type',           type: 'select', required: false, options: ['Civil','Criminal','Family','Corporate','Immigration','Estate','Real Estate'] },
      { key: 'case_status',       label: 'Case Status',         type: 'select', required: false, options: ['Open','In Progress','Pending','Closed','Appealed','On Hold'] },
      { key: 'attorney',          label: 'Attorney',            type: 'text',   required: false },
      { key: 'opposing_party',    label: 'Opposing Party',      type: 'text',   required: false },
      { key: 'court',             label: 'Court',               type: 'text',   required: false },
      { key: 'filed_date',        label: 'Filed Date',          type: 'text',   required: false, hint: 'YYYY-MM-DD' },
      { key: 'next_hearing_date', label: 'Next Hearing Date',   type: 'text',   required: false, hint: 'YYYY-MM-DD' },
      { key: 'docket_number',     label: 'Docket Number',       type: 'text',   required: false },
      { key: 'retainer_amount',   label: 'Retainer Amount ($)', type: 'number', required: false, hint: '0.00' },
      { key: 'balance_due',       label: 'Balance Due ($)',      type: 'number', required: false, hint: '0.00' },
    ]
  },
  {
    id: 'retail',
    name: 'Retail — Hampton Roads Outfitters',
    icon: '🛍️',
    description: 'Hampton Roads Outfitters loyalty program — customers, tiers, points, and purchase history.',
    color: '#db2777',
    api: {
      list:   { method: 'GET',    path: '/api/retail/customers' },
      create: { method: 'POST',   path: '/api/retail/customers' },
      update: { method: 'PUT',    path: '/api/retail/customer/:customer_id' },
      delete: { method: 'DELETE', path: '/api/retail/customer/:customer_id' },
      idField: 'customer_id'
    },
    columns: [
      { key: 'customer_id',        label: 'Customer ID',      sortable: true,  type: 'mono' },
      { key: 'first_name',         label: 'First Name',       sortable: true  },
      { key: 'last_name',          label: 'Last Name',        sortable: true  },
      { key: 'phone',              label: 'Phone',            sortable: false },
      { key: 'loyalty_tier',       label: 'Tier',             sortable: true,  format: 'badge' },
      { key: 'loyalty_points',     label: 'Points',           sortable: true  },
      { key: 'total_spend',        label: 'Total Spend',      sortable: true,  format: 'currency' },
      { key: 'last_purchase_date', label: 'Last Purchase',    sortable: true  },
      { key: 'account_status',     label: 'Status',           sortable: true,  format: 'badge' },
    ],
    fields: [
      { key: 'customer_id',        label: 'Customer ID',          type: 'text',   required: true,  readonlyOnEdit: true, hint: 'e.g. HRO-016' },
      { key: 'first_name',         label: 'First Name',           type: 'text',   required: true  },
      { key: 'last_name',          label: 'Last Name',            type: 'text',   required: true  },
      { key: 'pin',                label: 'PIN',                  type: 'text',   required: true,  hint: '4-digit PIN' },
      { key: 'phone',              label: 'Phone',                type: 'text',   required: true,  hint: '757-555-0000' },
      { key: 'email',              label: 'Email',                type: 'email',  required: false },
      { key: 'address',            label: 'Address',              type: 'text',   required: false, fullWidth: true },
      { key: 'loyalty_tier',       label: 'Loyalty Tier',         type: 'select', required: false, options: ['Bronze','Silver','Gold','Platinum'] },
      { key: 'loyalty_points',     label: 'Loyalty Points',       type: 'number', required: false, hint: '0' },
      { key: 'total_spend',        label: 'Total Spend ($)',       type: 'number', required: false, hint: '0.00' },
      { key: 'last_purchase_date', label: 'Last Purchase Date',   type: 'text',   required: false, hint: 'YYYY-MM-DD' },
      { key: 'last_purchase_amount',label: 'Last Purchase ($)',   type: 'number', required: false, hint: '0.00' },
      { key: 'member_since',       label: 'Member Since',         type: 'text',   required: false, hint: 'YYYY-MM-DD' },
      { key: 'preferred_store',    label: 'Preferred Store',      type: 'select', required: false, options: ['','Newport News','Hampton','Virginia Beach','Chesapeake'] },
      { key: 'account_status',     label: 'Account Status',       type: 'select', required: false, options: ['Active','Suspended','Closed'] },
      { key: 'store_credit',       label: 'Store Credit ($)',      type: 'number', required: false, hint: '0.00' },
    ]
  },
  {
    id: 'itsm',
    name: 'IT Ticketing',
    icon: '🖥️',
    description: 'IT Service Management — helpdesk tickets, hardware/software issues, and resolution tracking.',
    color: '#0369a1',
    api: {
      list:   { method: 'GET',    path: '/api/itsm/tickets' },
      create: { method: 'POST',   path: '/api/itsm/tickets' },
      update: { method: 'PUT',    path: '/api/itsm/ticket/:ticket_number' },
      delete: { method: 'DELETE', path: '/api/itsm/ticket/:ticket_number' },
      idField: 'ticket_number'
    },
    columns: [
      { key: 'ticket_number',   label: 'Ticket #',       sortable: true,  type: 'mono' },
      { key: 'title',           label: 'Title',          sortable: true  },
      { key: 'category',        label: 'Category',       sortable: true  },
      { key: 'priority',        label: 'Priority',       sortable: true,  format: 'badge' },
      { key: 'status',          label: 'Status',         sortable: true,  format: 'badge' },
      { key: 'requester_name',  label: 'Requester',      sortable: true  },
      { key: 'requester_dept',  label: 'Department',     sortable: true  },
      { key: 'assigned_to',     label: 'Assigned To',    sortable: true  },
      { key: 'created_date',    label: 'Created',        sortable: true  },
      { key: 'sla_breach',      label: 'SLA Breach',     sortable: true,  format: 'badge' },
    ],
    fields: [
      { key: 'ticket_number',   label: 'Ticket Number',      type: 'text',   required: true,  readonlyOnEdit: true, hint: 'e.g. TKT-00016' },
      { key: 'title',           label: 'Title',              type: 'text',   required: true,  fullWidth: true },
      { key: 'category',        label: 'Category',           type: 'select', required: false, options: ['Hardware','Software','Network','Access','Security','Email','Other'] },
      { key: 'priority',        label: 'Priority',           type: 'select', required: false, options: ['Critical','High','Medium','Low'] },
      { key: 'status',          label: 'Status',             type: 'select', required: false, options: ['Open','In Progress','Pending','Resolved','Closed'] },
      { key: 'requester_name',  label: 'Requester Name',     type: 'text',   required: true  },
      { key: 'requester_email', label: 'Requester Email',    type: 'email',  required: false },
      { key: 'requester_phone', label: 'Requester Phone',    type: 'text',   required: false, hint: '757-555-0000' },
      { key: 'requester_dept',  label: 'Department',         type: 'text',   required: false },
      { key: 'assigned_to',     label: 'Assigned To',        type: 'text',   required: false },
      { key: 'asset_tag',       label: 'Asset Tag',          type: 'text',   required: false, hint: 'e.g. PC-2847' },
      { key: 'sla_breach',      label: 'SLA Breach',         type: 'select', required: false, options: ['No','Yes'] },
      { key: 'resolution_notes',label: 'Resolution Notes',   type: 'text',   required: false, fullWidth: true },
    ]
  },
  {
    id: 'zoomlly',
    name: 'Zoomlly Jams — Customers',
    icon: '🎵',
    description: 'Music streaming subscribers and concert ticket holders.',
    color: '#7c3aed',
    api: {
      list:    { method: 'GET',    path: '/api/zoomlly/customers' },
      create:  { method: 'POST',   path: '/api/zoomlly/customers' },
      update:  { method: 'PUT',    path: '/api/zoomlly/customer/:customer_id' },
      delete:  { method: 'DELETE', path: '/api/zoomlly/customer/:customer_id' },
      idField: 'customer_id'
    },
    columns: [
      { key: 'customer_id',         label: 'Customer ID',    sortable: true, type: 'mono' },
      { key: 'first_name',          label: 'First Name',     sortable: true },
      { key: 'last_name',           label: 'Last Name',      sortable: true },
      { key: 'phone',               label: 'Phone',          sortable: false },
      { key: 'subscription_plan',   label: 'Plan',           sortable: true },
      { key: 'subscription_status', label: 'Sub Status',     sortable: true, format: 'badge' },
      { key: 'loyalty_tier',        label: 'Loyalty',        sortable: true, format: 'badge' },
      { key: 'loyalty_points',      label: 'Points',         sortable: true },
      { key: 'total_spend',         label: 'Total Spend',    sortable: true, format: 'currency' },
      { key: 'preferred_genre',     label: 'Genre',          sortable: true },
    ],
    fields: [
      { key: 'customer_id',         label: 'Customer ID',        type: 'text',   required: true,  readonlyOnEdit: true },
      { key: 'first_name',          label: 'First Name',         type: 'text',   required: true },
      { key: 'last_name',           label: 'Last Name',          type: 'text',   required: true },
      { key: 'pin',                 label: 'PIN',                type: 'text',   required: true },
      { key: 'phone',               label: 'Phone',              type: 'text',   required: true },
      { key: 'email',               label: 'Email',              type: 'email',  required: false, fullWidth: true },
      { key: 'address',             label: 'Address',            type: 'text',   required: false, fullWidth: true },
      { key: 'subscription_plan',   label: 'Subscription Plan',  type: 'select', required: false, options: ['None','Basic','Premium','Ultimate','Family','Student'] },
      { key: 'subscription_status', label: 'Sub Status',         type: 'select', required: false, options: ['Active','Paused','Cancelled','Expired'] },
      { key: 'loyalty_tier',        label: 'Loyalty Tier',       type: 'select', required: false, options: ['Fan','Superfan','VIP','Platinum'] },
      { key: 'preferred_genre',     label: 'Preferred Genre',    type: 'text',   required: false },
      { key: 'account_status',      label: 'Account Status',     type: 'select', required: false, options: ['Active','Suspended','Closed'] },
    ]
  },
  {
    id: 'zjproducts',
    name: 'Zoomlly Jams — Products',
    icon: '🎸',
    description: 'Concert tickets, streaming plans, merch, and bundles.',
    color: '#b45309',
    api: {
      list:    { method: 'GET',    path: '/api/zoomlly/products' },
      create:  { method: 'POST',   path: '/api/zoomlly/products' },
      update:  { method: 'PUT',    path: '/api/zoomlly/product/:product_id' },
      delete:  { method: 'DELETE', path: '/api/zoomlly/product/:product_id' },
      idField: 'product_id'
    },
    columns: [
      { key: 'product_id',   label: 'Product ID',  sortable: true,  type: 'mono' },
      { key: 'product_name', label: 'Name',         sortable: true },
      { key: 'category',     label: 'Category',     sortable: true,  format: 'badge' },
      { key: 'price',        label: 'Price',        sortable: true,  format: 'currency' },
      { key: 'stock_qty',    label: 'Stock',        sortable: true },
      { key: 'event_name',   label: 'Event',        sortable: false },
      { key: 'event_date',   label: 'Event Date',   sortable: true },
      { key: 'venue',        label: 'Venue',        sortable: false },
      { key: 'is_active',    label: 'Active',       sortable: true },
    ],
    fields: [
      { key: 'product_id',   label: 'Product ID',   type: 'text',   required: true,  readonlyOnEdit: true },
      { key: 'product_name', label: 'Product Name', type: 'text',   required: true,  fullWidth: true },
      { key: 'category',     label: 'Category',     type: 'select', required: true,  options: ['Streaming','Concert Ticket','Merch','Bundle','Gift Card','Vinyl','Digital Download','VIP Package'] },
      { key: 'description',  label: 'Description',  type: 'text',   required: false, fullWidth: true },
      { key: 'price',        label: 'Price',        type: 'number', required: true },
      { key: 'stock_qty',    label: 'Stock Qty',    type: 'number', required: false },
      { key: 'event_name',   label: 'Event Name',   type: 'text',   required: false, fullWidth: true },
      { key: 'venue',        label: 'Venue',        type: 'text',   required: false, fullWidth: true },
      { key: 'event_date',   label: 'Event Date',   type: 'text',   required: false },
      { key: 'sku',          label: 'SKU',          type: 'text',   required: false },
      { key: 'is_active',    label: 'Active (1/0)', type: 'number', required: false },
    ]
  }
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
