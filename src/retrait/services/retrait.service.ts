import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateExpiration, calculateFees, generateWithdrawalCode, ModeRetrait } from "../utils/retrait.util";

const prisma = new PrismaClient();

export const createWithdrawal = async ({
  userId,
  amount,
  fees,
  mode,
  pin,
  recipientPhone,
}: {
  userId: string;
  amount: number;
  fees: number;
  mode: ModeRetrait;
  pin: string;
  recipientPhone?: string;
}) => {
  // Récupération de l'utilisateur
  const user = await prisma.users.findUnique({ where: { id_user: userId } });
  if (!user) throw new Error("Utilisateur introuvable");

  // Vérification du PIN (hash)
  if (!user.pin) throw new Error("PIN non défini pour cet utilisateur");
  const isPinValid = await bcrypt.compare(pin, user.pin);
  if (!isPinValid) throw new Error("PIN incorrect");

  // Limite quotidienne de retrait (exemple 5000$)
  const limiteQuotidienne = 2500;
  const debutJournee = new Date();
  debutJournee.setHours(0, 0, 0, 0);
  const finJournee = new Date();
  finJournee.setHours(23, 59, 59, 999);

  const totalRetraitsAujourdHui = await prisma.withdrawal.aggregate({
    _sum: { amount: true },
    where: {
      userId,
      createdAt: { gte: debutJournee, lte: finJournee },
    },
  });

  const montantRetireAujourdHui = totalRetraitsAujourdHui._sum.amount ?? 0;
  if (montantRetireAujourdHui + amount > limiteQuotidienne) {
    throw new Error(`Limite quotidienne de retrait dépassée (${limiteQuotidienne}$)`);
  }

  // Vérification du solde suffisant
  const total = amount + fees;
  if (user.balance.toNumber() < total) throw new Error("Solde insuffisant");

  // Génération code retrait et date d'expiration
  const withdrawalCode = generateWithdrawalCode();
  const expiresAt = calculateExpiration();

  // Mise à jour du solde utilisateur
  const updatedUser = await prisma.users.update({
    where: { id_user: userId },
    data: { balance: { decrement: total } },
  });

  // Création du retrait dans la base de données
  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId,
      amount,
      fees,
      total,
      mode,
      withdrawalCode,
      expiresAt,
      ...(mode === ModeRetrait.MOBILE && recipientPhone ? { recipientPhone } : {}),
    },
  });

  // Création de la notification
  await prisma.notifications.create({
    data: {
      user_id: userId,
      title: "Retrait effectué",
      message: `Votre retrait de ${amount} $ a été effectué avec succès.`,
      is_read: false,
    },
  });

  return { withdrawal, balance: updatedUser.balance };
};

export const getFees = (amount: number, mode: ModeRetrait) => {
  return calculateFees(amount, mode);
};
