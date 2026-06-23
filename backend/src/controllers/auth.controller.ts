import type { Request, Response } from 'express';
import { prisma } from '../services/task.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'tu_clave_secreta_super_segura'; // En producción, se estarían usando variables de entorno

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
        });
        res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
        res.status(400).json({ error: "El email ya está registrado o hubo un error." });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};