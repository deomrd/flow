import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
// import { AppError } from '../utils/appError';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const verifyBoss = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userIdHeader = req.headers['x-user-id'];

    if (!userIdHeader) {
      throw new AppError('User ID missing from headers (x-user-id)', 401);
    }

    const userId = String(userIdHeader);


    const user = await prisma.businessUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (user.role !== 'BOSS') {
      throw new AppError('Access denied: not a boss', 403);
    }

    // Si tout est bon, tu peux stocker userId dans req pour les routes suivantes
    (req as any).user = { id: userId };

    next();
  } catch (err) {
    next(err);
  }
};
