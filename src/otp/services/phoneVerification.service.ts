import { PrismaClient, OTPType } from "@prisma/client";
import { sendOtpToPhone, verifyOtpForPhone } from "../utils/twilio.util";
import { sendOtpBySms } from "../utils/smsSender";
import { generateOTP } from "../utils/generateotp";

const prisma = new PrismaClient();

export const sendPhoneVerificationOtp = async (phone: string) => {
  const user = await prisma.users.findUnique({ where: { phone } });
  if (!user) throw new Error("Utilisateur introuvable");

  // Supprimer anciens OTP téléphone
  await prisma.otp.deleteMany({
    where: {
      userId: user.id_user,
      type: OTPType.VERIFICATION_PHONE,
    },
  });

  // ✅ Générer un OTP et définir une expiration
  const otpCode = generateOTP(); // par exemple, retourne un code à 6 chiffres
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // ✅ Enregistrer dans la base de données
  await prisma.otp.create({
    data: {
      code: otpCode,
      userId: user.id_user,
      type: OTPType.VERIFICATION_PHONE,
      expiresAt,
    },
  });

  await sendOtpBySms(user.phone, otpCode);

  return { message: "Code OTP envoyé par SMS" };
};

export const validatePhoneOtp = async (phone: string, otpCode: string) => {
  const user = await prisma.users.findUnique({ where: { phone } });
  if (!user) throw new Error("Utilisateur introuvable");

  const otpRecord = await prisma.otp.findFirst({
    where: {
      userId: user.id_user,
      code: otpCode,
      type: OTPType.VERIFICATION_PHONE,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) throw new Error("OTP invalide ou expiré");

  // Mettre à jour l'utilisateur
  const updateData: any = { is_verified_number: true };
  if (user.is_verified_email) {
    updateData.is_verified = true;
  }

  await prisma.users.update({
    where: { id_user: user.id_user },
    data: updateData,
  });

  // Supprimer OTP validé
  await prisma.otp.delete({ where: { id: otpRecord.id } });

  return { message: "Numéro de téléphone vérifié avec succès" };
};
