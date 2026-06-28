import { Router } from 'express';
import { chatHandler } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/chat', authenticateToken, chatHandler);

export default router;