const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Fail gracefully locally if env vars are missing
let supabase;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

function ensureSupabase() {
    if (!supabase) {
        const error = new Error('Supabase client not initialized. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are configured in Netlify environment variables.');
        console.error(error);
        throw error;
    }
}

async function saveLog(webhookId, requestData) {
    ensureSupabase();

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
    
    if (error) console.error('Error saving log:', error);
    return { data, error };
}

async function getLogs(webhookId) {
    ensureSupabase();

    const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('timestamp', { ascending: false });

    if (error) {
        console.error('Error getting logs:', error);
        throw error;
    }
    return data;
}

async function clearLogs(webhookId) {
    if (!supabase) return;

    const { error } = await supabase
        .from('webhook_logs')
        .delete()
        .eq('webhook_id', webhookId);
        
    if (error) console.error('Error clearing logs:', error);
}

async function deleteOldLogs(days) {
    if (!supabase) return;

    // Calculate timestamp threshold
    const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
        .from('webhook_logs')
        .delete()
        .lt('timestamp', dateThreshold);
        
    if (error) console.error('Error deleting old logs:', error);
}

module.exports = { saveLog, getLogs, clearLogs, deleteOldLogs };
