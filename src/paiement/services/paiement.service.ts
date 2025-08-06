import { PrismaClient, PaymentStatus } from "@prisma/client";
import { calculatePaiementFee } from "../utils/fees";
import { CreatePaymentDTO } from "../validations/paiement.validation";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export class PaymentService {
  /**
   * Création du paiement avec PIN
   */
  async createPayment(data: CreatePaymentDTO & { qrCode: string }) {
    return prisma.$transaction(async (tx) => {
      const { userId, qrCode, amount, method, pin } = data;

      // Vérification utilisateur
      const user = await tx.users.findUnique({ where: { id_user: userId } });
      if (!user) throw new Error("Utilisateur introuvable.");

      if (!user.pin) {
        throw new Error("Aucun code PIN n'est défini pour cet utilisateur.");
      }

      // Vérification du code PIN
      const isPinValid = await bcrypt.compare(pin, user.pin);
      if (!isPinValid) {
        throw new Error("Code PIN invalide.");
      }

      // Trouver le point de vente via le QR code
      const pointOfSale = await tx.pointOfSale.findFirst({ where: { qrCode } });
      if (!pointOfSale) throw new Error("Point de vente introuvable via ce QR code.");

      const businessId = pointOfSale.businessId;

      const fee = calculatePaiementFee(amount);
      const totalDebit = amount + fee;

      if (Number(user.balance) < totalDebit) {
        throw new Error(`Solde insuffisant. Solde actuel: ${user.balance}, requis: ${totalDebit}`);
      }

      // Vérification du business
      const business = await tx.business.findUnique({ where: { id: businessId } });
      if (!business) throw new Error("Business introuvable.");

      // Débiter l'utilisateur
      await tx.users.update({
        where: { id_user: userId },
        data: { balance: { decrement: totalDebit } },
      });

      // Créditer le point de vente
      await tx.pointOfSale.update({
        where: { id: pointOfSale.id },
        data: { balance: { increment: amount } },
      });

      // Créditer le business
      await tx.business.update({
        where: { id: businessId },
        data: { balance: { increment: amount } },
      });

      // Générer une référence unique pour le paiement
      const reference = randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();

      // Créer le paiement
      const payment = await tx.payment.create({
        data: {
          userId,
          businessId,
          pointOfSaleId: pointOfSale.id,
          amount,
          fee,
          currency: "USD",
          method,
          reference,
          status: PaymentStatus.COMPLETED,
        },
      });

      // Notifications
      await tx.notifications.create({
        data: {
          user_id: userId,
          title: "Paiement effectué",
          message: `Votre paiement de ${amount} USD au business ${business.name} a été effectué avec succès.`,
        },
      });

      return payment;
    });
  }

  /**
   * Calculer les frais et renvoyer infos business/point de vente
   */
  async getPaymentFees(qrCode: string, amount: number) {
    const pointOfSale = await prisma.pointOfSale.findFirst({ where: { qrCode } });
    if (!pointOfSale) throw new Error("Point de vente introuvable via ce QR code.");

    const business = await prisma.business.findUnique({ where: { id: pointOfSale.businessId } });
    if (!business) throw new Error("Business introuvable.");

    const fees = calculatePaiementFee(amount);

    return {
      fees,
      businessName: business.name,
      pointOfSaleName: pointOfSale.name,
    };
  }

  /**
   * Vérification avant confirmation du paiement (sans PIN)
   */
  async confirmPayment(userId: string, qrCode: string, amount: number) {
    const user = await prisma.users.findUnique({ where: { id_user: userId } });
    if (!user) throw new Error("Utilisateur introuvable.");

    const pointOfSale = await prisma.pointOfSale.findFirst({ where: { qrCode } });
    if (!pointOfSale) throw new Error("Point de vente introuvable via ce QR code.");

    const business = await prisma.business.findUnique({ where: { id: pointOfSale.businessId } });
    if (!business) throw new Error("Business introuvable.");

    const fees = calculatePaiementFee(amount);
    const totalDebit = amount + fees;

    if (Number(user.balance) < totalDebit) {
      throw new Error(`Solde insuffisant. Solde actuel: ${user.balance}, requis: ${totalDebit}`);
    }

    return {
      businessName: business.name,
      pointOfSaleName: pointOfSale.name,
      amount,
      fees,
      totalDebit,
    };
  }

  async getUserPayments(userId: string, limit = 20, offset = 0) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      include: {
        business: true,
        pointOfSale: true,
      },
    });
  }

  async getPaymentById(paymentId: string, userId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        business: true,
        pointOfSale: true,
      },
    });

    if (!payment) {
      throw new Error("Paiement introuvable.");
    }

    if (payment.userId !== userId) {
      throw new Error("Accès refusé : ce paiement ne vous appartient pas.");
    }

    return payment;
  }

  async getPaymentByReference(reference: string, userId: string) {
    const payment = await prisma.payment.findFirst({
      where: { reference },
      include: {
        business: true,
        pointOfSale: true,
      },
    });

    if (!payment) {
      throw new Error("Paiement introuvable avec cette référence.");
    }

    if (payment.userId !== userId) {
      throw new Error("Accès refusé : ce paiement ne vous appartient pas.");
    }

    return payment;
  }
}
