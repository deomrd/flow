import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Affiche la stack en mode développement uniquement
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Gestion des erreurs Zod (validation)
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: err.errors,
    });
  }

  // Gestion des erreurs personnalisées avec propriété isOperational
  if (err.isOperational && err.statusCode && err.message) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Erreur inconnue / non prévue
  return res.status(500).json({
    message: 'Erreur serveur',
  });
};
