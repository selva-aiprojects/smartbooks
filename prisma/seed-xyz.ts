import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function invoiceNumber(prefix: string, year: number, seq: number): string {
  return `${prefix}-${year}-${String(seq).padStart(5, '0')}`;
}

// ─── Company Definitions ────────────────────────────────────────────────────

const COMPANIES = [
  {
    name: 'XYZ Corporation',
    subdomain: 'xyz-corp',
    entityType: 'parent',
    displayName: 'XYZ Corporation – Leather Exports',
    currency: 'INR',
    plan: 'enterprise',
    contactEmail: 'admin@xyzcorp.in',
    contactPhone: '+91-44-28456700',
    adminEmail: 'arjun.kapoor@xyzcorp.in',
    adminName: 'Arjun Kapoor',
  },
  {
    name: 'XYZ Shipment Ltd',
    subdomain: 'xyz-shipment',
    entityType: 'entity',
    displayName: 'XYZ Shipment Ltd – Export Logistics',
    currency: 'INR',
    plan: 'enterprise',
    contactEmail: 'admin@xyzshipment.in',
    contactPhone: '+91-44-28456800',
    adminEmail: 'rahul.nair@xyzshipment.in',
    adminName: 'Rahul Nair',
  },
  {
    name: 'XYZ Warehouses Ltd',
    subdomain: 'xyz-warehouses',
    entityType: 'entity',
    displayName: 'XYZ Warehouses Ltd – Storage & Distribution',
    currency: 'INR',
    plan: 'enterprise',
    contactEmail: 'admin@xyzwarehouses.in',
    contactPhone: '+91-44-28456900',
    adminEmail: 'karthik.subramanian@xyzwarehouses.in',
    adminName: 'Karthik Subramanian',
  },
];

// ─── Users per Company ──────────────────────────────────────────────────────

const USERS_PER_COMPANY: Record<string, { name: string; email: string; role: string }[]> = {
  'xyz-corp': [
    { name: 'Arjun Kapoor', email: 'arjun.kapoor@xyzcorp.in', role: 'Owner' },
    { name: 'Deepa Rajan', email: 'deepa.rajan@xyzcorp.in', role: 'Tenant Admin' },
    { name: 'Vikram Iyer', email: 'vikram.iyer@xyzcorp.in', role: 'Finance Manager' },
    { name: 'Priya Menon', email: 'priya.menon@xyzcorp.in', role: 'Accountant' },
    { name: 'Sanjay Gupta', email: 'sanjay.gupta@xyzcorp.in', role: 'Inventory Manager' },
    { name: 'Lakshmi Devi', email: 'lakshmi.devi@xyzcorp.in', role: 'Finance Manager' },
  ],
  'xyz-shipment': [
    { name: 'Rahul Nair', email: 'rahul.nair@xyzshipment.in', role: 'Owner' },
    { name: 'Meera Krishnan', email: 'meera.krishnan@xyzshipment.in', role: 'Tenant Admin' },
  ],
  'xyz-warehouses': [
    { name: 'Karthik Subramanian', email: 'karthik.subramanian@xyzwarehouses.in', role: 'Owner' },
    { name: 'Lakshmi Prasad', email: 'lakshmi.prasad@xyzwarehouses.in', role: 'Tenant Admin' },
  ],
};

// ─── Chart of Accounts per Company ──────────────────────────────────────────

