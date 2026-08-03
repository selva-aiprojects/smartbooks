import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@smartbooks.com';
  const password = 'admin123';
  
  // Check if admin already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const company = await prisma.company.create({
      data: {
        name: 'SmartBooks Demo Corp',
        subdomain: 'demo',
        currency: 'INR'
      }
    });

    const defaultAccounts = [
      { name: 'Cash on Hand', code: '1010', type: 'Asset', balance: 250000 },
      { name: 'Accounts Receivable', code: '1020', type: 'Asset', balance: 85000 },
      { name: 'Accounts Payable', code: '2010', type: 'Liability', balance: 42000 },
      { name: 'Owner Equity', code: '3010', type: 'Equity', balance: 293000 },
      { name: 'Sales Revenue', code: '4010', type: 'Revenue', balance: 350000 },
      { name: 'General Expense', code: '5010', type: 'Expense', balance: 150000 }
    ];

    for (const acc of defaultAccounts) {
      await prisma.account.create({
        data: {
          companyId: company.id,
          name: acc.name,
          code: acc.code,
          type: acc.type,
          balance: acc.balance
        }
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        companyId: company.id
      }
    });

    console.log('Seed created user:', user.email);
  } else {
    // Update currency to INR
    await prisma.company.updateMany({
      where: { subdomain: 'demo' },
      data: { currency: 'INR' }
    });
    console.log('Updated SmartBooks Demo Corp currency to INR.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
