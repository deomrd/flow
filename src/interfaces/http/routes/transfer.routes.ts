import express from 'express';
import { transferMoney, getLastTransactions, getTransactionsSummary, getAllTransactions, lastContact } from '../controllers/transferController';
import authenticate from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/transfer', authenticate, transferMoney);

router.get('/recenttransactions', authenticate, getLastTransactions);

router.get('/resume30jours', authenticate, getTransactionsSummary);

router.get('/alltransactions', authenticate, getAllTransactions);

router.get('/lastcontact', authenticate, lastContact);

export default router;