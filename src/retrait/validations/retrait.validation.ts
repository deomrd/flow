import { z } from 'zod';
import { ModeRetrait } from '../utils/retrait.util';

const phoneRegex = /^\+?[0-9]{8,15}$/;

export const CreateWithdrawalSchema = z.object({
  amount: z.number()
    .positive("Le montant doit être positif")
    .max(2500, "Le montant maximum est de 2500"),
  mode: z.nativeEnum(ModeRetrait),
  pin: z.string()
    .length(4, "Le PIN doit contenir 4 chiffres")
    .regex(/^\d+$/, "Le PIN ne doit contenir que des chiffres"),
  recipientPhone: z.string()
    .regex(phoneRegex, "Numéro de téléphone invalide")
    .optional()
}).superRefine((data, ctx) => {
  if (data.mode === 'MOBILE' && !data.recipientPhone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le numéro de téléphone est requis pour les retraits mobile",
      path: ["recipientPhone"]
    });
  }
});

export type CreateWithdrawalInput = z.infer<typeof CreateWithdrawalSchema>;

export const FeesQuerySchema = z.object({
  amount: z.coerce.number()
    .positive("Le montant doit être positif")
    .max(2500, "Le montant maximum est de 2500"),
  mode: z.nativeEnum(ModeRetrait),
});

export type FeesQueryInput = z.infer<typeof FeesQuerySchema>;
