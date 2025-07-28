import { z } from "zod";

export const emailVerificationSchema = z.object({
  email: z.string().email()
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});