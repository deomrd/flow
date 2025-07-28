import express from "express";
import { handleWithdrawal, handleFees } from "../controllers/retrait.controller";
import { authMiddleware } from "../../users/middlewares/auth.middleware";
import { verifyPin } from "../../transfer/middlewares/verifypin";

const router = express.Router();

router.get("/fees", authMiddleware, handleFees);
router.post("/create", authMiddleware, verifyPin, handleWithdrawal);

export default router;
