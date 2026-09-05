import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_GST_RATES = [
  { name: 'GST 0% (Nil / Exempt)', rate: 0 },
  { name: 'GST 5%', rate: 5 },
  { name: 'GST 12%', rate: 12 },
  { name: 'GST 18%', rate: 18 },
  { name: 'GST 28%', rate: 28 },
];

const DEFAULT_ITEMS = [
  { sku: 'HW-LAP-1001', name: 'Dell Latitude 5540 Laptop', category: 'Hardware', hsnCode: '84713000', unit: 'Nos', rate: 78500, gstRate: 18, stock: 24, location: 'Head Office Store' },
  { sku: 'HW-MON-1002', name: '27" 4K IPS Monitor', category: 'Hardware', hsnCode: '85285210', unit: 'Nos', rate: 21500, gstRate: 18, stock: 40, location: 'Head Office Store' },
  { sku: 'HW-KBD-1003', name: 'Wireless Ergonomic Keyboard', category: 'Accessories', hsnCode: '84716020', unit: 'Nos', rate: 5200, gstRate: 18, stock: 90, location: 'Head Office Store' },
  { sku: 'NW-RTR-1004', name: 'WiFi 6 Router & Firewall', category: 'Networking', hsnCode: '85176290', unit: 'Nos', rate: 12900, gstRate: 18, stock: 15, location: 'Server Room' },
  { sku: 'FN-CHR-1005', name: 'Ergonomic Office Chair', category: 'Furniture', hsnCode: '94013100', unit: 'Nos', rate: 8450, gstRate: 18, stock: 12, location: 'Head Office Store' },
  { sku: 'CON-PAP-1006', name: 'Multi-use A4 Paper (Ream)', category: 'Consumables', hsnCode: '48025700', unit: 'Ream', rate: 220, gstRate: 5, stock: 500, location: 'Head Office Store' },
  { sku: 'CON-TNR-1007', name: 'Laser Toner Cartridge', category: 'Consumables', hsnCode: '84439990', unit: 'Nos', rate: 1850, gstRate: 12, stock: 30, location: 'Head Office Store' },
];

async function main() {
  const companies = await prisma.company.findMany({
    select: { id: true, name: true, subdomain: true },
  });

  console.log(`Seeding GST rates + inventory for ${companies.length} companies...`);

  for (const company of companies) {
    const existingRates = await prisma.taxRate.count({ where: { companyId: company.id } });
    if (existingRates === 0) {
      await prisma.taxRate.createMany({
        data: DEFAULT_GST_RATES.map((r) => ({ companyId: company.id, name: r.name, rate: r.rate })),
      });
      console.log(`  ✔ Tax rates for ${company.name}`);
    }

    const existingItems = await prisma.item.count({ where: { companyId: company.id } });
    if (existingItems === 0) {
      await prisma.item.createMany({
        data: DEFAULT_ITEMS.map((i) => ({ companyId: company.id, ...i })),
      });
      console.log(`  ✔ Starter inventory for ${company.name}`);
    }
  }

  console.log('\n🎉 GST engine + inventory seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });