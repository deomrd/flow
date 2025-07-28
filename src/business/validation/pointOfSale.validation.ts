import { z } from 'zod';

export const createPointOfSaleSchema = z.object({
  businessId: z.number(),
  name: z.string().min(1, "Le nom est obligatoire"),
  location: z.string().optional(),
});

export const updatePointOfSaleSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
});
