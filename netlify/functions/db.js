const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Fail gracefully locally if env vars are missing
let supabase;
if (supabaseUrl && supabaseKey) {
    console.log('Initializing Supabase client with URL:', supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.error('SUPABASE_URL or SUPABASE_ANON_KEY not set. URL:', supabaseUrl, 'Key present:', !!supabaseKey);
}

function ensureSupabase() {
    if (!supabase) {
        const error = new Error('Supabase client not initialized. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are configured in Netlify environment variables.');
        console.error('ensureSupabase error:', error.message);
        throw error;
    }
    console.log('Supabase client verified and ready');
}

async function saveLog(webhookId, requestData) {
    ensureSupabase();
    console.log(`saveLog called with webhookId: ${webhookId}, logId: ${requestData.id}`);

    const { data, error } = await supabase
        .from('webhook_logs')
        .insert([
            {
                id: requestData.id,
                webhook_id: webhookId,
                method: requestData.method,
                headers: requestData.headers,
                body: requestData.body,
                query_params: requestData.query_params,
                ip: requestData.ip,
                timestamp: requestData.timestamp || new Date().toISOString()
            }
        ]);
    
    if (error) {
        console.error('Supabase insert error:', error.code, error.message, error.details);
        return { data: null, error };
    }
    
    console.log('Successfully saved log:', requestData.id);
    return { data, error: null };
}

async function getLogs(webhookId) {
    ensureSupabase();
    console.log(`getLogs called for webhookId: ${webhookId}`);

    const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('timestamp', { ascending: false });

    if (error) {
        console.error('Supabase select error:', error.code, error.message, error.details);
        throw error;
    }
    
    console.log(`Retrieved ${data ? data.length : 0} logs for webhook ${webhookId}`);
    return data;
}

async function clearLogs(webhookId) {
    if (!supabase) {
        console.warn('Supabase not initialized, cannot clear logs for', webhookId);
        return;
    }

    console.log(`clearLogs called for webhookId: ${webhookId}`);
    const { error } = await supabase
        .from('webhook_logs')
        .delete()
        .eq('webhook_id', webhookId);
        
    if (error) {
        console.error('Error clearing logs:', error.code, error.message);
    } else {
        console.log('Successfully cleared logs for webhook:', webhookId);
    }
}

async function deleteOldLogs(days) {
    if (!supabase) {
        console.warn('Supabase not initialized, cannot delete old logs');
        return;
    }

    console.log(`deleteOldLogs called with days: ${days}`);
    const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
        .from('webhook_logs')
        .delete()
        .lt('timestamp', dateThreshold);
        
    if (error) {
        console.error('Error deleting old logs:', error.code, error.message);
    } else {
        console.log('Successfully deleted logs older than', days, 'days');
    }
}

module.exports = { saveLog, getLogs, clearLogs, deleteOldLogs };
