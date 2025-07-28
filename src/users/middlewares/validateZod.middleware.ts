import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateZodSchema = (schema: ZodSchema, source: 'body' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = source === 'body' ? req.body : req.query;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      console.error(" Erreurs de validation Zod :", result.error.flatten()); 
      res.status(400).json({
        message: "Erreur de validation",
        errors: result.error.flatten(),
      });
      return;
    }

    if (source === 'body') {
      req.body = result.data;
    } else {
      (req as any).validatedQuery = result.data; 
    }

    next();
  };
};
