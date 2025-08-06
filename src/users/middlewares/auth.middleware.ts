import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// On étend Request d'Express pour ajouter le user dans req
export interface AuthenticatedRequest extends Request {
  user?: {
    id_user: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    is_verified?: boolean;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token manquant ou invalide" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id_user: string;
      username: string;
      email: string;
      phone: string;
      role: string;
      is_verified: boolean;
    };

    // DEBUG : Affiche le contenu décodé pour vérifier le token
    console.log('Token décodé :', decoded);

    // Vérifie que id_user est présent (champ obligatoire)
    if (!decoded.id_user) {
       res.status(401).json({ message: "Token invalide : id_user manquant" });
       return;
    }

    req.user = {
      id_user: decoded.id_user,
      username: decoded.username,
      email: decoded.email,
      phone: decoded.phone,
      role: decoded.role,
      is_verified: decoded.is_verified
    };

    next(); // token valide, on continue la chaîne middleware
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};
