import axios from 'axios';

const obtenerHeadersAuth = () => {
    const user = process.env.FACTURAMA_API_USER!;
    const pass = process.env.FACTURAMA_API_PASS!;
    const credentialsBase64 = Buffer.from(`${user}:${pass}`).toString('base64');
    
    return {
        'Authorization': `Basic ${credentialsBase64}`
    };
};

export const enviarFacturaAlPAC = async (data: any) => {
    const URL = 'https://apisandbox.facturama.mx/api/3/cfdis';
    
    console.log("Intentando timbrar con el USUARIO:", process.env.FACTURAMA_API_USER);
    
    return await axios.post(URL, data, {
        headers: {
            ...obtenerHeadersAuth(),
            'Content-Type': 'application/json'
        },
        timeout: 10000 
    });
};

export const descargarXMLDelPAC = async (facturamaId: string) => {
    // Agregamos el /api/ que faltaba
    const URL = `https://apisandbox.facturama.mx/api/cfdi/xml/issued/${facturamaId}`;
    return await axios.get(URL, { headers: obtenerHeadersAuth() });
};

export const descargarPDFDelPAC = async (facturamaId: string) => {
    // Agregamos el /api/ que faltaba
    const URL = `https://apisandbox.facturama.mx/api/cfdi/pdf/issued/${facturamaId}`;
    return await axios.get(URL, { headers: obtenerHeadersAuth() });
};