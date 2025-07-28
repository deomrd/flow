import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '../errors';

const prisma = new PrismaClient();

const validateWithdrawalCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { withdrawalCode } = req.body;

  if (!withdrawalCode || typeof withdrawalCode !== 'string' || withdrawalCode.length !== 16) {
    throw new BadRequestError('Invalid withdrawal code');
  }

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { withdrawalCode }
  });

  if (!withdrawal) {
    throw new BadRequestError('Invalid withdrawal code');
  }

  if (withdrawal.status !== 'PENDING') {
    throw new BadRequestError('Withdrawal already processed');
  }

  if (new Date() > withdrawal.expiresAt) {
    throw new BadRequestError('Withdrawal code has expired');
  }

  next();
};

export default validateWithdrawalCode;
