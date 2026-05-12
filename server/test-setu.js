const axios = require('axios');
require('dotenv').config({ path: 'c:/Users/Maha/OneDrive/Desktop/fin-ai-insights-main/server/.env' });

async function test() {
    const SETU_CLIENT_ID = process.env.SETU_CLIENT_ID;
    const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET;
    const SETU_PRODUCT_INSTANCE_ID = process.env.SETU_PRODUCT_INSTANCE_ID;
    const SETU_BASE_URL = process.env.SETU_BASE_URL || 'https://bridge.setu.co';

    console.log('ENV:', { SETU_CLIENT_ID, SETU_CLIENT_SECRET, SETU_PRODUCT_INSTANCE_ID });

    try {
        const payload = {
            Detail: {
                consentStart: new Date().toISOString(),
                consentExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                consentMode: 'STORE',
                fetchType: 'PERIODIC',
                consentTypes: ['TRANSACTIONS'],
                fiTypes: ['DEPOSIT'],
                DataConsumer: { id: 'setu-aa' },
                Customer: { id: '9999999999@setu' },
                Purpose: {
                    code: '101',
                    refUri: 'https://api.rebit.org.in/aa/purpose/101.xml',
                    text: 'Personal Finance Management'
                },
                Frequency: { value: 30, unit: 'DAY' },
                DataLife: { value: 6, unit: 'MONTH' },
                DataRange: {
                    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                    to: new Date().toISOString()
                },
                redirectUrl: 'http://localhost:8080/bank-connect'
            }
        };

        const response = await axios.post(SETU_BASE_URL + '/v2/consents', payload, {
            headers: {
                'x-client-id': SETU_CLIENT_ID,
                'x-client-secret': SETU_CLIENT_SECRET,
                'x-product-instance-id': SETU_PRODUCT_INSTANCE_ID,
                'Content-Type': 'application/json'
            }
        });
        console.log('Success:', response.data);
    } catch(e) {
        console.log('Error Status:', e.response?.status);
        console.log('Error Data:', JSON.stringify(e.response?.data, null, 2));
        console.log('Message:', e.message);
    }
}
test();
