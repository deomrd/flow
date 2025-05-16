import { Request, Response } from 'express';
import { TransferFundsUseCase } from '../../../usecases/TransferFundsUseCase';

export class TransferController {
  private transferFundsUseCase: TransferFundsUseCase;

  constructor(transferFundsUseCase: TransferFundsUseCase) {
    this.transferFundsUseCase = transferFundsUseCase;
  }

  transfer = async (req: Request, res: Response) => {
    const { senderId, receiverId, amount } = req.body;

    try {
      if (!senderId || !receiverId || !amount) {
        throw new Error("Champs obligatoires manquants");
      }
      if (typeof amount !== 'number' && isNaN(Number(amount))) {
        throw new Error("Montant invalide");
      }

      const transaction = await this.transferFundsUseCase.execute({
        senderId,
        receiverId,
        amount: Number(amount),
      });

      return res.status(200).json({
        success: true,
        transaction,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({
        success: false,
        error: error.message || "Erreur lors du transfert",
      });
    }
  };
}
