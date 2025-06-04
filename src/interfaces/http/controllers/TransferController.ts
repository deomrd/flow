import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { InternalServerError, BadRequestError } from '../../../utils/errors';
import { io, connectedUsers } from '../../../server';

const prisma = new PrismaClient();

// transferer l'argent
export const transferMoney = async (req: Request, res: Response) => {
    try {
        const { recipient_id: recipientIdRaw, amount, note } = req.body;
        const recipient_id = Number(recipientIdRaw);
        const senderId = req.user.id_user;

        // Vérifier que le montant est positif
        if (amount <= 0) {
            throw new BadRequestError('Le montant doit être supérieur à zéro');
        }

        // Vérifier que l'utilisateur ne s'envoie pas d'argent à lui-même
        if (senderId === recipient_id) {
            throw new BadRequestError('Vous ne pouvez pas vous envoyer de l\'argent à vous-même');
        }

        // Vérifier que le destinataire existe
        const recipient = await prisma.users.findUnique({
            where: { id_user: recipient_id }
        });

        if (!recipient) {
            throw new BadRequestError('Destinataire non trouvé');
        }

        // Vérifier que l'expéditeur existe
        const sender = await prisma.users.findUnique({
            where: { id_user: senderId }
        });

        if (!sender) {
            throw new BadRequestError('Expéditeur non trouvé');
        }

        // Calculer les frais (1.5%)
        const fees = amount * 0.015;
        const totalAmount = amount + fees;

        // Vérifier solde suffisant
        if (sender.balance < totalAmount) {
            throw new BadRequestError('Solde insuffisant');
        }

        // Transaction atomique
        const result = await prisma.$transaction(async (tx) => {
            // Débiter l'expéditeur
            const updatedSender = await tx.users.update({
                where: { id_user: senderId },
                data: { balance: { decrement: totalAmount } }
            });

            // Créditer le destinataire
            const updatedRecipient = await tx.users.update({
                where: { id_user: recipient_id },
                data: { balance: { increment: amount } }
            });



            // Créer la transaction
            const transaction = await tx.transactions.create({
                data: {
                    user_id: senderId,
                    recipient_user_id: recipient_id,
                    type: 'transfer',
                    amount: amount,
                    status: 'completed',
                    note: note || '',
                    fees: fees || null
                }
            });

            // Créer une notification
            await tx.notifications.create({
                data: {
                    user_id: recipient_id,
                    title: 'Nouveau transfert reçu',
                    message: `Vous avez reçu ${amount}€ de ${sender.username}`
                }
            });

            // SOCKET.IO : Envoyer mise à jour des soldes
            const senderSocketId = connectedUsers.get(senderId.toString());
            const recipientSocketId = connectedUsers.get(recipient_id.toString());

            if (senderSocketId) {
                io.to(senderSocketId).emit('balance_update', {
                    userId: senderId,
                    newBalance: updatedSender.balance
                });
            }

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('balance_update', {
                    userId: recipient_id,
                    newBalance: updatedRecipient.balance
                });

                io.to(recipientSocketId).emit('new_transfer', {
                    amount,
                    sender: sender.username,
                    message: `Vous avez reçu ${amount}€`
                });
            }

            return { transaction, updatedSender, updatedRecipient };
        });

        res.status(200).json({
            success: true,
            data: {
                transaction: result.transaction,
                newBalanceSender: result.updatedSender.balance,
                newBalanceRecipient: result.updatedRecipient.balance
            },
            message: 'Transfert effectué avec succès'
        });

    } catch (error) {
        console.error('Erreur lors du transfert:', error);
        if (error instanceof BadRequestError) {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({
            success: false,
            error: 'Une erreur est survenue lors du transfert'
        });
    }
};

// lister 5 dernieres transactions 

