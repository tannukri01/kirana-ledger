import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(name: string, email: string, password: string, shopName?: string) {
  const existing = await prisma.account.findUnique({ where: { email } });
  if (existing) throw new Error('User already exists');

  const hashed = await hashPassword(password);
  return prisma.account.create({
    data: { name, email, password: hashed, shopName },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.account.findUnique({ where: { email } });
}
