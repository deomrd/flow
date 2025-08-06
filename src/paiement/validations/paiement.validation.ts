import { z } from "zod";

export const createPaymentSchema = z.object({
  qrCode: z.string().length(10, "Le QR code doit faire 10 caractères"),
  amount: z.number().positive(),
  method: z.enum(["APPLICATION", "QR"]),
  pin: z.string().length(4, "Le code PIN doit contenir 4 chiffres"),
});

// On définit et exporte le type CreatePaymentDTO
export type CreatePaymentDTO = z.infer<typeof createPaymentSchema> & { userId: string };
