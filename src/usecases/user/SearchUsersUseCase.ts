import { PrismaClient } from '@prisma/client';

export class SearchUsersUseCase {
  async execute(query: string) {
    return prisma.users.findMany({
      where: {
        deleted: 'no',
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
