import { z } from "zod";

export const phoneOtpSchema = z.object({
  phone: z.string().min(10, "Numéro de téléphone requis"),
  otpCode: z.string().length(6, "OTP doit faire 6 caractères"),
});
