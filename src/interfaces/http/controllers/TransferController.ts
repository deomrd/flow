import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { InternalServerError, BadRequestError } from '../../../utils/errors';
import { io, connectedUsers } from '../../../server';

const prisma = new PrismaClient();

export const transferMoney = async (req: Request, res: Response) => {
    try {
        const { recipient_id, amount, note } = req.body;
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

        // Vérifier que l'expéditeur a suffisamment de fonds
        const sender = await prisma.users.findUnique({
            where: { id_user: senderId }
        });

        if (!sender) {
            throw new BadRequestError('Expéditeur non trouvé');
        }

        // Calculer les frais (1.5%)
        const fees = amount * 0.015;
        const totalAmount = amount + fees;

        if (sender.balance < totalAmount) {
            throw new BadRequestError('Solde insuffisant');
        }

        // Commencer une transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Mettre à jour le solde de l'expéditeur
            await prisma.users.update({
                where: { id_user: senderId },
                data: { balance: { decrement: totalAmount } }
            });

            // Mettre à jour le solde du destinataire
            await prisma.users.update({
                where: { id_user: recipient_id },
                data: { balance: { increment: amount } }
            });

            // Trouver les frais correspondants
            const fee = await prisma.fees.findFirst({
                where: {
                    transaction_type: 'transfer',
                    method: 'mobile_money' // À adapter selon votre logique
                }
            });

            // Créer la transaction
            const transaction = await prisma.transactions.create({
                data: {
                    user_id: senderId,
                    recipient_user_id: recipient_id,
                    type: 'transfer',
                    amount: amount,
                    status: 'completed',
                    fee_id: fee?.id_fee || null
                }
            });

            // Créer une notification pour le destinataire
            await prisma.notifications.create({
                data: {
                    user_id: recipient_id,
                    title: 'Nouveau transfert reçu',
                    message: `Vous avez reçu ${amount}€ de ${sender.username}`
                }
            });

            return transaction;
        });

        // Envoyer une notification en temps réel via WebSocket
        const recipientSocketId = connectedUsers.get(recipient_id.toString());
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('new_transfer', {
                amount,
                sender: sender.username,
                message: `Vous avez reçu ${amount}€`
            });
        }

        res.status(200).json({
            success: true,
            data: result,
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