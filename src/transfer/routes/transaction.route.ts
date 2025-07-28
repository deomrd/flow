import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";
import { authMiddleware } from "../../users/middlewares/auth.middleware";
import { validateTransfer } from "../validations/transaction.validation";

const router = Router();

router.get("/last", authMiddleware, (req, res, next) =>
  TransactionController.getLastTransactions(req, res).catch(next)
);
router.get("/summary", authMiddleware, (req, res, next) =>
  TransactionController.getTransactionsSummary(req, res).catch(next)
);
router.get("/all", authMiddleware, (req, res, next) =>
  TransactionController.getAllTransactions(req, res).catch(next)
);
router.get("/contacts", authMiddleware, (req, res, next) =>
  TransactionController.lastContact(req, res).catch(next)
);


export default router;