function getAccountsForCompany(companyType: string) {
  if (companyType === 'parent') {
    return [
      { name: 'Cash on Hand', code: '1010', type: 'Asset', balance: 850000 },
      { name: 'Accounts Receivable', code: '1020', type: 'Asset', balance: 2450000 },
      { name: 'Inventory – Raw Leather', code: '1030', type: 'Asset', balance: 3800000 },
      { name: 'Inventory – Finished Goods', code: '1040', type: 'Asset', balance: 2650000 },
      { name: 'Export Receivables (Foreign)', code: '1050', type: 'Asset', balance: 4200000 },
      { name: 'Accounts Payable', code: '2010', type: 'Liability', balance: 1280000 },
      { name: 'GST Payable', code: '2020', type: 'Liability', balance: 385000 },
      { name: 'Export Duty Payable', code: '2030', type: 'Liability', balance: 220000 },
      { name: 'TDS Payable', code: '2040', type: 'Liability', balance: 145000 },
      { name: 'Owner Equity', code: '3010', type: 'Equity', balance: 5000000 },
      { name: 'Retained Earnings', code: '3020', type: 'Equity', balance: 3200000 },
      { name: 'Sales Revenue – Domestic', code: '4010', type: 'Revenue', balance: 12500000 },
      { name: 'Sales Revenue – Export', code: '4020', type: 'Revenue', balance: 48000000 },
      { name: 'Forex Gain/Loss', code: '4030', type: 'Revenue', balance: 850000 },
      { name: 'General Expense', code: '5010', type: 'Expense', balance: 150000 },
      { name: 'Raw Material Purchases', code: '5020', type: 'Expense', balance: 18500000 },
      { name: 'Freight & Logistics', code: '5030', type: 'Expense', balance: 4200000 },
      { name: 'Customs & Duties', code: '5040', type: 'Expense', balance: 3100000 },
      { name: 'Salaries & Wages', code: '5050', type: 'Expense', balance: 6800000 },
      { name: 'Warehousing Costs', code: '5060', type: 'Expense', balance: 2400000 },
      { name: 'Tanning & Processing', code: '5070', type: 'Expense', balance: 8900000 },
    ];
  }

  if (companyType === 'shipment') {
    return [
      { name: 'Cash on Hand', code: '1010', type: 'Asset', balance: 420000 },
      { name: 'Accounts Receivable', code: '1020', type: 'Asset', balance: 1850000 },
      { name: 'Shipping Equipment', code: '1030', type: 'Asset', balance: 1800000 },
      { name: 'Advance to Carriers', code: '1040', type: 'Asset', balance: 950000 },
      { name: 'Accounts Payable', code: '2010', type: 'Liability', balance: 780000 },
      { name: 'GST Payable', code: '2020', type: 'Liability', balance: 195000 },
      { name: 'Customs Duty Collection', code: '2030', type: 'Liability', balance: 380000 },
      { name: 'Owner Equity', code: '3010', type: 'Equity', balance: 3000000 },
      { name: 'Retained Earnings', code: '3020', type: 'Equity', balance: 1500000 },
      { name: 'Freight Revenue', code: '4010', type: 'Revenue', balance: 8500000 },
      { name: 'Customs Brokerage Income', code: '4020', type: 'Revenue', balance: 3200000 },
      { name: 'Documentation Fees', code: '4030', type: 'Revenue', balance: 1100000 },
      { name: 'General Expense', code: '5010', type: 'Expense', balance: 85000 },
      { name: 'Carrier Payments', code: '5020', type: 'Expense', balance: 4800000 },
      { name: 'Port & Terminal Charges', code: '5030', type: 'Expense', balance: 1900000 },
      { name: 'Insurance – Marine Cargo', code: '5040', type: 'Expense', balance: 780000 },
      { name: 'Staff Salaries', code: '5050', type: 'Expense', balance: 2100000 },
      { name: 'Vehicle Maintenance', code: '5060', type: 'Expense', balance: 650000 },
    ];
  }

  // warehouses
  return [
    { name: 'Cash on Hand', code: '1010', type: 'Asset', balance: 320000 },
    { name: 'Accounts Receivable', code: '1020', type: 'Asset', balance: 1200000 },
    { name: 'Warehouse Equipment', code: '1030', type: 'Asset', balance: 2800000 },
    { name: 'Inventory – Stored Goods', code: '1040', type: 'Asset', balance: 8500000 },
    { name: 'Accounts Payable', code: '2010', type: 'Liability', balance: 620000 },
    { name: 'GST Payable', code: '2020', type: 'Liability', balance: 142000 },
    { name: 'Owner Equity', code: '3010', type: 'Equity', balance: 4000000 },
    { name: 'Retained Earnings', code: '3020', type: 'Equity', balance: 2100000 },
    { name: 'Storage Fee Revenue', code: '4010', type: 'Revenue', balance: 6200000 },
    { name: 'Handling & Packing Income', code: '4020', type: 'Revenue', balance: 2400000 },
    { name: 'Cold Storage Revenue', code: '4030', type: 'Revenue', balance: 1800000 },
    { name: 'General Expense', code: '5010', type: 'Expense', balance: 95000 },
    { name: 'Warehouse Rent & Lease', code: '5020', type: 'Expense', balance: 3600000 },
    { name: 'Electricity & Utilities', code: '5030', type: 'Expense', balance: 1800000 },
    { name: 'Equipment Maintenance', code: '5040', type: 'Expense', balance: 720000 },
    { name: 'Staff Salaries', code: '5050', type: 'Expense', balance: 1900000 },
    { name: 'Insurance – Goods in Storage', code: '5060', type: 'Expense', balance: 540000 },
  ];
}

