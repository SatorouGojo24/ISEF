import { Router } from 'express';
import { getTasks, createTask, toggleTask, editTask, deleteTask } from '../controllers/task.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Rutas protegidas
router.get('/tasks', authenticateToken, getTasks);
router.post('/tasks', authenticateToken, createTask);
router.patch('/tasks/:id', authenticateToken, toggleTask);
router.put('/tasks/:id', authenticateToken, editTask);
router.delete('/tasks/:id', authenticateToken, deleteTask);

export default router;