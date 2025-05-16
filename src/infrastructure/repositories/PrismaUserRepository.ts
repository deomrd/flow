import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number) {
    return this.prisma.users.findUnique({ where: { id_user: id } });
  }

  async updateBalance(id: number, newBalance: number) {
    return this.prisma.users.update({
      where: { id_user: id },
      data: { balance: newBalance, updated_at: new Date() },
    });
  }
}
