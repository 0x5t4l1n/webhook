const { clearLogs } = require('./db.js');

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    return lastSegment === 'clear' ? null : lastSegment;
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

        await clearLogs(webhookId);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error('Error clearing logs:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: error.message || 'Internal server error' })
        };
    }
};
