// src/interfaces/http/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UnauthorizedError } from '../../../utils/errors';

const prisma = new PrismaClient();

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedError('Authentification requise');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
        
        const user = await prisma.users.findUnique({
            where: { id_user: decoded.userId },
            select: {
                id_user: true,
                username: true,
                email: true,
                phone: true,
                role: true
            }
        });

        if (!user) {
            throw new UnauthorizedError('Utilisateur non trouvé');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ success: false, error: 'Token invalide' });
        }
        if (error instanceof UnauthorizedError) {
            return res.status(401).json({ success: false, error: error.message });
        }
        console.error(error);
        return res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
};

export default authenticate;