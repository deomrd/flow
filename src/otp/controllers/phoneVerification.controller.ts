import { Request, Response } from "express";
import {
  sendPhoneVerificationOtp,
  validatePhoneOtp,
} from "../services/phoneVerification.service";

export const sendPhoneOtp = async (req: Request, res: Response) => {
  const { phone } = req.body;
  try {
    const result = await sendPhoneVerificationOtp(phone);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyPhoneOtp = async (req: Request, res: Response) => {
  const { phone, otpCode } = req.body;
  try {
    const result = await validatePhoneOtp(phone, otpCode);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
