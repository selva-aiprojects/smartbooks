import { prisma } from '../lib/prisma';
import {
  getCompany,
  updateCompany,
  addUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  UpdateCompanyInput,
  AddUserInput,
  UpdateUserInput,
} from './admin.service';

export async function getMyCompany(companyId: string) {
  const company = await getCompany(companyId);
  if (!company) throw new Error('Company not found');
  return company;
}

export async function updateMyCompany(companyId: string, data: UpdateCompanyInput) {
  return updateCompany(companyId, data);
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  lastLogin: true,
  createdAt: true,
};

export async function listMyUsers(companyId: string) {
  return prisma.user.findMany({
    where: { companyId },
    select: userSelect,
    orderBy: { createdAt: 'asc' },
  });
}

async function assertUserInCompany(userId: string, companyId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId, companyId } });
  if (!user) throw new Error('User not found in this company');
  return user;
}

export async function addMyUser(companyId: string, input: AddUserInput) {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new Error('Company not found');
  const count = await prisma.user.count({ where: { companyId } });
  if (count >= (company.seatLimit || 15)) {
    throw new Error(`Seat limit reached (${company.seatLimit}). Upgrade your plan to add more users.`);
  }
  return addUser(companyId, input);
}

export async function updateMyUser(companyId: string, userId: string, data: UpdateUserInput) {
  await assertUserInCompany(userId, companyId);
  return updateUser(userId, data);
}

export async function deleteMyUser(companyId: string, userId: string) {
  await assertUserInCompany(userId, companyId);
  return deleteUser(userId);
}

export async function resetMyUserPassword(companyId: string, userId: string) {
  await assertUserInCompany(userId, companyId);
  return resetUserPassword(userId);
}

const entityCompanySelect = {
  id: true,
  name: true,
  displayName: true,
  subdomain: true,
  entityType: true,
  parentCompanyId: true,
  currency: true,
  gstin: true,
};

export async function getAccessibleEntities(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, companyId: true } });
  if (!user) throw new Error('User not found');

  const home = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: entityCompanySelect,
  });
  if (!home) throw new Error('Company not found');

  const children =
    home.entityType === 'parent'
      ? await prisma.company.findMany({
          where: { parentCompanyId: home.id },
          select: entityCompanySelect,
          orderBy: { name: 'asc' },
        })
      : [];

  return [
    { ...home, isHome: true },
    ...children.map((c) => ({ ...c, isHome: false })),
  ];
}
