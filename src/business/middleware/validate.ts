import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: 'Erreur de validation',
          errors: error.errors.map((err: any) => ({
            champ: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};