export const getLastTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id_user;  

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const transactions = await prisma.transactions.findMany({
  where: {
    OR: [
      { user_id: userId },
      { recipient_user_id: userId },
    ],
  },
  orderBy: {
    initiated_at: 'desc',
  },
  take: 5,
  include: {
    users: {  // Expéditeur
      select: {
        id_user: true,
        username: true,
        email: true,
        userprofiles: {
          select: {
            full_name: true,
          },
        },
      },
    },
    recipient: { // Destinataire
      select: {
        id_user: true,
        username: true,
        email: true,
        userprofiles: {
          select: {
            full_name: true,
          },
        },
      },
    },
  },
});



    // Formater la réponse pour avoir facilement les noms complets
    const formattedTransactions = transactions.map(tx => ({
      ...tx,
      senderFullName: tx.users?.userprofiles?.[0]?.full_name || null,
      recipientFullName: tx.recipient?.userprofiles?.[0]?.full_name || null,
    }));

    return res.json({ success: true, data: formattedTransactions });

  } catch (error) {
    console.error('Erreur getLastTransactions:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// la somme de transactions dans les 30 derniers jours 
export const getTransactionsSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id_user;  // récupère l’id de l’utilisateur connecté

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

    // Transactions envoyées par l'utilisateur dans les 30 derniers jours
    const sentTransactions = await prisma.transactions.aggregate({
      _count: { id_transaction: true },
      _sum: { amount: true },
      where: {
        user_id: userId,
        initiated_at: { gte: date30DaysAgo },
      },
    });

    // Transactions reçues par l'utilisateur dans les 30 derniers jours
    const receivedTransactions = await prisma.transactions.aggregate({
      _count: { id_transaction: true },
      _sum: { amount: true },
      where: {
        recipient_user_id: userId,
        initiated_at: { gte: date30DaysAgo },
      },
    });

    const totalTransactions = (sentTransactions._count.id_transaction ?? 0) + (receivedTransactions._count.id_transaction ?? 0);
    const totalSent = sentTransactions._sum.amount ?? 0;
    const totalReceived = receivedTransactions._sum.amount ?? 0;

    return res.json({
      success: true,
      data: {
        totalTransactions,
        totalSent,
        totalReceived,
      },
    });
  } catch (error) {
    console.error('Erreur getTransactionsSummary:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// les transactions de tout le temps 
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id_user;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    // On récupère toutes les transactions où le user est l'expéditeur ou le bénéficiaire
    const transactions = await prisma.transactions.findMany({
      where: {
        OR: [
          { user_id: userId },
          { recipient_user_id: userId }
        ],
      },
      orderBy: {
        initiated_at: 'desc',
      },
      include: {
        users: {
          include: {
            userprofiles: {
              select: {
                full_name: true,
              },
            },
          },
        },
        recipient: {
          include: {
            userprofiles: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
    });

    const formatted = transactions.map(tx => ({
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
        full_name: tx.users.userprofiles[0]?.full_name ?? 'Inconnu',
      },
      recipient: tx.recipient_user_id
        ? {
            id: tx.recipient_user_id,
            full_name: tx.recipient?.userprofiles[0]?.full_name ?? 'Inconnu',
          }
        : null,
    }));

    return res.json({
      success: true,
      transactions: formatted,
    });
  } catch (error) {
    console.error('Erreur getAllTransactionsWithNames:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// 5 derniers contacts qu'on a transfere les fonds

export const lastContact = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id_user;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const transactions = await prisma.transactions.findMany({
      where: {
        OR: [
          { user_id: userId },
          { recipient_user_id: userId },
        ],
      },
      orderBy: {
        initiated_at: 'desc',
      },
      include: {
        users: {
          select: {
            email: true,
            phone: true,
            userprofiles: {
              select: {
                full_name: true,
              },
            },
          },
        },
        recipient: {
          select: {
            email: true,
            phone: true,
            userprofiles: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
    });

    const seen = new Set();
    const uniquePersons: {
      id: number;
      full_name: string;
      email: string | null;
      phone: string | null;
    }[] = [];

    for (const tx of transactions) {
      let otherUserId = null;
      let otherFullName = '';
      let email = null;
      let phone = null;

      if (tx.user_id !== userId && tx.users) {
        otherUserId = tx.user_id;
        otherFullName = tx.users.userprofiles[0]?.full_name ?? 'Inconnu';
        email = tx.users.email ?? null;
        phone = tx.users.phone ?? null;
      } else if (tx.recipient_user_id !== null && tx.recipient_user_id !== userId && tx.recipient) {
        otherUserId = tx.recipient_user_id;
        otherFullName = tx.recipient.userprofiles[0]?.full_name ?? 'Inconnu';
        email = tx.recipient.email ?? null;
        phone = tx.recipient.phone ?? null;
      }

      if (otherUserId && !seen.has(otherUserId)) {
        seen.add(otherUserId);
        uniquePersons.push({
          id: otherUserId,
          full_name: otherFullName,
          email,
          phone,
        });

        if (uniquePersons.length === 5) break;
      }
    }

    return res.json({
      success: true,
      recent_contacts: uniquePersons,
    });
  } catch (error) {
    console.error('Erreur getLast5UniqueTransactionUsers:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
