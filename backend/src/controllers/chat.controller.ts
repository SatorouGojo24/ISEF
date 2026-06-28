import type { Request, Response } from 'express';

export const chatHandler = async (req: Request, res: Response) => {
    console.log("¡Diagnosticando modelos de la API...");
    const { message } = req.body;
    
    if (!message) return res.status(400).json({ error: "Mensaje vacío" });

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Falta la API Key en el .env");

        // 1. Listar modelos autorizados
        const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const listData = await listResponse.json();
        
        if (!listData.models) {
            return res.status(500).json({ error: "Llave inválida o sin modelos asignados." });
        }

        // 2. Ordenar modelos: Primero los flash, luego los demás
        const modelosDisponibles = listData.models
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
            .sort((a: any, b: any) => a.name.includes("flash") ? -1 : 1);

        let chatData;
        let success = false;

        // 3. Intentar con modelos en orden hasta que uno responda (evitando el 503)
        for (const m of modelosDisponibles) {
            const modelName = m.name.replace("models/", "");
            console.log(`Intentando con modelo: ${modelName}...`);
            
            try {
                const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
                });

                chatData = await chatResponse.json();
                
                if (chatResponse.ok) {
                    success = true;
                    break; // ¡Éxito! Salimos del bucle
                } else if (chatResponse.status === 503) {
                    console.warn(`Modelo ${modelName} saturado (503), probando siguiente...`);
                    continue; // Intentar con el siguiente modelo
                } else {
                    console.error(`Modelo ${modelName} falló con error ${chatResponse.status}:`, chatData);
                }
            } catch (err) {
                console.error(`Error de red con ${modelName}:`, err);
            }
        }

        if (!success) {
            return res.status(503).json({ error: "Todos los modelos están saturados. Intenta en unos segundos." });
        }

        const reply = chatData.candidates[0].content.parts[0].text;
        res.json({ reply });

    } catch (error: any) {
        console.error("Error técnico general:", error.message || error);
        res.status(500).json({ error: "Error interno al conectar con la IA" });
    }
};