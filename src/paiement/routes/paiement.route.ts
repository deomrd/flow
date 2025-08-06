import { Router } from "express";
import { PaymentController } from "../controllers/paiement.controller";
import { AuthenticatedRequest, authMiddleware } from "../../users/middlewares/auth.middleware";

const router = Router();
const paymentController = new PaymentController();

// Créer un paiement
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
  await paymentController.createPayment(req, res);
});

// Obtenir les frais d'un paiement et infos business/point de vente
router.post("/fees", authMiddleware, async (req: AuthenticatedRequest, res) => {
  await paymentController.getPaymentFees(req, res);
});

// Confirmer un paiement avant saisie du PIN
router.post("/confirm", authMiddleware, async (req: AuthenticatedRequest, res) => {
  await paymentController.confirmPayment(req, res);
});

// Historique des paiements utilisateur
router.get("/history", authMiddleware, async (req: AuthenticatedRequest, res) => {
  await paymentController.getUserPayments(req, res);
});

// Paiement par ID
router.get("/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  await paymentController.getPaymentById(req, res);
});

// Paiement par référence
router.get("/reference/:reference", authMiddleware, async (req: AuthenticatedRequest, res) => {
  await paymentController.getPaymentByReference(req, res);
});

export default router;
