import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { enviarFacturaAlPAC, descargarXMLDelPAC, descargarPDFDelPAC } from '../services/facturacion.service.js';

const prisma = new PrismaClient();

export const generarFactura = async (req: Request, res: Response) => {
    try {
        const userPayload = (req as any).user;
        const userId = userPayload?.id || userPayload?.userId || userPayload;

        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({ error: "Usuario no autenticado o token inválido." });
        }

        const perfil = await prisma.perfilFiscal.findUnique({
            where: { userId: userId }
        });

        if (!perfil) {
            return res.status(400).json({ 
                error: "Perfil fiscal no configurado." 
            });
        }

        const { conceptos } = req.body;

        if (!conceptos || conceptos.length === 0) {
            return res.status(400).json({ error: "La factura debe tener al menos un concepto" });
        }

        const itemsFacturama = conceptos.map((item: any) => {
            const unitPrice = Number(item.ValorUnitario || item.UnitPrice);
            const quantity = Number(item.Cantidad || item.Quantity);
            const subtotal = unitPrice * quantity;

            return {
                ProductCode: item.ProductCode || "01010101",
                Description: item.Descripcion || item.Description,
                Unit: item.Unit || "Servicio",
                UnitCode: item.UnitCode || "E48",
                UnitPrice: unitPrice,
                Quantity: quantity,
                Subtotal: subtotal,
                TaxTotal: 0,
                TaxObject: "01", 
                Total: subtotal  
            };
        });

        const payload = {
            ExpeditionPlace: perfil.codigoPostal.trim(),
            CfdiType: "I",
            PaymentForm: "31",
            PaymentMethod: "PUE",
            Issuer: {
                Rfc: "EKU9003173C9", 
                Name: "ESCUELA KEMPER URGATE", 
                FiscalRegime: "601" 
            },
            Receiver: {
                Rfc: perfil.rfc.trim(),
                Name: perfil.razonSocial.trim(),
                FiscalRegime: perfil.regimenFiscal.trim(),
                TaxZipCode: perfil.codigoPostal.trim(),
                CfdiUse: "G03"
            },
            Items: itemsFacturama
        };

        const response = await enviarFacturaAlPAC(payload);
        const dataPAC = response.data;

        const nuevaFactura = await prisma.factura.create({
            data: {
                id: dataPAC.Id,
                uuid: dataPAC.Complement.TaxStamp.Uuid,
                folio: dataPAC.Folio || "N/A",
                total: dataPAC.Total,
                userId: userId
            }
        });
        
        res.status(200).json({
            mensaje: "Factura generada con éxito",
            facturaLocal: nuevaFactura,
            pacResponse: dataPAC
        });

    } catch (error: any) {
        const errorDetallado = error.response?.data || error.message;
        console.error("Error al timbrar:", JSON.stringify(errorDetallado, null, 2));
        res.status(500).json({ 
            error: "Fallo en la comunicación con el PAC", 
            detalle: errorDetallado 
        });
    }
};

// --- ENDPOINT PARA DESCARGAR XML ---
export const obtenerXML = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; 
        const response = await descargarXMLDelPAC(id);
        
        const base64Content = response.data.Content;
        const buffer = Buffer.from(base64Content, 'base64'); 
        
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename=factura-${id}.xml`);
        
        return res.status(200).send(buffer); 
    } catch (error: any) {
        console.error("Error al descargar XML:", error.message);
        return res.status(500).json({ error: "No se pudo recuperar el XML" });
    }
};

// --- ENDPOINT PARA VER/DESCARGAR PDF ---
export const obtenerPDF = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const response = await descargarPDFDelPAC(id);
        
        const base64Content = response.data.Content;
        const buffer = Buffer.from(base64Content, 'base64');
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=factura-${id}.pdf`);
        
        return res.status(200).send(buffer);
    } catch (error: any) {
        console.error("Error al descargar PDF:", error.message);
        return res.status(500).json({ error: "No se pudo recuperar el PDF" });
    }
};

export const obtenerFacturasUsuario = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const facturas = await prisma.factura.findMany({
            where: { userId: userId },
            orderBy: { fecha: 'desc' }
        });
        return res.status(200).json(facturas);
    } catch (error) {
        return res.status(500).json({ error: "No se pudieron recuperar tus compras." });
    }
};