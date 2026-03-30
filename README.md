# 📥 Webhook Logging System

![Netlify](https://img.shields.io/badge/Netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

A robust, serverless webhook inspection and logging platform built on **Netlify Functions** and backed by **Supabase**.

---

## 🚀 Features Catalog

*   **📡 Webhook Reception**: Securely ingest incoming data from any source.
*   **🗄️ Persistent Storage**: Logs are permanently stored in a secure Supabase PostgreSQL database.
*   **🔍 Easy Retrieval**: Fetch and filter logs via a REST API endpoint.
*   **🧹 Auto Cleanup**: Configurable, scheduled cron-jobs seamlessly delete obsolete logs avoiding database clutter.
*   **🛡️ Resilient Architecture**: Catch mechanisms ensure the server always responds with `200 OK` to prevent webhook provider retries.

---

## 📂 Architecture

| Function | Endpoint | Description |
| :--- | :--- | :--- |
| `webhook.js` | `POST /api/webhook/:id` | Receives incoming webhooks and saves the payload. |
| `logs.js`    | `GET /api/logs/:id`     | Retrieves the logs for a specific webhook ID. |
| `clear.js`   | `DELETE /api/clear/:id` | Manually clears all logs for a specific webhook ID. |
| `cleanup.js` | *Scheduled (CRON)*      | Automatically deletes webhook logs older than 7 days. |

---

## 🛠️ Setup & Deployment

1. **Initialize the Database**:
   Run the provided `create_table.js` script to generate the `webhook_logs` table and configure Row Level Security (RLS) policies in Supabase.
   ```bash
   node create_table.js
   ```

2. **Environment Variables**:
   Ensure you add your Supabase credentials in `.env`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Locally**:
   ```bash
   npx netlify dev
   ```

4. **Deploy**:
   The project is pre-configured to deploy seamlessly on Netlify. The `netlify.toml` automatically handles redirects from clean URLs (`/api/*`) to the respective `/.netlify/functions/*` paths, alongside setting up the CRON schedule for `cleanup.js`.

---

✨ *Built with ❤️ for clean and resilient webhooks integration.*
