import { Router } from 'express';
import { createOrder } from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/create-order', authenticateToken, createOrder);
export default router;