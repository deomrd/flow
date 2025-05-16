import { Request, Response } from 'express';
import { TransferFundsUseCase } from '../../../usecases/TransferFundsUseCase';

export class TransferController {
  constructor(private transferFundsUseCase: TransferFundsUseCase) {}

  // Méthode pour effectuer un transfert
  async transfer(req: Request, res: Response) {
    const { senderId, receiverId, amount } = req.body;

    try {
      // Vérifications basiques des données
      if (!senderId || !receiverId || !amount) {
        return res.status(400).json({ error: "Paramètres manquants" });
      }

      const amountNumber = Number(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({ error: "Montant invalide" });
      }

      // Appel du cas d'usage qui gère la logique métier (solde + frais)
      const transaction = await this.transferFundsUseCase.execute({
        senderId,
        receiverId,
        amount: amountNumber,
      });

      return res.status(200).json({
        success: true,
        transaction,
      });
    } catch (error: any) {
      // Gestion simple des erreurs
      return res.status(400).json({ error: error.message || "Erreur lors du transfert" });
    }
  }
}
