import { Router } from 'express';
import { 
    generarFactura, 
    obtenerXML, 
    obtenerPDF,
    obtenerFacturasUsuario 
} from '../controllers/facturacion.controller.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Ruta para emitir y guardar factura (Protegida)
router.post('/generar', authenticateToken, generarFactura);

// Rutas para acceder a los archivos generados (Protegidas)
router.get('/:id/xml', authenticateToken, obtenerXML);
router.get('/:id/pdf', authenticateToken, obtenerPDF);
router.get('/mis-compras', authenticateToken, obtenerFacturasUsuario);

export default router;