// ─── Customers (International Leather Buyers) ───────────────────────────────

const CUSTOMERS = [
  { name: 'Gucci Leather Sourcing Italy', email: 'procurement@gucci.it', phone: '+39-02-872941', address: 'Via Tornabuoni 12, Florence, Italy' },
  { name: 'BMW Auto Interiors GmbH', email: 'leather@bmw-interiors.de', phone: '+49-89-3825100', address: 'Petuelring 130, Munich, Germany' },
  { name: 'Burberry Supply Chain UK', email: 'materials@burberry.co.uk', phone: '+44-20-33672000', address: 'Horseferry House, London, UK' },
  { name: 'Asahi Holdings Japan', email: 'leather@asahi-holdings.jp', phone: '+81-6-62815611', address: '2-6-30 Utajima, Nishi-ku, Osaka, Japan' },
  { name: 'Al Futtaim Group UAE', email: 'procurement@alfuttaim.ae', phone: '+971-4-2988000', address: 'PO Box 8168, Dubai, UAE' },
  { name: 'Cole Haan USA', email: 'sourcing@colehaan.com', phone: '+1-212-3664455', address: '10 East 53rd St, New York, USA' },
  { name: 'Coach Inc. Global', email: 'leather.buying@coach.com', phone: '+1-212-5959700', address: '516 West 34th St, New York, USA' },
  { name: 'Tod\'s Group Italy', email: 'supply@todsgroup.com', phone: '+39-071-72031', address: 'Via Filippo Pantanelli 12, Ancona, Italy' },
  { name: 'Samsung C&T Korea', email: 'materials@samsungct.com', phone: '+82-2-22593000', address: '11 Seocho-daero, Seoul, Korea' },
  { name: 'Adidas AG Supply Chain', email: 'leather.procurement@adidas.de', phone: '+49-9132-810', address: 'Adi-Dassler-Straße 1, Herzogenaurach, Germany' },
];

// ─── Vendors (Domestic Leather Suppliers) ───────────────────────────────────

const VENDORS = [
  { name: 'Vellore Tanneries Pvt Ltd', email: 'sales@velloretanneries.in', phone: '+91-4172-232400', address: 'Ambur, Vellore District, Tamil Nadu' },
  { name: 'Chennai Leather Exports', email: 'exports@chennaileather.in', phone: '+91-44-26201200', address: 'Guindy Industrial Estate, Chennai' },
  { name: 'Ambur Premium Leather Co', email: 'orders@amburleather.in', phone: '+91-4171-220150', address: 'Ambur Bypass Road, Vellore, Tamil Nadu' },
  { name: 'Kanpur Crown Leather', email: 'supply@kanpurcrown.in', phone: '+91-512-2345678', address: 'Jajmau Tannery Area, Kanpur, UP' },
  { name: 'East India Chemicals & Leather', email: 'info@eichemleather.in', phone: '+91-44-26534500', address: 'Ennore Industrial Area, Chennai' },
  { name: 'Karan Leather Industries', email: 'sales@karanleather.in', phone: '+91-416-2233444', address: 'Chidambaram, Cuddalore District, Tamil Nadu' },
  { name: 'Safeda Shipping & Logistics', email: 'ops@safedashipping.in', phone: '+91-44-25221100', address: 'Chennai Port Trust Area, Chennai' },
  { name: 'Prakash Tanning Works', email: 'prakash@tanningworks.in', phone: '+91-4172-245678', address: 'Melvisharam, Ranipet District, Tamil Nadu' },
];

