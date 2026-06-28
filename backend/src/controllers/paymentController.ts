import type { Request, Response } from 'express';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { paypalClient } from '../config/paypal.js';

export const createOrder = async (req: Request, res: Response) => {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'MXN',
                value: '100.00' 
            }
        }]
    });

    try {
        const client = paypalClient();
        const order = await client.execute(request);
        res.status(201).json({ id: order.result.id });
    } catch (err: any) {
        console.error("Error de PayPal:", JSON.stringify(err, null, 2));
        res.status(500).json({ error: "Error al crear la orden de pago" });
    }
};