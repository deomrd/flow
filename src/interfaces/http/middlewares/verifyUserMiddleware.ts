
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.id_user) {
      return res.status(401).json({ success: false, error: 'Utilisateur non authentifié' });
    }

    const user = await prisma.users.findUnique({
      where: { id_user: req.user.id_user },
      select: { is_verified: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ success: false, error: 'Compte non vérifié' });
    }

    next();
  } catch (error) {
    console.error('Erreur middleware verifyUser:', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
};

export default verifyUser;