// ─── Leather Products for Invoices ──────────────────────────────────────────

const LEATHER_PRODUCTS = [
  'Full Grain Cow Leather – Aniline Dyed',
  'Top Grain Buffalo Leather – Semi-Aniline',
  'Goatskin Nappa Leather – Chrome Tanned',
  'Sheepskin Leather – Vegetable Tanned',
  'Crocodile Embossed Leather Sheets',
  'Suede Leather – Finished Split',
  'Bonded Leather Rolls – Auto Upholstery',
  'PU Synthetic Leather – Furniture Grade',
  'Corrected Grain Leather – Pigmented',
  'Italian Finish Calf Leather',
  'Combination Tanned Lambskin',
  'Pull-Up Leather – Aniline Waxed',
];

const SHIPMENT_SERVICES = [
  'FCL Container Shipping – 20ft',
  'FCL Container Shipping – 40ft',
  'LCL Consolidation Service',
  'Air Freight – Standard',
  'Air Freight – Express',
  'Customs Clearance – Export',
  'Customs Clearance – Import',
  'Bill of Lading Processing',
  'Certificate of Origin Documentation',
  'Marine Cargo Insurance',
];

const WAREHOUSE_SERVICES = [
  'Palletized Storage – Dry Goods',
  'Climate Controlled Storage',
  'Leather Roll Storage – Hanging',
  'Packing & Re-packing Service',
  'Inventory Management Fee',
  'Loading & Unloading Service',
  'Quality Inspection & Grading',
  'Container Stuffing Service',
  'Labeling & Tagging Service',
  'Fumigation & Treatment',
];

// ─── Main Seed Function ─────────────────────────────────────────────────────

