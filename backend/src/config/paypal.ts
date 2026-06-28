import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

const clientId = process.env.PAYPAL_CLIENT_ID || "";
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";

// Configuración del entorno
const environment = new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);

export const paypalClient = () => new checkoutNodeJssdk.core.PayPalHttpClient(environment);