import express from 'express';
import { transferMoney } from '../controllers/transferController';
import authenticate from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/transfer', authenticate, transferMoney);

export default router;