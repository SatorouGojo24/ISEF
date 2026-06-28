import axios from 'axios';

const user = "Roberto09";
const pass = "Mexico2024";
const credentialsBase64 = Buffer.from(`${user}:${pass}`).toString('base64');

async function getBranches() {
    try {
        const response = await axios.get('https://apisandbox.facturama.mx/api/branches', {
            headers: {
                'Authorization': `Basic ${credentialsBase64}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("SUCURSALES CONFIGURADAS:", JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error("ERROR:", error.response?.data || error.message);
    }
}

getBranches();