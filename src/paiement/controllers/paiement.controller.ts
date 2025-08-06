import { Response } from "express";
import { PaymentService } from "../services/paiement.service";
import { createPaymentSchema } from "../validations/paiement.validation";
import { AuthenticatedRequest } from "users/middlewares/auth.middleware";

const paymentService = new PaymentService();

export class PaymentController {
  /**
   * Création d'un paiement
   */
  async createPayment(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }

      // Valide les données du paiement
      const data = createPaymentSchema.parse(req.body);

      // Appelle le service en injectant userId depuis le token
      const payment = await paymentService.createPayment({
        ...data,
        userId: req.user.id_user,
      });

      return res.status(201).json({
        message: "Paiement effectué avec succès",
        payment,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Récupérer les paiements d'un utilisateur
   */
  async getUserPayments(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }

      const { limit = 20, offset = 0 } = req.query;

      const payments = await paymentService.getUserPayments(
        req.user.id_user,
        Number(limit),
        Number(offset)
      );

      return res.json({ payments });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Récupérer un paiement par son ID
   */
  async getPaymentById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }

      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id, req.user.id_user);

      return res.json({ payment });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Récupérer un paiement par sa référence
   */
  async getPaymentByReference(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }

      const { reference } = req.params;
      const payment = await paymentService.getPaymentByReference(reference, req.user.id_user);

      return res.json({ payment });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Calculer les frais de paiement et récupérer les infos business
   * GET /api/paiement/fees
   */
  async getPaymentFees(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }

      const { qrCode, amount } = req.body;
      if (!qrCode || !amount) {
        return res.status(400).json({ error: "QR code et montant sont requis" });
      }

      const result = await paymentService.getPaymentFees(
        qrCode as string,
        parseFloat(amount as string)
      );

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Confirmation du paiement avant saisie du PIN
   * POST /api/paiement/confirmation
   */
  async confirmPayment(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }

      const { qrCode, amount } = req.body;
      if (!qrCode || !amount) {
        return res.status(400).json({ error: "QR code et montant sont requis" });
      }

      const confirmation = await paymentService.confirmPayment(
        req.user.id_user,
        qrCode,
        parseFloat(amount)
      );

      return res.json(confirmation);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
