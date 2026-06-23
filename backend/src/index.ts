import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import 'express-async-errors'; 
import taskRoutes from './routes/task.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Montamos todo bajo /api
app.use('/api', taskRoutes);

app.listen(3000, '0.0.0.0', () => console.log('Servidor en puerto 3000'));