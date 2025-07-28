import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
import { AppError } from '../utils/AppError';

// On étend Request pour typer userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Pour test, on récupère userId depuis l'en-tête 'x-user-id'
    const userIdHeader = req.headers['x-user-id'];

    if (!userIdHeader) {
      throw new AppError('User ID header missing', 401);
    }

    const userId = Number(userIdHeader);

    if (isNaN(userId)) {
      throw new AppError('Invalid User ID', 401);
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.businessUser.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.userId = userId;
    next();
  } catch (err) {
    next(err);
  }
};
