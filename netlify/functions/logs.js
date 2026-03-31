const { getLogs } = require('./db.js');

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    return lastSegment === 'logs' ? null : lastSegment;
}

exports.handler = async (event, context) => {
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
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Missing webhook ID in path or query' })
            };
        }

        const logs = await getLogs(webhookId);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(logs)
        };
    } catch (error) {
        console.error('Error fetching logs:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: error.message || 'Internal server error' })
        };
    }
};
