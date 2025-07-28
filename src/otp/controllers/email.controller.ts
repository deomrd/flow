import { Request, Response } from "express";
import { processEmailVerification, validateEmailOtp } from "../services/email.service";

export const sendEmailVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const result = await processEmailVerification(email);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const verifyEmailOtpController = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const result = await validateEmailOtp(email, otp);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
