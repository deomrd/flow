import { PrismaClient, BusinessUserRole } from '@prisma/client';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcryptjs';
import { generateUniqueUsername } from '../utils/username';

const prisma = new PrismaClient();


const generateQrCode = (businessInitial: string, pointInitial: string, number: number): string => {
  return `${businessInitial}${pointInitial}${number.toString().padStart(11, '0')}`;
};

export const createBusinessService = async (data: any) => {
  const { name, type, email, pin, pointOfSale, user } = data;

  return prisma.$transaction(async (prismaTx) => {
    // Vérification unicité email du business
    const existingBusinessByEmail = await prismaTx.business.findUnique({
      where: { email },
    });
    if (existingBusinessByEmail) {
      throw new AppError('Cet email est déjà utilisé pour un autre business', 409);
    }

    // Vérification unicité nom du business
    const existingBusinessByName = await prismaTx.business.findFirst({
      where: { name },
    });
    if (existingBusinessByName) {
      throw new AppError('Ce nom de business est déjà utilisé', 409);
    }

    // Hash du PIN avant enregistrement
    const hashedPin = await bcrypt.hash(pin, 10);

    // Création du business
    const business = await prismaTx.business.create({
      data: { name, type, email, pin: hashedPin },
    });

    // Initiales business (2 premières lettres, majuscules)
    const businessInitial = (business.name.match(/\b\w/g) || [])
      .slice(0, 1)
      .join('')
      .toUpperCase()
      .padEnd(1, 'X');

    // Initiales pointOfSale (2 premières lettres, majuscules)
    const pointInitial = (pointOfSale.name.match(/\b\w/g) || [])
      .slice(0, 1)
      .join('')
      .toUpperCase()
      .padEnd(1, 'X');

    // Génération du QR code avec max 10 essais pour éviter collision
    let qrCode = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      const baseNumber = Date.now() % 10000000000000;
      const candidateNumber = baseNumber + attempt;
      const candidateQrCode = generateQrCode(businessInitial, pointInitial, candidateNumber);

      const existingQr = await prismaTx.pointOfSale.findUnique({
        where: { qrCode: candidateQrCode },
      });

      if (!existingQr) {
        qrCode = candidateQrCode;
        break;
      }
    }

    if (!qrCode) {
      throw new AppError('Impossible de générer un QR code unique, veuillez réessayer plus tard', 500);
    }

    // Création du point de vente avec qrCode obligatoire
    const createdPointOfSale = await prismaTx.pointOfSale.create({
      data: {
        name: pointOfSale.name,
        location: pointOfSale.location,
        businessId: business.id,
        qrCode,
      },
    });

    // Génération du username unique
    const generatedUsername = await generateUniqueUsername(user.name);

    // Hash du mot de passe utilisateur
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Création de l'utilisateur boss lié au business et au point de vente
    await prismaTx.businessUser.create({
      data: {
        name: user.name,
        username: generatedUsername,
        password: hashedPassword,
        businessId: business.id,
        role: BusinessUserRole.BOSS,
        pointOfSaleId: createdPointOfSale.id,
      },
    });

    return {
      business,
      pointOfSale: createdPointOfSale,
    };
  });
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
