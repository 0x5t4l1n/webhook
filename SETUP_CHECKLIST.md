# ✅ Setup Checklist

Complete these steps in order to get your webhook logger working in production.

---

## 🟢 Step 1: Create Supabase Database Table

**Status:** [ ] Not done | [x] Complete

### What to do:
1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Copy the entire SQL block from [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
5. Paste it and click **Run**
6. Verify: Go to **Table Editor** → You should see `webhook_logs` table

### How to verify:
- [ ] `webhook_logs` table appears in Table Editor
- [ ] Table has columns: `id`, `webhook_id`, `method`, `headers`, `body`, `query_params`, `ip`, `timestamp`
- [ ] Clicking on table shows 0 rows (empty)

---

## 🟡 Step 2: Set Netlify Environment Variables

**Status:** [ ] Not done | [ ] Complete

### What to do:
1. Go to https://app.netlify.com
2. Select your **webhook** site
3. Click **Site settings** (top menu)
4. Go to **Build & deploy** → **Environment** (left sidebar)
5. Click **Add variable** twice and add:
   - **Variable 1:**
     - Key: `SUPABASE_URL`
     - Value: `https://lkydtbeflrvxpcavllqh.supabase.co`
   - **Variable 2:**
     - Key: `SUPABASE_ANON_KEY`
     - Value: `sb_publishable_aS_c3Ov60SQi2-hCL50lDA_fZmklEiI`
6. Click **Deploy site** button
7. Wait 2-3 minutes for deployment to complete

### How to verify:
- [ ] Variables appear in Netlify environment settings
- [ ] Deploy completes successfully
- [ ] Production URL shows green checkmark

---

## 🟢 Step 3: Test the Webhook (From Browser)

**Status:** [ ] Not done | [ ] Complete

### What to do:
1. Go to https://webhook.nexulean.info (or your production URL)
2. Click **Generate Endpoint** button
3. Copy the webhook URL shown
4. Open browser console (Press **F12** on keyboard)
5. Click the **Console** tab
6. Paste this code:
   ```javascript
   fetch('/api/webhook/test-webhook-123', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ test: 'data', timestamp: new Date().toISOString() })
   }).then(r => r.json()).then(d => console.log('Response:', d)).catch(e => console.error('Error:', e))
   ```
7. Press Enter
8. You should see in console:
   ```
   Response: {success: true, webhookId: "test-webhook-123", logId: "some-uuid"}
   ```

### How to verify:
- [ ] No error messages in console
- [ ] Response shows `success: true`
- [ ] Response includes a `logId`
- [ ] Refresh the page
- [ ] A new request appears in the **Request Log** section

---

## 🟢 Step 4: Verify Logs Display in Dashboard

**Status:** [ ] Not done | [ ] Complete

### What to do:
1. You should still be on https://webhook.nexulean.info
2. Look at the **Request Log** panel on the right
3. You should see your test request listed with:
   - Method: **POST**
   - Timestamp: **(current time)**
4. Click on the request to see full details:
   - Headers
   - Body
   - IP address
   - Query parameters

### How to verify:
- [ ] Request appears in log with correct method and timestamp
- [ ] Clicking shows full request details
- [ ] Clear button works (removes all logs for that endpoint)

---

## 🎉 All Done!

If all checks pass, your webhook logger is **production ready**! ✅

### Next Steps:
- Copy your webhook URL and use it with external services (GitHub, Stripe, SendGrid, etc.)
- Any POST request to `https://webhook.nexulean.info/api/webhook/{your-id}` will be logged
- Logs persist in Supabase and are visible in the dashboard

---

## ❌ Troubleshooting

### If Step 2 fails (Deploy):
- [ ] Manually check env vars are in Netlify settings
- [ ] Click **Deploy site** button again
- [ ] Wait 2-3 minutes and refresh

### If Step 3 fails (Error in console):
**Error: "Supabase client not initialized"**
- Solution: Step 2 env vars not set yet. Complete Step 2 and redeploy.

**Error: "relation 'webhook_logs' does not exist"**
- Solution: Step 1 table wasn't created. Complete Step 1 properly.

**Error: Network error or 500**
- Solution: Wait 5 minutes for deployment to be live, then refresh page

### If Step 4 fails (No logs showing):
- [ ] Double-check you sent the test request in Step 3
- [ ] Open browser console (F12) and check for errors
- [ ] Check Netlify function logs: https://app.netlify.com → Your Site → Logs → Functions
- [ ] Try sending test request again

---

## 📞 Need Help?

1. **Check documentation:** [DEPLOYMENT.md](DEPLOYMENT.md)
2. **Check error logs:** Netlify Functions Logs or Browser Console (F12)
3. **Verify database:** Supabase Table Editor should show `webhook_logs` table
4. **Verify env vars:** Netlify Site Settings should show the two variables you set

---

**Created:** 31 Mar 2026  
**Updated:** Today  
**Status:** ✅ Ready for Production
