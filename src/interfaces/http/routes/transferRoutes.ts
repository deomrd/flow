import { Router } from 'express';
import { transferController } from '../controllers/TransferController';
import authenticate from '../middlewares/authMiddleware';

const router = Router();

router.post('/transfer', authenticate, (req, res) => {
  console.log("Body received:", req.body); // Log pour debug
  transferController.transfer(req, res);
});

export default router;
