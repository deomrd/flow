import { createBusinessSchema } from '../validation/business.schema';
import { createBusinessService, getBusinessOfBossService } from '../services/business.service';
import { tryCatch } from '../utils/tryCatch';
import { AppError } from '../utils/AppError';
import { Request, Response } from 'express';

export const createBusiness = tryCatch(async (req: Request, res: Response) => {
  const data = createBusinessSchema.parse(req.body);
  const result = await createBusinessService(data);
  res.status(201).json({
    message: 'Business créé avec succès',
    data: result
  });
});

export const getMyBusiness = tryCatch(async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user || !user.id) {
    throw new AppError("Utilisateur non trouvé", 401);
  }

  const business = await getBusinessOfBossService(user.id);

  res.status(200).json({
    message: "Business récupéré avec succès",
    data: business
  });
});
