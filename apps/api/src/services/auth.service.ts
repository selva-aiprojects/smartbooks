import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../core/config';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

export async function registerUser(email: string, password: string, companyName: string) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
  return await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
        subdomain: email.split('@')[0]
      }
    });

    return await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        companyId: company.id
      }
    });
  });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: user.id, companyId: user.companyId }, 
    config.jwt_secret_key,
    { expiresIn: '1d' }
  );

  return { token, user };
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({ 
    where: { id },
    select: {
      id: true,
      email: true,
      companyId: true,
      company: true
    }
  });
}
