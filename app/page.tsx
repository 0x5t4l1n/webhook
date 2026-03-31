'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import styles from './page.module.css';

interface WebhookLog {
  id: string;
  webhook_id: string;
  method: string;
  headers: Record<string, any>;
  body: string;
  query_params: Record<string, any>;
  ip: string;
  timestamp: string;
}

export default function Home() {
  const [webhookId, setWebhookId] = useState<string>('');
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  const generateWebhookId = () => {
    const id = crypto.randomUUID();
    setWebhookId(id);
    setWebhookUrl(`${window.location.origin}/api/webhook/${id}`);
    setSelectedLog(null);
    fetchLogs(id);
  };

  const fetchLogs = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/logs/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!webhookId || !confirm('Clear all logs for this endpoint?')) return;
    try {
      await fetch(`/api/clear/${webhookId}`, { method: 'DELETE' });
      setLogs([]);
      setSelectedLog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear logs');
    }
  };

  const copyWebhookUrl = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      alert('Webhook URL copied to clipboard!');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (webhookId) {
        fetchLogs(webhookId);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [webhookId]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🪝 Webhook Logger</h1>
        <p>Inspect and log webhook requests in real-time</p>
      </header>

      <main className={styles.main}>
        <section className={styles.generatorSection}>
          <h2>Generate Webhook Endpoint</h2>
          <button className={styles.generateBtn} onClick={generateWebhookId}>
            Generate Endpoint
          </button>

          {webhookUrl && (
            <div className={styles.webhookInfo}>
              <div className={styles.webhookUrlContainer}>
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className={styles.webhookInput}
                />
                <button className={styles.copyBtn} onClick={copyWebhookUrl}>
                  Copy
                </button>
              </div>
              <div className={styles.actions}>
                <button className={styles.refreshBtn} onClick={() => fetchLogs(webhookId)}>
                  Refresh
                </button>
                <button className={styles.clearBtn} onClick={clearLogs}>
                  Clear Logs
                </button>
              </div>
            </div>
          )}
        </section>

        {error && <div className={styles.error}>{error}</div>}

        <section className={styles.logsSection}>
          <div className={styles.logsContainer}>
            <h3>Request Log ({logs.length})</h3>
            {loading && <p className={styles.loading}>Loading...</p>}
            {logs.length === 0 && !loading && (
              <p className={styles.empty}>No requests received yet</p>
            )}
            <div className={styles.logList}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`${styles.logItem} ${selectedLog?.id === log.id ? styles.selected : ''}`}
                  onClick={() => setSelectedLog(log)}
                >
                  <span className={`${styles.method} ${styles[`method-${log.method}`]}`}>
                    {log.method}
                  </span>
                  <span className={styles.time}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.detailsContainer}>
            <h3>Request Details</h3>
            {selectedLog ? (
              <div className={styles.details}>
                <div className={styles.detailGroup}>
                  <label>Method:</label>
                  <code>{selectedLog.method}</code>
                </div>
                <div className={styles.detailGroup}>
                  <label>Timestamp:</label>
                  <code>{new Date(selectedLog.timestamp).toISOString()}</code>
                </div>
                <div className={styles.detailGroup}>
                  <label>IP Address:</label>
                  <code>{selectedLog.ip}</code>
                </div>
                <div className={styles.detailGroup}>
                  <label>Headers:</label>
                  <pre>{JSON.stringify(selectedLog.headers, null, 2)}</pre>
                </div>
                <div className={styles.detailGroup}>
                  <label>Query Parameters:</label>
                  <pre>{JSON.stringify(selectedLog.query_params, null, 2)}</pre>
                </div>
                <div className={styles.detailGroup}>
                  <label>Body:</label>
                  <pre>{selectedLog.body || '(empty)'}</pre>
                </div>
              </div>
            ) : (
              <p className={styles.empty}>No request selected</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
