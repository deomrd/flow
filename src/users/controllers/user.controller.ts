import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.middleware';

export const userController = {
  async register(req: Request, res: Response) {
    try {
      console.log("Corps de la requête reçu :", req.body);
      const result = await userService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      // Envoi une erreur 400 avec le message d'erreur précis (doublon ou autre)
      res.status(400).json({ error: error.message || "Erreur lors de l'inscription." });
    }
  },


  async login(req: Request, res: Response) {
    try {
      const result = await userService.login(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  async updateProfile(req: any, res: Response) {
    try {
      const userId = req.user.id_user;
      const result = await userService.updateProfile(userId, req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updatePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id_user;
      if (!userId) {
       res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      await userService.updatePassword(userId, req.body);
      res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },


  async searchUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const query = req.query.q as string;
      const excludeUserId = req.user?.id_user;

      if (!excludeUserId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
      }

      const users = await userService.searchUsers(query, excludeUserId);
      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Erreur serveur" });
    }
  },

  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const balance = await userService.getUserBalance(authReq.user!.id_user);
      res.status(200).json({ success: true, balance });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Erreur serveur" });
    }
  }









};
