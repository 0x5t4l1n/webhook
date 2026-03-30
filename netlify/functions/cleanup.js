const { schedule } = require('@netlify/functions');
const { deleteOldLogs } = require('./db.js');

const handler = async (event, context) => {
    try {
        console.log('Running automatic log cleanup...');
        
        // Delete logs older than 7 days
        await deleteOldLogs(7);

        console.log('Cleanup finished.');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Cleanup executed successfully." })
        };
    } catch (error) {
        console.error('Error running log cleanup:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Scheduled for daily at midnight UTC
exports.handler = schedule("0 0 * * *", handler);
