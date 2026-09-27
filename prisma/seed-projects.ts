import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo projects...');
  const companies = await prisma.company.findMany();
  if (companies.length === 0) {
    console.log('No companies found.');
    return;
  }

  for (const company of companies) {
    const existingProjects = await prisma.project.count({ where: { companyId: company.id } });
    if (existingProjects > 0) {
      console.log(`Company "${company.name}" already has ${existingProjects} projects.`);
      continue;
    }

    const customers = await prisma.customer.findMany({ where: { companyId: company.id } });
    const vendors = await prisma.vendor.findMany({ where: { companyId: company.id } });

    const cust1 = customers[0]?.id || null;
    const cust2 = customers[1]?.id || customers[0]?.id || null;

    // Define 4 realistic projects for FY 2026-27
    const projectDefs = [
      {
        code: 'PRJ-2026-001',
        name: 'Govt Smart Metering & Grid Infrastructure',
        description: 'Design, supply and integration of IoT smart energy meters for TN Energy Board.',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-11-30'),
        budget: 4500000,
        status: 'ACTIVE',
        customerId: cust1,
      },
      {
        code: 'PRJ-2026-002',
        name: 'CyberCity Commercial Complex Fitout',
        description: 'Turnkey interior electrical, HVAC automation and acoustic fitout for DLF Tower C.',
        startDate: new Date('2026-05-15'),
        endDate: new Date('2026-12-31'),
        budget: 6800000,
        status: 'ACTIVE',
        customerId: cust2,
      },
      {
        code: 'PRJ-2026-003',
        name: 'Enterprise ERP & Cloud Migration Phase 1',
        description: 'Migration of on-premise inventory servers to AWS Mumbai with SAP integration.',
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-06-30'),
        budget: 2400000,
        status: 'COMPLETED',
        customerId: cust1,
      },
      {
        code: 'PRJ-2026-004',
        name: 'Solar Rooftop 500kW Industrial Installation',
        description: 'EPC solar project under PM Surya Ghar Muft Bijli Yojana at Ambattur industrial estate.',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-03-31'),
        budget: 5200000,
        status: 'ACTIVE',
        customerId: cust2,
      },
    ];

    const createdProjects = [];
    for (const def of projectDefs) {
      const p = await prisma.project.create({
        data: {
          companyId: company.id,
          ...def,
        },
      });
      createdProjects.push(p);
      console.log(`Created project ${p.code}: ${p.name} for ${company.name}`);
    }

    // Now link some existing unassigned invoices and bills to these projects
    const invoices = await prisma.invoice.findMany({
      where: { companyId: company.id, projectId: null },
      take: 12,
    });

    for (let idx = 0; idx < invoices.length; idx++) {
      const targetProject = createdProjects[idx % createdProjects.length];
      await prisma.invoice.update({
        where: { id: invoices[idx].id },
        data: { projectId: targetProject.id },
      });
    }

    const bills = await prisma.bill.findMany({
      where: { companyId: company.id, projectId: null },
      take: 16,
    });

    for (let idx = 0; idx < bills.length; idx++) {
      const targetProject = createdProjects[idx % createdProjects.length];
      await prisma.bill.update({
        where: { id: bills[idx].id },
        data: { projectId: targetProject.id },
      });
    }

    console.log(`Linked ${invoices.length} invoices and ${bills.length} bills to projects for ${company.name}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
