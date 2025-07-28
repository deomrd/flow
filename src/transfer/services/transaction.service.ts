import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../../users/middlewares/auth.middleware";
import { BadRequestError } from "../../users/utils/errors";
import { io, connectedUsers } from "../../server";

const prisma = new PrismaClient();

export const transactionService = {


  async getLastTransactions(userId: string) {
    const transactions = await prisma.transactions.findMany({
      where: {
        OR: [{ user_id: userId }, { recipient_user_id: userId }],
      },
      take: 5,
      orderBy: { initiated_at: "desc" },
      include: {
        users: { select: { username: true, userprofiles: { select: { full_name: true } } } },
        recipient: { select: { username: true, userprofiles: { select: { full_name: true } } } },
      },
    });

    return transactions.map((tx) => ({
      ...tx,
      senderFullName: tx.users?.userprofiles?.[0]?.full_name ?? null,
      recipientFullName: tx.recipient?.userprofiles?.[0]?.full_name ?? null,
    }));
  },

  async getTransactionsSummary(userId: string) {
    const date30 = new Date();
    date30.setDate(date30.getDate() - 30);

    const sent = await prisma.transactions.aggregate({
      where: { user_id: userId, initiated_at: { gte: date30 } },
      _count: { id_transaction: true },
      _sum: { amount: true },
    });

    const received = await prisma.transactions.aggregate({
      where: { recipient_user_id: userId, initiated_at: { gte: date30 } },
      _count: { id_transaction: true },
      _sum: { amount: true },
    });

    return {
      totalTransactions: (sent._count.id_transaction || 0) + (received._count.id_transaction || 0),
      totalSent: sent._sum.amount ?? 0,
      totalReceived: received._sum.amount ?? 0,
    };
  },

  async getAllTransactions(userId: string) {
    const transactions = await prisma.transactions.findMany({
      where: {
        OR: [{ user_id: userId }, { recipient_user_id: userId }],
      },
      orderBy: { initiated_at: "desc" },
      include: {
        users: { include: { userprofiles: { select: { full_name: true } } } },
        recipient: { include: { userprofiles: { select: { full_name: true } } } },
      },
    });

    return transactions.map((tx) => ({
      id: tx.id_transaction,
      type: tx.type,
      amount: tx.amount,
      fees: tx.fees,
      status: tx.status,
      note: tx.note,
      initiated_at: tx.initiated_at,
      completed_at: tx.completed_at,
      sender: {
        id: tx.user_id,
        full_name: tx.users.userprofiles[0]?.full_name ?? "Inconnu",
      },
      recipient: tx.recipient_user_id
        ? {
            id: tx.recipient_user_id,
            full_name: tx.recipient?.userprofiles[0]?.full_name ?? "Inconnu",
          }
        : null,
    }));
  },

  async lastContact(userId: string) {
    const transactions = await prisma.transactions.findMany({
      where: {
        OR: [{ user_id: userId }, { recipient_user_id: userId }],
      },
      orderBy: { initiated_at: "desc" },
      include: {
        users: { select: { email: true, phone: true, userprofiles: { select: { full_name: true } } } },
        recipient: { select: { email: true, phone: true, userprofiles: { select: { full_name: true } } } },
      },
    });

    const seen = new Set();
    const contacts: any[] = [];

    for (const tx of transactions) {
      let id, full_name, email, phone;

      if (tx.user_id !== userId) {
        id = tx.user_id;
        full_name = tx.users.userprofiles[0]?.full_name;
        email = tx.users.email;
        phone = tx.users.phone;
      } else if (tx.recipient_user_id !== userId && tx.recipient) {
        id = tx.recipient_user_id;
        full_name = tx.recipient.userprofiles[0]?.full_name;
        email = tx.recipient.email;
        phone = tx.recipient.phone;
      }

      if (id && !seen.has(id)) {
        seen.add(id);
        contacts.push({ id, full_name, email, phone });
      }

      if (contacts.length === 5) break;
    }

    return contacts;
  },


};
