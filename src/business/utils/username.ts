import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '');
}

export async function generateUniqueUsername(fullName: string): Promise<string> {
  let baseUsername = normalizeString(fullName);
  let username = baseUsername;
  let counter = 1;

  while (await prisma.businessUser.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}
