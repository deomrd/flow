import { Router } from "express";
import { sendEmailVerification, verifyEmailOtpController  } from "../controllers/email.controller";
import { validateRequest } from "../middlewares/validateRequest";
import { emailVerificationSchema, verifyOtpSchema  } from "../validations/email.validation";

const router = Router();

router.post(
  "/send-email-verification",
  validateRequest(emailVerificationSchema),
  sendEmailVerification
);

router.post(
  "/verify-email-otp",
  validateRequest(verifyOtpSchema),
  verifyEmailOtpController
);

export default router;
