import { PrismaClient, OTPType } from "@prisma/client";
import { generateOTP } from "../utils/generateotp";
import { sendOtpByEmail } from "../utils/mailer";

const prisma = new PrismaClient();

export const processEmailVerification = async (email: string) => {
  const user = await prisma.users.findUnique({
    where: { email }
  });

  if (!user) throw new Error("Utilisateur introuvable");

  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Supprimer anciens OTP de type VERIFICATION_EMAIL
  await prisma.otp.deleteMany({
    where: {
      userId: user.id_user,
      type: OTPType.VERIFICATION_EMAIL,
    }
  });

  // Créer nouveau OTP
  await prisma.otp.create({
    data: {
      code: otpCode,
      userId: user.id_user,
      expiresAt,
      type: OTPType.VERIFICATION_EMAIL,
      
    }
  });

  await sendOtpByEmail(email, otpCode);
  return { message: "Code envoyé par email" };
};


export const validatePhoneOtp = async (phone: string, otpCode: string) => {
  // Trouver l'utilisateur par téléphone
  const user = await prisma.users.findUnique({ where: { phone } });
  if (!user) throw new Error("Utilisateur introuvable");

  // Trouver l'OTP valide
  const otpRecord = await prisma.otp.findFirst({
    where: {
      userId: user.id_user,
      code: otpCode,
      type: OTPType.VERIFICATION_PHONE,
      expiresAt: { gt: new Date() } // OTP non expiré
    }
  });

  if (!otpRecord) throw new Error("OTP invalide ou expiré");

  // Mettre à jour is_verified_number à true
  // Si is_verified_email est déjà true, mettre aussi is_verified à true
  await prisma.users.update({
    where: { id_user: user.id_user },
    data: {
      is_verified_number: true,
      ...(user.is_verified_email && { is_verified: true }),
    }
  });

  // Supprimer l'OTP validé
  await prisma.otp.delete({
    where: { id: otpRecord.id }
  });

  return { message: "Numéro de téléphone vérifié avec succès" };
};

