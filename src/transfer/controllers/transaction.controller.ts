import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../users/middlewares/auth.middleware";
import { transactionService } from "../services/transaction.service";
import { userService } from "users/services/user.service";

export class TransactionController {

  // 5 dernières transactions
  static async getLastTransactions(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = await transactionService.getLastTransactions(authReq.user!.id_user);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Erreur serveur" });
    }
  }

  // Résumé des transactions sur 30 jours
  static async getTransactionsSummary(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = await transactionService.getTransactionsSummary(authReq.user!.id_user);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Erreur serveur" });
    }
  }

  // Toutes les transactions
  static async getAllTransactions(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = await transactionService.getAllTransactions(authReq.user!.id_user);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Erreur serveur" });
    }
  }

  // 5 derniers contacts uniques
  static async lastContact(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = await transactionService.lastContact(authReq.user!.id_user);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Erreur serveur" });
    }
  }


}
