import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const verifyPin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { pin } = req.body;
    const user = req.user;

    const hashedPin = await bcrypt.hash(pin, 10);

    if (!user || !user.id_user) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    if (typeof pin !== "string" || pin.trim() === "") {
      res.status(400).json({ message: "Code PIN manquant ou invalide" });
      return;
    }

    const dbUser = await prisma.users.findUnique({
      where: { id_user: user.id_user },
    });

    console.log("PIN haché stocké :", dbUser?.pin);

    if (!dbUser || typeof dbUser.pin !== "string") {
      res.status(403).json({ message: "Utilisateur introuvable ou PIN non défini" });
      return;
    }

    const isValid = await bcrypt.compare(pin, dbUser.pin);

    if (!isValid) {
      res.status(403).json({ message: "Code PIN incorrect" });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
