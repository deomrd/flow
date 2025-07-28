import { PrismaClient, BusinessType, BusinessUserRole } from '@prisma/client';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createBusinessService = async (data: any) => {
  const { name, type, email, pointOfSale, user } = data;
  
  const result = await prisma.$transaction(async (prismaTx) => {
    // Vérification unicité email du business
    const existingBusinessByEmail = await prismaTx.business.findUnique({
      where: { email }
    });
    if (existingBusinessByEmail) {
      throw new AppError('Cet email est déjà utilisé pour un autre business', 409);
    }

    // Vérification unicité nom du business
    const existingBusinessByName = await prismaTx.business.findFirst({
      where: { name }
    });
    if (existingBusinessByName) {
      throw new AppError('Ce nom de business est déjà utilisé', 409);
    }

    // Vérification unicité username (global)
    const existingUserByUsername = await prismaTx.businessUser.findFirst({
      where: { username: user.username }
    });
    if (existingUserByUsername) {
      throw new AppError(`Ce nom d'utilisateur est déjà utilisé`, 409);
    }

    // Création du business
    const business = await prismaTx.business.create({
      data: { name, type, email }
    });

    // Création du point de vente
    const createdPointOfSale = await prismaTx.pointOfSale.create({
      data: {
        name: pointOfSale.name,
        location: pointOfSale.location,
        businessId: business.id
      }
    });

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Création de l'utilisateur boss
    await prismaTx.businessUser.create({
      data: {
        name: user.name,
        username: user.username,
        password: hashedPassword,
        businessId: business.id,
        role: BusinessUserRole.BOSS,
        pointOfSaleId: createdPointOfSale.id
      }
    });

    return {
      business,
      pointOfSale: createdPointOfSale
    };
  });

  return result;
};

export const getBusinessOfBossService = async (userId: string) => {
  const boss = await prisma.businessUser.findUnique({
    where: { id: userId },
    include: {
      business: {
        include: {
          pointsOfSale: true,
        }
      }
    }
  });

  if (!boss || !boss.business) {
    throw new AppError("Aucun business associé trouvé", 404);
  }

  return boss.business;
};