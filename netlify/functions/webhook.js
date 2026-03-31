const { saveLog } = require('./db.js');
const { randomUUID } = require('crypto');

exports.handler = async (event, context) => {
    // Debug log to Netlify dashboard
    console.log('Incoming request event path:', event.path);

    try {
        // Support both query param `?id=` and path `/.netlify/functions/webhook/{id}`
        let webhookId = event.queryStringParameters && event.queryStringParameters.id;
        
        if (!webhookId) {
            // Extract from path
            const parts = event.path.split('/');
            webhookId = parts.pop();
        }

        if (!webhookId || webhookId === 'webhook') {
            return {
                statusCode: 400,
                body: "Missing webhook ID in path or query"
            };
        }

        // Extract metadata for the log
        let requestBody = event.body;
        if (event.isBase64Encoded && !!requestBody) {
            requestBody = Buffer.from(requestBody, 'base64').toString('utf8');
        }

        const logId = randomUUID();
        const requestData = {
            id: logId,
            method: event.httpMethod,
            headers: event.headers,
            body: requestBody || '',
            query_params: event.queryStringParameters || {},
            ip: event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown',
            timestamp: new Date().toISOString()
        };

        console.log(`Saving log ${logId} for webhook ${webhookId}...`);

        // Save to DB
        await saveLog(webhookId, requestData);

        console.log(`Successfully saved log ${logId} for webhook ${webhookId}.`);

    } catch (error) {
        console.error('Error handling webhook request:', error);
    }
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        },
        body: 'OK'
    };
};
