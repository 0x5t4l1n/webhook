# 🚀 Complete Deployment Guide

## Prerequisites
- Netlify account with site deployed
- Supabase project created
- Your site URL (e.g., webhook.nexulean.info)

---

## Step 1: Create Supabase Table (CRITICAL)

⚠️ **This MUST be done first or webhooks won't be stored**

### Option A: SQL Editor (Easiest)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Paste this SQL:

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

DO $$ BEGIN
    CREATE POLICY "allow insert" ON webhook_logs FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "allow select" ON webhook_logs FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "allow delete" ON webhook_logs FOR DELETE TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
```

5. Click **Run**
6. Verify: Go to **Table Editor** → You should see `webhook_logs` table

### Option B: psql (If you have PostgreSQL)
```bash
# Get the connection string from Supabase dashboard
# Then run the SQL file:
psql "postgresql://..." < create_table.sql
```

---

## Step 2: Set Netlify Environment Variables (CRITICAL)

✅ **This is required for production to work**

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your **webhook** site
3. Click **Site settings** → **Build & deploy** → **Environment**
4. Add these variables:
   - **Key:** `SUPABASE_URL` | **Value:** `https://lkydtbeflrvxpcavllqh.supabase.co`
   - **Key:** `SUPABASE_ANON_KEY` | **Value:** `sb_publishable_aS_c3Ov60SQi2-hCL50lDA_fZmklEiI`

5. Click **Deploy site** to redeploy with the new env vars

⏳ **Wait 2-3 minutes** for the deploy to complete.

---

## Step 3: Test the Webhook

### Test from Browser (Recommended)

1. Go to https://webhook.nexulean.info
2. Click **Generate Endpoint** - copy the webhook URL
3. Open **Developer Console** (F12 → Console)
4. Send a test request:
   ```javascript
   fetch('/api/webhook/test-webhook-123', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ test: 'data', timestamp: new Date().toISOString() })
   }).then(r => r.json()).then(console.log).catch(console.error)
   ```

5. Expected response:
   ```javascript
   {success: true, webhookId: "test-webhook-123", logId: "uuid-here"}
   ```

6. Refresh the page - the request should appear in the **Request Log**

### Test from Terminal

Use the browser console method first - terminal requests are blocked by Cloudflare challenge.

---

## Step 4: Verify Logs Appear

1. After sending test requests, go to the dashboard at https://webhook.nexulean.info
2. Generate a webhook ID and look at the **Request Log**
3. You should see entries like:
   - **Method:** POST
   - **Time:** (timestamp)
4. Click on a request to see full details

---

## Troubleshooting

### ❌ Error: "Supabase client not initialized"
**Solution:** Netlify env vars aren't set
- Go to **Site settings** → **Build & deploy** → **Environment**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are present
- Click **Deploy site** to redeploy

### ❌ Error: "relation 'webhook_logs' does not exist"
**Solution:** Table wasn't created
- Go to Supabase → **Table Editor**
- Check if `webhook_logs` exists
- If not, run the SQL from Step 1

### ❌ No logs appearing
**Solution:** 
1. Open **F12 Console** and look for errors
2. Check **Netlify Functions** logs at https://app.netlify.com → Site → Logs → Functions
3. Verify POST requests are returning `{success: true, ...}`

### ❌ Getting Cloudflare challenge on curl/Postman
**Solution:** Use browser console instead (it handles the challenge automatically)

---

## Verification Checklist

Before going to production, verify:

- [ ] Supabase table `webhook_logs` created
- [ ] Netlify env vars `SUPABASE_URL` and `SUPABASE_ANON_KEY` set
- [ ] Site redeployed after env vars
- [ ] Test webhook returns `{success: true, ...}`
- [ ] Logs appear in the dashboard UI
- [ ] Can click on logs and see full request details
- [ ] Clear button works

---

## Production Usage

Once verified, you can use webhooks with services like:
- GitHub webhooks
- Stripe payment events
- SendGrid email events
- Any service that can POST to your webhook URL

**Example webhook URL format:**
```
https://webhook.nexulean.info/api/webhook/{your-unique-id}
```

Send a POST request with any JSON payload, and it will be logged and visible in the dashboard.

---

## Support

If issues persist:
1. Check browser console (F12) for client-side errors
2. Check Netlify function logs for server errors
3. Check Supabase table exists and has the correct schema
4. Verify environment variables are correctly set in Netlify
