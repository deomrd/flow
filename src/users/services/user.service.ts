import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

type RegisterInput = {
  username: string;
  email: string;
  phone: string;
  password: string;
  pin : string;
  profile?: {
    full_name?: string;
    phone_number?: string;
    address?: string;
    date_of_birth?: string;
  };
};

type LoginInput = {
  identifier: string;
  password: string;
};

type UpdatePasswordInput = {
  oldPassword: string;
  newPassword: string;
};

export const userService = {
  async register(data: RegisterInput) {
    
    try {
      
      const existingUser = await prisma.users.findFirst({
        where: {
          OR: [
            { email: data.email },
            { username: data.username },
            { phone: data.phone }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw new Error("Cet email est déjà utilisé.");
        }
        if (existingUser.username === data.username) {
          throw new Error("Ce nom d'utilisateur est déjà pris.");
        }
        if (existingUser.phone === data.phone) {
          throw new Error("Ce numéro de téléphone est déjà utilisé.");
        }
      }

      if (data.profile?.date_of_birth) {
        const birthDate = new Date(data.profile.date_of_birth);
        const now = new Date();
        const age = now.getFullYear() - birthDate.getFullYear();
        const monthDiff = now.getMonth() - birthDate.getMonth();
        const dayDiff = now.getDate() - birthDate.getDate();

        const isTooYoung = age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));
        if (isTooYoung) {
          throw new Error("L'utilisateur doit avoir au moins 18 ans.");
        }
      }
      

      if (typeof data.pin !== 'string' || data.pin.trim() === '') {
        throw new Error("Le code PIN est requis.");
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const hashedPin = await bcrypt.hash(data.pin, 10);

      const user = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.users.create({
          data: {
            username: data.username,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
            role: 'user', 
            balance: new Prisma.Decimal(0),
            pin: hashedPin,
            is_verified: false,
            is_verified_email: false,
            is_verified_number: false,
            deleted: 'no',       
          },
          select: { id_user: true },
        });

        await tx.userprofiles.create({
          data: {
            user_id: createdUser.id_user,
            full_name: data.profile?.full_name ?? "",
            phone_number: data.profile?.phone_number ?? null,
            address: data.profile?.address ?? null,
            date_of_birth: data.profile?.date_of_birth
              ? new Date(data.profile.date_of_birth)
              : null,
            deleted: 'no',          // Ajouté pour userprofiles, même enum 'no'
          },
        });

        return createdUser;
      });

      return {
        success: true,
        message: 'Utilisateur créé avec succès',
        user: { id: user.id_user },
      };
    } catch (error: any) {
      console.error('Erreur pendant l’inscription :', error);
      throw new Error('Échec de la création de l’utilisateur : ' + error.message);
    }
  },

  async login(data: LoginInput) {
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: data.identifier },
          { username: data.identifier },
          { phone: data.identifier },
        ],
      },
      include : {
        userprofiles : true,
      }
    });

    if (!user) throw new Error('Utilisateur non trouvé');

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new Error('Mot de passe incorrect');

    const token = generateToken({
      id_user: user.id_user,
      email: user.email,
      role: user.role,
      username: user.username,
      phone: user.phone,
      is_verified: user.is_verified,
    });
    const { password, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  },

  async updateProfile(userId: string, data: Partial<Omit<Prisma.userprofilesUpdateInput, "users">>) {
    const profile = await prisma.userprofiles.findFirst({
      where: { user_id: userId, deleted: 'no' },
    });

    if (!profile) throw new Error('Profil utilisateur introuvable');

    return prisma.userprofiles.update({
      where: { id_profile: profile.id_profile },
      data,
    });
  },

  async updatePassword(userId: string, data: UpdatePasswordInput) {
    const user = await prisma.users.findUnique({ where: { id_user: userId } });
    if (!user) throw new Error('Utilisateur non trouvé');

    const valid = await bcrypt.compare(data.oldPassword, user.password);
    if (!valid) throw new Error('Ancien mot de passe incorrect');

    const newHashed = await bcrypt.hash(data.newPassword, 10);

    return prisma.users.update({
      where: { id_user: userId },
      data: { password: newHashed },
    });
  },


  async searchUsers(query: string, excludeUserId: string) {
    if (!query) return [];

    const users = await prisma.users.findMany({
      where: {
        is_verified: true,
        id_user: { not: excludeUserId },
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id_user: true,
        username: true,
        email: true,
        phone: true,
        userprofiles: {
          select: {
            full_name: true,
          },
        },
      },
      take: 10,
    });

    return users.map(user => ({
      id: user.id_user,
      username: user.username,
      email: user.email,
      phone: user.phone,
      userprofiles: user.userprofiles, 
    }));
  },
  
  async getUserBalance(userId: string): Promise<number> {
    const user = await prisma.users.findUnique({
      where: { id_user: userId },
      select: { balance: true },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    return user.balance.toNumber() ?? 0;
  },











};
