import express from "express";
import { handleTransfer, getTransferFees } from "../controllers/transfer.controller";
import { verifyPin } from "../middlewares/verifypin";
import { authMiddleware } from "../../users/middlewares/auth.middleware";


const router = express.Router();

router.post("/send", authMiddleware, verifyPin, handleTransfer);
router.get("/fees", authMiddleware, getTransferFees);


export default router;
