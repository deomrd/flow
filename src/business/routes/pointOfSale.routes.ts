import { Router } from 'express';
import * as pointOfSaleController from '../controllers/pointOfSale.controller';
import { verifyBoss } from '../middleware/verifyBoss.middleware';
import { authMiddleware } from '../middleware/auth.middleware';


const router = Router();

router.post('/create', authMiddleware, verifyBoss, pointOfSaleController.createPointOfSale);
router.put('/:id', authMiddleware, verifyBoss, pointOfSaleController.updatePointOfSale);
router.delete('/:id', authMiddleware, verifyBoss, pointOfSaleController.deletePointOfSale);
router.get('/business/:businessId', authMiddleware, verifyBoss, pointOfSaleController.getPointsOfSaleByBusiness);
router.get('/business/:businessId/pointOfSale/:pointOfSaleId', authMiddleware, verifyBoss, pointOfSaleController.getPointOfSaleByBusiness);

export default router;
