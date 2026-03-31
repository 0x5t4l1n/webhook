# Supabase Setup Guide

The webhook logger requires a `webhook_logs` table in Supabase. Follow these steps to set it up:

## Option 1: Automatic Setup (Recommended)

Run the setup script locally:
```bash
node create_table.js
```

This will:
- Create the `webhook_logs` table
- Create an index on `webhook_id` for fast queries
- Enable Row Level Security (RLS)
- Create policies allowing anonymous inserts and selects

## Option 2: Manual SQL Setup

If the script times out, manually run this SQL in your Supabase dashboard:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the SQL below:

```sql
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

CREATE POLICY "allow insert" ON webhook_logs FOR INSERT TO anon WITH CHECK (true)
ON CONFLICT DO NOTHING;

CREATE POLICY "allow select" ON webhook_logs FOR SELECT TO anon USING (true)
ON CONFLICT DO NOTHING;

CREATE POLICY "allow delete" ON webhook_logs FOR DELETE TO anon USING (true)
ON CONFLICT DO NOTHING;
```

5. Click **Run**
6. Refresh the webhook application at https://webhook.nexulean.info

## Verification

After setup, check that the table exists:
1. Go to Supabase Dashboard → **Table Editor**
2. You should see `webhook_logs` table listed
3. Test by sending a webhook request and checking if logs appear

## Troubleshooting

**Error: "Supabase client not initialized"**
- Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in Netlify environment variables
- Redeploy after adding them

**Error: "relation 'webhook_logs' does not exist"**
- Run the SQL setup above in the Supabase SQL editor

**Error: RLS policy violation**
- Check that the RLS policies allow `anon` role to insert/select
- Run the SQL setup above to recreate policies

## Environment Variables Required

In **Netlify Site Settings → Build & deploy → Environment**:
```
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from your Supabase project settings → **API** section.
