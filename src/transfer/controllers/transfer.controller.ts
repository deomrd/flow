import { Request, Response } from "express";
import { transferSchema } from "../validations/transaction.validation";
import { executeTransfer, getFeesForAmount } from "../services/transfer.service";

export const handleTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id_user;
    if (!userId) {
      res.status(401).json({ message: "Non autorisé" });
      return;
    }

    const validated = transferSchema.parse(req.body);
    const result = await executeTransfer(
      userId,
      validated.recipient_id,
      validated.amount,
      validated.note
    );

    res.status(200).json({ message: "Transfert réussi", data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getTransferFees = (req: Request, res: Response): void => {
  const amount = Number(req.query.amount);

  if (isNaN(amount) || amount <= 0) {
    res.status(400).json({ error: "Montant invalide" });
    return;
  }

  try {
    const feesData = getFeesForAmount(amount);
    res.json(feesData);
  } catch (error) {
    console.error("Erreur dans getTransferFees:", error); 
    res.status(500).json({ error: "Erreur serveur" });
  }
};
