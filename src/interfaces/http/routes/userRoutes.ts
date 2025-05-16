import express from 'express';
import { userController } from '../controllers/userController';
import authenticate from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', (req, res) => {
  console.log("Body received:", req.body); // Log pour débogage
  userController.register(req, res);
});

router.post('/login', (req, res) => {
  console.log("Body received:", req.body); // Log pour débogage
  userController.login(req, res);
});

// Routes protégées
router.post('/logout', authenticate, (req, res) => userController.logout(req, res));
router.get('/me', authenticate, (req, res) => userController.getProfile(req, res));

export default router;