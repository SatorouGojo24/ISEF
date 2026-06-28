// backend/src/index.ts
import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import 'express-async-errors'; 
import taskRoutes from './routes/task.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import chatRoutes from './routes/chat.routes.js'; 
import { register, login } from './controllers/auth.controller.js'; 
import facturacionRoutes from './routes/facturacion.routes.js'; 
import { getPerfil, upsertPerfil } from './controllers/perfil.controller.js';
import { authenticateToken } from './middleware/authMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// Autenticación y Healthcheck
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Módulos Principales (Ajustados a '/api' para que coincidan con el Frontend)
app.use('/api', taskRoutes);
app.use('/api', chatRoutes); 
app.use('/api/payment', paymentRoutes);
app.use('/api/facturas', facturacionRoutes);

// Perfil Fiscal
app.get('/api/perfil', authenticateToken, getPerfil);
app.post('/api/perfil', authenticateToken, upsertPerfil);

app.listen(3000, '0.0.0.0', () => console.log('Servidor corriendo en puerto 3000'));