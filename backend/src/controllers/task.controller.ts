import type { Request, Response } from 'express';
import { TaskService } from '../services/task.service.js';

export const getTasks = async (req: Request, res: Response) => {
    res.json(await TaskService.getAll());
};

export const createTask = async (req: Request, res: Response) => {
    const { titulo, descripcion } = req.body;

    // Validación estricta: ambos campos deben tener contenido
    if (!titulo || titulo.trim() === "" || !descripcion || descripcion.trim() === "") {
        return res.status(400).json({ error: "El título y la descripción son obligatorios." });
    }

    try {
        const task = await TaskService.create({ titulo, descripcion });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: "Error interno al crear la tarea." });
    }
};

export const toggleTask = async (req: Request, res: Response) => {
    const task = await TaskService.toggle(req.params.id);
    task ? res.json(task) : res.status(404).json({ error: "Tarea no encontrada" });
};

export const editTask = async (req: Request, res: Response) => {
    const task = await TaskService.update(req.params.id, req.body);
    task ? res.json(task) : res.status(404).json({ error: "Tarea no encontrada" });
};

export const deleteTask = async (req: Request, res: Response) => {
    const success = await TaskService.delete(req.params.id);
    success ? res.status(204).send() : res.status(404).json({ error: "Tarea no encontrada" });
};