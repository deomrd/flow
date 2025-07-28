import { Router } from "express";
import {
  sendPhoneOtp,
  verifyPhoneOtp,
} from "../controllers/phoneVerification.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { phoneOtpSchema } from "../validations/phoneOtp.validation";

const router = Router();

router.post("/send-otp", sendPhoneOtp);
router.post("/verify-otp", validateRequest(phoneOtpSchema), verifyPhoneOtp);

export default router;
