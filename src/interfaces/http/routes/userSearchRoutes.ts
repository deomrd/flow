import { Router } from 'express';
import { UserController } from '../controllers/userSearchController';

const router = Router();

router.get('/search', UserController.search);

export default router;
