const { saveLog } = require('./db.js');
const { randomUUID } = require('crypto');

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function extractWebhookId(event) {
    if (event.queryStringParameters && event.queryStringParameters.id) {
        return event.queryStringParameters.id;
    }

    if (!event.path) return null;
    const parts = event.path.split('/').filter(Boolean);
    if (parts.length === 0) return null;

    const lastSegment = parts[parts.length - 1];
    return lastSegment === 'webhook' ? null : lastSegment;
}

exports.handler = async (event, context) => {
    console.log('Incoming request event path:', event.path);

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: CORS_HEADERS,
            body: ''
        };
    }

    try {
        const webhookId = extractWebhookId(event);
        if (!webhookId) {
            console.error('Webhook ID missing, event.path=', event.path, 'query=', event.queryStringParameters);
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Missing webhook ID in path or query' })
            };
        }

        let requestBody = event.body;
        if (event.isBase64Encoded && requestBody) {
            requestBody = Buffer.from(requestBody, 'base64').toString('utf8');
        }

        console.log('Incoming request details:', JSON.stringify({
            method: event.httpMethod,
            path: event.path,
            headers: event.headers,
            query: event.queryStringParameters,
            body: requestBody || null,
            isBase64Encoded: event.isBase64Encoded
        }));

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
        const result = await saveLog(webhookId, requestData);
        if (result.error) {
            console.error('Failed to save log:', result.error);
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: false, error: 'Failed to save webhook log' })
            };
        }

        console.log(`Successfully saved log ${logId} for webhook ${webhookId}.`);
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, webhookId, logId })
        };
    } catch (error) {
        console.error('Error handling webhook request:', error);
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: false, error: error.message || 'Internal server error' })
        };
    }
};
