import { z } from "zod";
import { validateZodSchema } from "../../users/middlewares/validateZod.middleware";

export const transferSchema = z.object({
  recipient_id: z.string().uuid(),
  amount: z.number().positive("Montant requis"),
  note: z.string().optional(),
  fees: z.number().nonnegative(),
  pin: z.string().min(4, "Code PIN requis"),
});

export const validateTransfer = validateZodSchema(transferSchema);
