import { Router } from 'express';
import { getTasks, createTask, toggleTask, editTask, deleteTask } from '../controllers/task.controller.js';
import { register, login } from '../controllers/auth.controller.js';

const router = Router({ strict: false });

// Rutas de tareas
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.patch('/tasks/:id', toggleTask);
router.put('/tasks/:id', editTask);
router.delete('/tasks/:id', deleteTask);

// Rutas de Auth
router.post('/auth/register', register);
router.post('/auth/login', login);

export default router;