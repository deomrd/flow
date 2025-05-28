import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SearchUsersUseCase {
  async execute(query: string, excludeUserId?: number) {
    return prisma.users.findMany({
      where: {
        deleted: 'no',
        id_user: {
          not: excludeUserId,  // Exclusion de l'utilisateur connecté
        },
        OR: [
          {
            username: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            phone: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            userprofiles: {
              some: {
                full_name: {
                  contains: query,
                  mode: 'insensitive',
                },
                deleted: 'no',
              },
            },
          },
        ],
      },
      select: {
        id_user: true,
        username: true,
        email: true,
        phone: true,
        userprofiles: {
          where: { deleted: 'no' },
          select: { full_name: true },
        },
      },
      take: 10,
    });
  }
}
