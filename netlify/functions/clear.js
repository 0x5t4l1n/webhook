const { clearLogs } = require('./db.js');

exports.handler = async (event, context) => {
    try {
        let webhookId = event.queryStringParameters && event.queryStringParameters.id;
        if (!webhookId) {
            const parts = event.path.split('/');
            webhookId = parts.pop();
        }

        if (!webhookId || webhookId === 'clear') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing webhook ID in path or query' })
            };
        }

        await clearLogs(webhookId);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
