const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL || 'postgresql://postgres:12345678@12345678Azsx@123azsx@db.lkydtbeflrvxpcavllqh.supabase.co:5432/postgres'
});

async function run() {
    try {
        await client.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS webhook_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                webhook_id TEXT NOT NULL,
                method TEXT NOT NULL,
                headers JSONB,
                body TEXT,
                query_params JSONB,
                ip TEXT,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_webhook_id ON webhook_logs(webhook_id);

            ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
            
            DO $$ BEGIN
                CREATE POLICY "allow insert" ON webhook_logs FOR INSERT TO anon WITH CHECK (true);
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            DO $$ BEGIN
                CREATE POLICY "allow select" ON webhook_logs FOR SELECT TO anon USING (true);
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            DO $$ BEGIN
                CREATE POLICY "allow delete" ON webhook_logs FOR DELETE TO anon USING (true);
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log("Table 'webhook_logs' initialized successfully.");
    } catch (e) {
        console.error("Error creating table:", e);
    } finally {
        await client.end();
    }
}

run();
