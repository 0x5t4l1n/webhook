const { getLogs } = require('./db.js');

exports.handler = async (event, context) => {
    try {
        let webhookId = event.queryStringParameters && event.queryStringParameters.id;
        if (!webhookId) {
            const parts = event.path.split('/');
            webhookId = parts.pop();
        }

        if (!webhookId || webhookId === 'logs') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing webhook ID in path or query' })
            };
        }

        const logs = await getLogs(webhookId);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(logs)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
