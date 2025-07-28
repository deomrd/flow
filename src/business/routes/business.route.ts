import express from 'express';
import { createBusiness, getMyBusiness  } from '../controllers/business.controller';
import { verifyBoss } from '../middleware/verifyBoss.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { BusinessType } from '../enum/businessType.enum';


const router = express.Router();

router.post('/create', createBusiness);
router.get('/my-business', authMiddleware, verifyBoss, getMyBusiness);
router.get('/business-types', (req, res) => {
  const types = Object.values(BusinessType);
  res.json(types);
});

export default router;
