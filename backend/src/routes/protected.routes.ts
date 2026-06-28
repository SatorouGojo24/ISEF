import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Ejemplo de una ruta protegida
router.get('/mi-perfil', authenticateToken, (req, res) => {
    res.json({ message: "Bienvenido a tu perfil seguro", user: (req as any).user });
});

// Puedes agregar tantas rutas como quieras aquí
// router.get('/mis-tareas', authenticateToken, getTasks);

export default router;