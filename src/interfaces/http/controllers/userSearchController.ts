import { Request, Response } from 'express';
import { SearchUsersUseCase } from '../../../usecases/user/SearchUsersUseCase';

const searchUsersUseCase = new SearchUsersUseCase();

export class UserController {
  static async search(req: Request, res: Response) {
    const { q } = req.query;
    const userId = req.user?.id_user;
    console.log('UserId connecté:', userId);

    if (typeof q !== 'string' || q.length < 2) {
      return res.status(400).json({ error: 'Requête trop courte' });
    }

    try {
      const users = await searchUsersUseCase.execute(q, userId);
      const formatted = users.map((u) => ({
        id: u.id_user,
        username: u.username,
        email: u.email,
        phone: u.phone,
        full_name: u.userprofiles[0]?.full_name ?? '',
      }));
      res.json(formatted);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}
