// src/infrastructure/repositories/userRepository.ts
import { PrismaClient } from '@prisma/client';
import { User } from '../../domain/entities/user';

const prisma = new PrismaClient();

export class PrismaUserRepository {
    async findByIdentifier(identifier: string) {
      return await prisma.users.findFirst({
        where: {
          OR: [
            { email: identifier },
            { phone: identifier },
            { username: identifier }
          ],
          deleted: "no"
        },
        include: {
          userprofiles: true,
          userverifications: true,
          transactions: true,
          notifications: true,
          virtual_cards: {
            include: {
              card_orders: true
            }
          },
          card_orders: true
        }
      });
    }


    async findExistingUser(username: string, email: string, phone: string): Promise<User | null> {
        return prisma.users.findFirst({
            where: { OR: [{ username }, { email }, { phone }] },
            include: { userprofiles: true }
        });
    }

    async create(userData: {
        username: string;
        email: string;
        phone: string;
        password: string;
    }): Promise<User> {
        return prisma.users.create({
            data: {
                username: userData.username,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                role: 'user',
                balance: 0,
                is_verified: false,
                userprofiles: {
                    create: {
                        phone_number: userData.phone,
                        full_name: userData.fullName
                    }
                }
            },
            include: { userprofiles: true }
        });
    }

    async findById(id: number): Promise<User | null> {
        return prisma.users.findUnique({
            where: { id_user: id },
            include: { userprofiles: true }
        });
    }

    async saveRefreshToken(userId: number, token: string): Promise<void> {
        await prisma.users.update({
            where: { id_user: userId },
            data: { refresh_token: token }
        });
    }
}