async function main() {
  console.log('🏗️  Seeding XYZ Corporation group with 3 years of data...\n');

  const password = await bcrypt.hash('Xyz@2023#Secure', 12);

  // Track all created entities
  const companyRecords: Record<string, any> = {};
  const userRecords: Record<string, any> = {};
  const accountRecords: Record<string, any[]> = {};

  // ── Idempotent cleanup: remove any prior XYZ group data ──────────────────
  console.log('🧹 Cleaning any existing XYZ group data...');
  const existingCompanies = await prisma.company.findMany({
    where: { subdomain: { in: ['xyz-corp', 'xyz-shipment', 'xyz-warehouses'] } },
    select: { id: true },
  });
  for (const { id } of existingCompanies) {
    await prisma.journalEntry.deleteMany({ where: { companyId: id } });
    await prisma.invoice.deleteMany({ where: { companyId: id } });
    await prisma.bill.deleteMany({ where: { companyId: id } });
    await prisma.bankTransaction.deleteMany({ where: { companyId: id } });
    await prisma.customer.deleteMany({ where: { companyId: id } });
    await prisma.vendor.deleteMany({ where: { companyId: id } });
    await prisma.account.deleteMany({ where: { companyId: id } });
    await prisma.role.deleteMany({ where: { companyId: id } });
    await prisma.user.deleteMany({ where: { companyId: id } });
    await prisma.company.delete({ where: { id } });
  }
  if (existingCompanies.length > 0) console.log(`  ✅ Removed ${existingCompanies.length} existing company records`);

  // ── Step 1: Create Companies ────────────────────────────────────────────
  console.log('📦 Creating companies...');

  // Parent first
  const parentData = COMPANIES[0];
  const parentCompany = await prisma.company.create({
    data: {
      name: parentData.name,
      subdomain: parentData.subdomain,
      currency: parentData.currency,
      plan: parentData.plan,
      contactEmail: parentData.contactEmail,
      contactPhone: parentData.contactPhone,
      entityType: 'parent',
      displayName: parentData.displayName,
    },
  });
  companyRecords['xyz-corp'] = parentCompany;
  console.log(`  ✅ ${parentCompany.name} (${parentCompany.id})`);

  // Entities
  for (const c of COMPANIES.slice(1)) {
    const companyType = c.subdomain === 'xyz-shipment' ? 'shipment' : 'warehouse';
    const entity = await prisma.company.create({
      data: {
        name: c.name,
        subdomain: c.subdomain,
        currency: c.currency,
        plan: c.plan,
        contactEmail: c.contactEmail,
        contactPhone: c.contactPhone,
        entityType: companyType,
        displayName: c.displayName,
        parentCompanyId: parentCompany.id,
      },
    });
    companyRecords[c.subdomain] = entity;
    console.log(`  ✅ ${entity.name} (${entity.id}) — entity of ${parentCompany.name}`);
  }

  // ── Step 2: Create Users ────────────────────────────────────────────────
  console.log('\n👤 Creating users...');

  for (const [subdomain, users] of Object.entries(USERS_PER_COMPANY)) {
    const company = companyRecords[subdomain];
    userRecords[subdomain] = [];
    for (const u of users) {
      const user = await prisma.user.create({
        data: {
          email: u.email,
          password,
          name: u.name,
          role: u.role,
          status: 'Active',
          companyId: company.id,
        },
      });
      userRecords[subdomain].push(user);
      console.log(`  ✅ ${u.name} (${u.email}) @ ${company.name}`);
    }
  }

  // ── Step 3: Create Chart of Accounts ────────────────────────────────────
  console.log('\n📊 Creating Chart of Accounts...');

  const companyTypes: Record<string, string> = {
    'xyz-corp': 'parent',
    'xyz-shipment': 'shipment',
    'xyz-warehouses': 'warehouse',
  };

  for (const [subdomain, type] of Object.entries(companyTypes)) {
    const company = companyRecords[subdomain];
    const accounts = getAccountsForCompany(type);
    accountRecords[subdomain] = [];

    for (const acc of accounts) {
      const account = await prisma.account.create({
        data: {
          companyId: company.id,
          name: acc.name,
          code: acc.code,
          type: acc.type,
          balance: acc.balance,
        },
      });
      accountRecords[subdomain].push(account);
    }
    console.log(`  ✅ ${company.name} — ${accounts.length} accounts created`);
  }

  // ── Step 4: Generate 3 Years of Data (2023-2025) ───────────────────────
  console.log('\n📅 Generating 3 years of financial data (2023-2025)...\n');

  const years = [2023, 2024, 2025];
  const growthFactors: Record<number, number> = { 2023: 1.0, 2024: 1.18, 2025: 1.42 };

  for (const [subdomain, company] of Object.entries(companyRecords)) {
    const companyType = companyTypes[subdomain];
    const adminUser = userRecords[subdomain][0];
    const accounts = accountRecords[subdomain];

    // Account index helpers
    const findAccount = (code: string) => accounts.find((a: any) => a.code === code)!;

    // ── Create Customers & Vendors once per company (bulk) ────────────────
    const customerRecords = await prisma.customer.createMany({
      data: CUSTOMERS.map(c => ({ companyId: company.id, name: c.name, email: c.email, phone: c.phone, address: c.address })),
    });
    console.log(`  👥 ${company.name} — ${customerRecords.count} customers created`);

    const vendorRecords = await prisma.vendor.createMany({
      data: VENDORS.map(v => ({ companyId: company.id, name: v.name, email: v.email, phone: v.phone, address: v.address })),
    });
    console.log(`  🏭 ${company.name} — ${vendorRecords.count} vendors created`);

    // Fetch the created customers/vendors IDs
    const customers = await prisma.customer.findMany({ where: { companyId: company.id }, select: { id: true, name: true } });
    const vendors = await prisma.vendor.findMany({ where: { companyId: company.id }, select: { id: true, name: true } });

    // ── Accumulators for bulk insert ──────────────────────────────────────
    const invoiceData: any[] = [];
    const invoiceItemData: any[] = [];
    const billData: any[] = [];
    const billItemData: any[] = [];
    const bankTxnData: any[] = [];
    const journalData: any[] = [];
    const journalLineData: any[] = [];

    let invoiceSeq = 0;
    let billSeq = 0;

    for (const year of years) {
      const gf = growthFactors[year];

      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();

        // ── Journal Entries (4-6 per month) ──────────────────────────────
        const journalCount = randomInt(4, 6);
        for (let je = 0; je < journalCount; je++) {
          const day = randomInt(1, daysInMonth);
          const entryDate = new Date(year, month - 1, day);
          const entryId = uuid();

          let description = '';
          let debitCode = '';
          let creditCode = '';
          let amount = 0;

          if (companyType === 'parent') {
            const txnType = randomInt(1, 6);
            switch (txnType) {
              case 1: // Leather purchase
                description = `Purchase – ${pick(LEATHER_PRODUCTS)} from ${pick(VENDORS).name}`;
                debitCode = '1030'; creditCode = '2010';
                amount = randomBetween(180000 * gf, 520000 * gf);
                break;
              case 2: // Export sale
                description = `Export Invoice – ${pick(LEATHER_PRODUCTS)} to ${pick(CUSTOMERS).name}`;
                debitCode = '1050'; creditCode = '4020';
                amount = randomBetween(350000 * gf, 980000 * gf);
                break;
              case 3: // Domestic sale
                description = `Domestic Sale – ${pick(LEATHER_PRODUCTS)} to local dealer`;
                debitCode = '1020'; creditCode = '4010';
                amount = randomBetween(120000 * gf, 280000 * gf);
                break;
              case 4: // Freight
                description = `Freight charges – Shipment to ${pick(['Rotterdam', 'Hamburg', 'Felixstowe', 'Yokohama', 'Dubai', 'New York', 'Busan'])}`;
                debitCode = '5030'; creditCode = '1010';
                amount = randomBetween(45000 * gf, 180000 * gf);
                break;
              case 5: // Customs duty
                description = `Export duty & port charges – ${pick(['Chennai Port', 'Ennore Port', 'Kamarajar Port'])}`;
                debitCode = '5040'; creditCode = '2030';
                amount = randomBetween(35000 * gf, 95000 * gf);
                break;
              case 6: // Salary
                description = `Monthly salaries & wages – ${year}-${String(month).padStart(2, '0')}`;
                debitCode = '5050'; creditCode = '1010';
                amount = randomBetween(420000 * gf, 680000 * gf);
                break;
            }
          } else if (companyType === 'shipment') {
            const txnType = randomInt(1, 4);
            switch (txnType) {
              case 1:
                description = `Freight service – ${pick(['FCL 20ft', 'FCL 40ft', 'LCL', 'Air Freight'])} to ${pick(['Rotterdam', 'Hamburg', 'Felixstowe', 'Yokohama', 'Dubai', 'New York'])}`;
                debitCode = '1020'; creditCode = '4010';
                amount = randomBetween(85000 * gf, 280000 * gf);
                break;
              case 2:
                description = `Customs brokerage – ${pick(CUSTOMERS).name} shipment clearance`;
                debitCode = '1020'; creditCode = '4020';
                amount = randomBetween(35000 * gf, 95000 * gf);
                break;
              case 3:
                description = `Carrier payment – ${pick(['Maersk Line', 'MSC Mediterranean', 'CMA CGM', 'Evergreen Marine', 'Hapag-Lloyd'])}`;
                debitCode = '5020'; creditCode = '1010';
                amount = randomBetween(120000 * gf, 350000 * gf);
                break;
              case 4:
                description = `Port charges – ${pick(['Chennai Port', 'Ennore Port', 'Kamarajar Port'])}`;
                debitCode = '5030'; creditCode = '1010';
                amount = randomBetween(45000 * gf, 120000 * gf);
                break;
            }
          } else {
            // warehouse
            const txnType = randomInt(1, 4);
            switch (txnType) {
              case 1:
                description = `Storage fees – ${pick(CUSTOMERS).name} – leather consignment`;
                debitCode = '1020'; creditCode = '4010';
                amount = randomBetween(65000 * gf, 220000 * gf);
                break;
              case 2:
                description = `Handling & packing – ${pick(LEATHER_PRODUCTS)} consignment`;
                debitCode = '1020'; creditCode = '4020';
                amount = randomBetween(25000 * gf, 75000 * gf);
                break;
              case 3:
                description = `Warehouse rent & maintenance – ${year}-${String(month).padStart(2, '0')}`;
                debitCode = '5020'; creditCode = '1010';
                amount = randomBetween(180000 * gf, 320000 * gf);
                break;
              case 4:
                description = `Electricity & utilities – ${year}-${String(month).padStart(2, '0')}`;
                debitCode = '5030'; creditCode = '1010';
                amount = randomBetween(85000 * gf, 165000 * gf);
                break;
            }
          }

          const debitAccount = findAccount(debitCode);
          const creditAccount = findAccount(creditCode);

          if (!debitAccount || !creditAccount) continue;

          journalData.push({
            id: entryId,
            companyId: company.id,
            date: entryDate,
            description,
            status: 'Posted',
            createdById: adminUser.id,
          });
          journalLineData.push(
            { entryId, accountId: debitAccount.id, amount, type: 'Debit', description },
            { entryId, accountId: creditAccount.id, amount, type: 'Credit', description }
          );
        }

        // ── Invoices (3-5 per month for parent, 1-3 for entities) ─────────
        const invoiceCount = companyType === 'parent' ? randomInt(3, 5) : randomInt(1, 3);
        for (let inv = 0; inv < invoiceCount; inv++) {
          invoiceSeq++;
          const day = randomInt(1, Math.min(25, daysInMonth));
          const issueDate = new Date(year, month - 1, day);
          const dueDate = new Date(year, month + 2, day);
          const customer = pick(customers);
          const product = pick(LEATHER_PRODUCTS);
          const qty = companyType === 'parent' ? randomInt(20, 150) : randomInt(5, 30);
          const unitPrice = companyType === 'parent'
            ? randomBetween(3500, 12000) * gf
            : randomBetween(800, 3500) * gf;
          const totalAmount = qty * unitPrice;
          const status = pick(['Paid', 'Paid', 'Paid', 'Sent', 'Overdue']);

          let prefix = 'XYZ';
          if (subdomain === 'xyz-shipment') prefix = 'XYS';
          if (subdomain === 'xyz-warehouses') prefix = 'XYW';

          let serviceDesc = product;
          if (subdomain === 'xyz-shipment') serviceDesc = pick(SHIPMENT_SERVICES);
          if (subdomain === 'xyz-warehouses') serviceDesc = pick(WAREHOUSE_SERVICES);

          const invId = uuid();
          invoiceData.push({
            id: invId,
            companyId: company.id,
            customerId: customer.id,
            number: invoiceNumber(prefix, year, invoiceSeq),
            issueDate,
            dueDate,
            status,
            totalAmount,
          });
          invoiceItemData.push({
            invoiceId: invId,
            description: serviceDesc,
            quantity: qty,
            unitPrice,
            amount: totalAmount,
          });
        }

        // ── Bills (4-6 per month for parent, 2-4 for entities) ───────────
        const billCount = companyType === 'parent' ? randomInt(4, 6) : randomInt(2, 4);
        for (let b = 0; b < billCount; b++) {
          billSeq++;
          const day = randomInt(1, Math.min(20, daysInMonth));
          const billDate = new Date(year, month - 1, day);
          const dueDate = new Date(year, month + 1, day);
          const vendor = pick(vendors);
          const product = pick(LEATHER_PRODUCTS);
          const qty = companyType === 'parent' ? randomInt(50, 200) : randomInt(10, 50);
          const unitPrice = companyType === 'parent'
            ? randomBetween(1200, 4500) * gf
            : randomBetween(400, 1800) * gf;
          const totalAmount = qty * unitPrice;
          const status = pick(['Paid', 'Paid', 'Unpaid', 'Paid', 'Overdue']);
          const category = companyType === 'parent' ? 'Raw Material' : pick(['Logistics', 'Utilities', 'Maintenance', 'Insurance']);

          let prefix = 'XYB';
          if (subdomain === 'xyz-shipment') prefix = 'XYSB';
          if (subdomain === 'xyz-warehouses') prefix = 'XYWB';

          let billDesc = `${pick(LEATHER_PRODUCTS)} – procurement`;
          if (subdomain === 'xyz-shipment') billDesc = pick(SHIPMENT_SERVICES);
          if (subdomain === 'xyz-warehouses') billDesc = pick(WAREHOUSE_SERVICES);

          const billId = uuid();
          billData.push({
            id: billId,
            companyId: company.id,
            vendorId: vendor.id,
            number: invoiceNumber(prefix, year, billSeq),
            billDate,
            dueDate,
            status,
            totalAmount,
          });
          billItemData.push({
            billId,
            description: billDesc,
            quantity: qty,
            unitPrice,
            amount: totalAmount,
            category,
          });
        }

        // ── Bank Transactions (8-12 per month) ───────────────────────────
        const txnCount = randomInt(8, 12);
        for (let t = 0; t < txnCount; t++) {
          const day = randomInt(1, daysInMonth);
          const txnDate = new Date(year, month - 1, day);
          const isCredit = Math.random() > 0.45;
          const amount = randomBetween(50000 * gf, 450000 * gf);

          let description = '';
          if (companyType === 'parent') {
            description = isCredit
              ? `Export payment received – ${pick(CUSTOMERS).name}`
              : `Payment to ${pick(VENDORS).name} – ${pick(LEATHER_PRODUCTS)}`;
          } else if (companyType === 'shipment') {
            description = isCredit
              ? `Freight payment – ${pick(CUSTOMERS).name}`
              : `Carrier settlement – ${pick(['Maersk', 'MSC', 'CMA CGM', 'Evergreen', 'Hapag-Lloyd'])}`;
          } else {
            description = isCredit
              ? `Storage fee received – ${pick(CUSTOMERS).name}`
              : `Utility / rent payment – ${pick(['TNEB Electricity', 'Warehouse Lease', 'Insurance Premium'])}`;
          }

          const extId = `TXN-${subdomain.toUpperCase()}-${year}${String(month).padStart(2, '0')}-${String(t).padStart(3, '0')}`;

          bankTxnData.push({
            companyId: company.id,
            date: txnDate,
            description,
            amount,
            type: isCredit ? 'Credit' : 'Debit',
            matched: Math.random() > 0.3,
            externalId: extId,
          });
        }
      }
    }

    // ── Bulk insert accumulated data (createMany = 1 round-trip each) ─────
    await prisma.bankTransaction.createMany({ data: bankTxnData });
    console.log(`  💳 ${company.name} — ${bankTxnData.length} bank transactions`);

    await prisma.invoice.createMany({ data: invoiceData });
    await prisma.invoiceItem.createMany({ data: invoiceItemData });
    console.log(`  🧾 ${company.name} — ${invoiceData.length} invoices`);

    await prisma.bill.createMany({ data: billData });
    await prisma.billItem.createMany({ data: billItemData });
    console.log(`  🧾 ${company.name} — ${billData.length} bills`);

    await prisma.journalEntry.createMany({ data: journalData });
    await prisma.journalLine.createMany({ data: journalLineData });
    console.log(`  📒 ${company.name} — ${journalData.length} journal entries`);
  }

  console.log('\n🎉 XYZ Corporation seed completed successfully!');
  console.log(`   Parent: ${parentCompany.name} (${parentCompany.id})`);
  for (const c of COMPANIES.slice(1)) {
    console.log(`   Entity: ${c.name} (${companyRecords[c.subdomain].id})`);
  }
  console.log(`\n   Admin login: arjun.kapoor@xyzcorp.in / Xyz@2023#Secure`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
