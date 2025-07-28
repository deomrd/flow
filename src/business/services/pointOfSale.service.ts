import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';


const prisma = new PrismaClient();

export const createPointOfSaleService = async (data: {
  businessId: string;
  name: string;
  location?: string;
}) => {
  // Vérifier que le business existe
  const business = await prisma.business.findUnique({
    where: { id: data.businessId },
  });

  if (!business) {
    throw new AppError('Business introuvable', 404);
  }

  // Créer le point de vente
  const pointOfSale = await prisma.pointOfSale.create({
    data,
  });

  return pointOfSale;
};

export const updatePointOfSaleService = async (
  id: string,
  data: { name?: string; location?: string }
) => {
  const pointOfSale = await prisma.pointOfSale.findUnique({
    where: { id },
  });

  if (!pointOfSale) {
    throw new AppError('Point de vente introuvable', 404);
  }

  return prisma.pointOfSale.update({
    where: { id },
    data,
  });
};

export const deletePointOfSaleService = async (id: string) => {
  const pointOfSale = await prisma.pointOfSale.findUnique({
    where: { id },
  });

  if (!pointOfSale) {
    throw new AppError('Point de vente introuvable', 404);
  }

  return prisma.pointOfSale.delete({
    where: { id },
  });
};

export const getPointsOfSaleByBusinessService = async (businessId: string) => {
  const points = await prisma.pointOfSale.findMany({
    where: { businessId },
  });
  return points;
};

export const getPointOfSaleByBusinessService = async (businessId: string, pointOfSaleId: string) => {
  const point = await prisma.pointOfSale.findFirst({
    where: {
      id: pointOfSaleId,
      businessId: businessId,
    },
  });
  return point;
};