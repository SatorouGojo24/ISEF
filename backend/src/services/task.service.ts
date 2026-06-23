import { PrismaClient } from '@prisma/client';
import type { Task } from '../models/task.model.js';

export const prisma = new PrismaClient(); 

export const TaskService = {
    getAll: async (): Promise<Task[]> => await prisma.task.findMany({ orderBy: { fecha_creacion: 'desc' } }),
    
    create: async (data: { titulo: string; descripcion: string }): Promise<Task> => {
        return await prisma.task.create({ 
            data: { titulo: data.titulo, descripcion: data.descripcion } 
        });
    },

    update: async (id: string, data: { titulo?: string; descripcion?: string }): Promise<Task | null> => {
        try { return await prisma.task.update({ where: { id }, data }); } catch { return null; }
    },

    toggle: async (id: string): Promise<Task | null> => {
        try {
            const task = await prisma.task.findUnique({ where: { id } });
            if (!task) return null;
            return await prisma.task.update({ where: { id }, data: { estado: !task.estado } });
        } catch { return null; }
    },

    delete: async (id: string): Promise<boolean> => {
        try { await prisma.task.delete({ where: { id } }); return true; } catch { return false; }
    }
};