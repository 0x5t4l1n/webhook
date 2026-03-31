const { getLogs } = require('./db.js');

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function extractWebhookId(event) {
    if (event.queryStringParameters && event.queryStringParameters.id) {
        console.log('Extracted webhookId from query:', event.queryStringParameters.id);
        return event.queryStringParameters.id;
    }

    if (!event.path) return null;
    const parts = event.path.split('/').filter(Boolean);
    if (parts.length === 0) return null;

    const lastSegment = parts[parts.length - 1];
    console.log('Path parts:', parts, 'Last segment:', lastSegment);
    return lastSegment === 'logs' ? null : lastSegment;
}

exports.handler = async (event, context) => {
    console.log('logs.handler invoked with path:', event.path, 'query:', event.queryStringParameters);
    
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: CORS_HEADERS,
            body: ''
        };
    }

    try {
        const webhookId = extractWebhookId(event);
        console.log('Extracted webhookId:', webhookId);
        
        if (!webhookId) {
            console.error('No webhookId found');
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Missing webhook ID in path or query', received: { path: event.path, query: event.queryStringParameters } })
            };
        }

        console.log('Fetching logs for webhook:', webhookId);
        const logs = await getLogs(webhookId);
        console.log('Successfully retrieved', logs ? logs.length : 0, 'logs');

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(logs || [])
        };
    } catch (error) {
        console.error('Error in logs.handler:', error.message, error.stack);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: error.message || 'Internal server error', details: error.toString() })
        };
    }
};
