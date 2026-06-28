import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log("Middleware: No se recibió token");
        return res.status(401).json({ message: "Acceso denegado" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = verified;
        next();
    } catch (err) {
        console.log("Middleware: Token inválido");
        return res.status(403).json({ message: "Token inválido o expirado" });
    }
};