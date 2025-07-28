import { Request, Response, NextFunction } from "express";
import { CreateWithdrawalSchema, FeesQuerySchema } from "../validations/retrait.validation";
import { createWithdrawal } from "../services/retrait.service";
import { ModeRetrait, calculateFees } from "../utils/retrait.util";

export const handleFees = (req: Request, res: Response, next: NextFunction): void => {
  const result = FeesQuerySchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({
      message: "Paramètres invalides",
      errors: result.error.issues
    });
    return;
  }

  const { amount, mode } = result.data;
  const fees = calculateFees(amount, mode);
  res.json(fees);
};

export const handleWithdrawal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const result = CreateWithdrawalSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: "Données invalides",
      errors: result.error.issues
    });
    return;
  }

  const { amount, pin, mode, recipientPhone } = result.data;
  const userId = (req.user as any).id_user;

  const { fees } = calculateFees(amount, mode);

  try {
    const data = await createWithdrawal({
      userId,
      amount,
      fees,
      mode,
      pin,
      recipientPhone: mode === ModeRetrait.MOBILE ? recipientPhone : undefined,
    });

    res.status(201).json({
      message: "Retrait effectué",
      data
    });
  } catch (err: any) {
    res.status(400).json({
      message: err.message || "Une erreur est survenue"
    });
  }
};
