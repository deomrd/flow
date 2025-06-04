import express from 'express';
import { transferMoney } from '../controllers/transferController';
import authenticate from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/transactions/recent', authMiddleware, getLastTransactions);

export default router;
