import { PrismaClient, account, transaction } from "@prisma/client";
import { Transfer } from "../../domain/entities/transfer";

const prisma = new PrismaClient();

export class PrismaTransferRepository {
  async findAccountByUserId(userId: number) {
    return prisma.account.findUnique({
      where: { id_user: userId }
    });
  }

  async executeTransfer(transferData: Transfer) {
    const { senderId, receiverId, amount, fee } = transferData;

    return prisma.$transaction([
      prisma.account.update({
        where: { id_user: senderId },
        data: { balance: { decrement: amount + fee } }
      }),
      prisma.account.update({
        where: { id_user: receiverId },
        data: { balance: { increment: amount } }
      }),
      prisma.transaction.create({
        data: {
          senderId,
          receiverId,
          amount,
          fee,
          status: "SUCCESS",
          createdAt: new Date()
        }
      })
    ]);
  }
}
