import { PrismaClient } from "@prisma/client";
import { calculateTransferFee } from "../utils/fees";

export const executeTransfer = async (
  senderId: string,
  recipientId: string,
  amount: number,
  note: string | undefined
) => {
  const prisma = new PrismaClient();

  const sender = await prisma.users.findUnique({ where: { id_user: senderId } });
  const recipient = await prisma.users.findUnique({ where: { id_user: recipientId } });

  if (!sender || !recipient) throw new Error("Expéditeur ou destinataire invalide");

  const fees = calculateTransferFee(amount);
  const total = amount + fees;

  if (sender.balance.toNumber() < total) throw new Error("Fonds insuffisants");

  const updatedSenderBalance = sender.balance.toNumber() - total;
  const updatedRecipientBalance = recipient.balance.toNumber() + amount;

  const transaction = await prisma.$transaction(async (tx) => {
    const txRecord = await tx.transactions.create({
      data: {
        user_id: senderId,
        recipient_user_id: recipientId,
        amount,
        fees,
        note,
        type: "transfer",
        status: "completed"
      }
    });

    await tx.users.update({
      where: { id_user: senderId },
      data: { balance: updatedSenderBalance }
    });

    await tx.users.update({
      where: { id_user: recipientId },
      data: { balance: updatedRecipientBalance }
    });

    await tx.notifications.create({
      data: {
        user_id: recipientId,
        title: "Nouveau transfert reçu",
        message: `Vous avez reçu ${amount}$ de ${sender.username}.`
      }
    });

    await tx.notifications.create({
      data: {
        user_id: senderId,
        title: "Transfert effectué",
        message: `Vous avez envoyé ${amount}$ à ${recipient.username}.`
      }
    });

    return txRecord;
  });

  const result = {
    transaction,
    balance: updatedSenderBalance  
  };

  console.log("executeTransfer result:", result);

  return result;
};


export const getFeesForAmount = (amount: number) => {
  const fees = calculateTransferFee(amount);
  const total = amount + fees;
  const percentage = (fees / amount) * 100;

  return {
    amount,
    fees,
    total,
    percentage: Number(percentage.toFixed(2))
  };
};
