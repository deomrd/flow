import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const requireVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.is_verified) {
      res.status(403).json({
        message: "Votre compte n'est pas encore vérifié. Veuillez vérifier votre compte.",
      });
      return;
  }

  next();
};
