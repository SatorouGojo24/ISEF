import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función auxiliar para extraer el ID de forma segura
const getUserIdFromRequest = (req: Request): string | null => {
    const user = (req as any).user;
    if (!user) return null;
    // Soporta si en el token lo guardaste como { id: "..." } o { userId: "..." }
    return user.id || user.userId || user; 
};

export const getPerfil = async (req: Request, res: Response) => {
    try {
        const userId = getUserIdFromRequest(req);

        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({ error: "No se pudo identificar al usuario desde el token" });
        }

        const perfil = await prisma.perfilFiscal.findUnique({
            where: { userId: userId }
        });

        // Si no tiene perfil aún, devolvemos un objeto vacío en lugar de un error
        if (!perfil) {
            return res.status(200).json({}); 
        }

        res.status(200).json(perfil);
    } catch (error: any) {
        console.error("Error al obtener perfil:", error.message);
        res.status(500).json({ error: "Error interno del servidor al obtener el perfil" });
    }
};

export const upsertPerfil = async (req: Request, res: Response) => {
    try {
        const userId = getUserIdFromRequest(req);

        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({ error: "No se pudo identificar al usuario desde el token" });
        }

        const { rfc, razonSocial, regimenFiscal, codigoPostal } = req.body;

        const perfil = await prisma.perfilFiscal.upsert({
            where: { userId: userId },
            update: { rfc, razonSocial, regimenFiscal, codigoPostal },
            create: { rfc, razonSocial, regimenFiscal, codigoPostal, userId: userId }
        });

        res.status(200).json({ message: "Perfil guardado con éxito", perfil });
    } catch (error: any) {
        console.error("Error al guardar perfil:", error.message);
        res.status(500).json({ error: "Error al guardar perfil en la base de datos" });
    }
};