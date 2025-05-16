import { Request, Response } from 'express';
import { SearchUsersUseCase } from '../../../usecases/user/SearchUsersUseCase';

const searchUsersUseCase = new SearchUsersUseCase();

export class UserController {
  static async search(req: Request, res: Response) {
    const { q } = req.query;

    if (typeof q !== 'string' || q.length < 2) {
      return res.status(400).json({ error: 'Requête trop courte' });
    }

    try {
      const users = await searchUsersUseCase.execute(q);
      const formatted = users.map((u) => ({
        id: u.id_user,
        username: u.username,
        email: u.email,
        phone: u.phone,
        full_name: u.userprofiles[0]?.full_name ?? '',
      }));
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}
