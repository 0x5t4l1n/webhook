document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const homeView = document.getElementById('home-view');
    const dashboardView = document.getElementById('dashboard-view');
    const btnGenerate = document.getElementById('btn-generate');
    const webhookUrlEl = document.getElementById('webhook-url');
    const btnCopy = document.getElementById('btn-copy');
    const btnClear = document.getElementById('btn-clear');
    const requestList = document.getElementById('request-list');
    const requestDetails = document.getElementById('request-details');
    const template = document.getElementById('request-details-template');

    // State
    let currentLocalWebhookId = null;
    let logsCache = [];
    let selectedLogId = null;
    let pollingInterval = null;

    // Base URL
    const getBaseUrl = () => {
        const url = new URL(window.location.href);
        // Fallback for direct testing since user mentions production domain
        return `${url.protocol}//${url.host}/.netlify/functions/webhook/`;
    };

    // Router
    const handleRoute = () => {
        const hash = window.location.hash.slice(1);
        if (hash && hash.length > 5) {
            currentLocalWebhookId = hash;
            showDashboard();
        } else {
            showHome();
        }
    };

    const showHome = () => {
        homeView.classList.add('active');
        dashboardView.classList.remove('active');
        stopPolling();
    };

    const showDashboard = () => {
        homeView.classList.remove('active');
        dashboardView.classList.add('active');
        
        const fullUrl = getBaseUrl() + currentLocalWebhookId;
        webhookUrlEl.textContent = fullUrl;
        
        document.title = `Nexulean Console - ${currentLocalWebhookId.substring(0,6)}`;
        
        fetchLogs();
        startPolling();
    };

    // Generate UUID
    btnGenerate.addEventListener('click', () => {
        const id = crypto.randomUUID();
        window.location.hash = id;
    });

    // Copy URL
    btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(webhookUrlEl.textContent).then(() => {
            const originalText = btnCopy.textContent;
            btnCopy.textContent = 'Copied!';
            setTimeout(() => btnCopy.textContent = originalText, 2000);
        });
    });

    // Clear Logs
    btnClear.addEventListener('click', async () => {
        if (!confirm('Clear all logs for this endpoint?')) return;
        try {
            await fetch(`/.netlify/functions/clear/${currentLocalWebhookId}`);
            logsCache = [];
            selectedLogId = null;
            renderLogList();
            renderSelectedLog();
        } catch (e) {
            console.error('Failed to clear logs', e);
        }
    });

    // API Handling
    const fetchLogs = async () => {
        if (!currentLocalWebhookId) return;
        try {
            const res = await fetch(`/.netlify/functions/logs/${currentLocalWebhookId}`);
            if (res.ok) {
                const logs = await res.json();
                if (JSON.stringify(logs) !== JSON.stringify(logsCache)) {
                    logsCache = logs;
                    renderLogList();
                    if (selectedLogId && !logs.find(l => l.id === selectedLogId)) {
                        selectedLogId = null;
                        renderSelectedLog();
                    }
                }
            } else {
                showErrorState();
            }
        } catch (e) {
            console.error('Error fetching logs', e);
            showErrorState();
        }
    };

    const startPolling = () => {
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = setInterval(fetchLogs, 3000);
    };

    const stopPolling = () => {
        if (pollingInterval) clearInterval(pollingInterval);
    };

    // Rendering
    const escapeHtml = (unsafe) => {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };

    const showErrorState = () => {
        requestList.innerHTML = `
            <li style="justify-content: center; color: var(--danger-color); font-style: italic;">
                Failed to load logs. Check backend connection.
            </li>
        `;
    };

    const renderLogList = () => {
        requestList.innerHTML = '';
        if (logsCache.length === 0) {
            requestList.innerHTML = `
                <li style="justify-content: center; color: var(--text-secondary); font-style: italic; cursor: default; background: transparent;">
                    No requests received yet
                </li>
            `;
            return;
        }

        logsCache.forEach(log => {
            const li = document.createElement('li');
            if (log.id === selectedLogId) li.classList.add('selected');
            
            const date = new Date(log.timestamp);
            const timeString = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`;
            
            li.innerHTML = `
                <div>
                    <span class="req-method method-${log.method}">${escapeHtml(log.method)}</span>
                </div>
                <span class="req-time">${timeString}</span>
            `;
            
            li.addEventListener('click', () => {
                const prev = document.querySelector('#request-list li.selected');
                if (prev) prev.classList.remove('selected');
                li.classList.add('selected');
                
                selectedLogId = log.id;
                renderSelectedLog();
            });

            requestList.appendChild(li);
        });
    };

    const renderSelectedLog = () => {
        requestDetails.innerHTML = '';
        if (!selectedLogId) {
            requestDetails.innerHTML = `
                <div class="empty-message">
                    No request selected. Select an entry from the log to view details.
                </div>
            `;
            return;
        }

        const log = logsCache.find(l => l.id === selectedLogId);
        if (!log) return;

        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.log-id').textContent = log.id;
        clone.querySelector('.log-method').textContent = log.method;
        clone.querySelector('.log-ip').textContent = log.ip;
        clone.querySelector('.log-time').textContent = new Date(log.timestamp).toLocaleString();
        
        clone.querySelector('.log-query').textContent = log.query_params && Object.keys(log.query_params).length > 0 
            ? JSON.stringify(log.query_params, null, 2) 
            : '{ // No parameters }';
            
        let displayHeaders = log.headers ? { ...log.headers } : {};
        if (Object.keys(displayHeaders).length > 0) {
            for (const key in displayHeaders) {
                const val = displayHeaders[key];
                if (typeof val === 'string' && val.length > 4 && /^[A-Za-z0-9+/=]+$/.test(val)) {
                    try {
                        const decodedStr = atob(val);
                        if (decodedStr.startsWith('{') || decodedStr.startsWith('[')) {
                            displayHeaders[key] = JSON.parse(decodedStr);
                        }
                    } catch(e) {}
                }
            }
        }
        
        clone.querySelector('.log-headers').textContent = Object.keys(displayHeaders).length > 0
            ? JSON.stringify(displayHeaders, null, 2) 
            : '{ // No headers }';
        
        let bodyDisplay = log.body;
        if (bodyDisplay) {
            try {
                const parsed = JSON.parse(bodyDisplay);
                bodyDisplay = JSON.stringify(parsed, null, 2);
            } catch(e) {}
        }
        clone.querySelector('.log-body').textContent = bodyDisplay || '[Empty Payload]';
        
        clone.querySelector('.copy-body-btn').addEventListener('click', (e) => {
            navigator.clipboard.writeText(log.body || '').then(() => {
                const target = e.target;
                const originalText = target.textContent;
                target.textContent = 'Copied!';
                setTimeout(() => target.textContent = originalText, 2000);
            });
        });

        clone.querySelector('.replay-btn').addEventListener('click', async () => {
            try {
                const fetchOptions = {
                    method: log.method,
                    headers: log.headers || {},
                };
                if (log.method !== 'GET' && log.method !== 'HEAD') {
                    fetchOptions.body = log.body;
                }
                
                delete fetchOptions.headers['host'];
                delete fetchOptions.headers['content-length'];
                delete fetchOptions.headers['connection'];

                let queryStr = '';
                if (log.query_params && Object.keys(log.query_params).length > 0) {
                    const params = new URLSearchParams(log.query_params);
                    queryStr = `?${params.toString()}`;
                }

                await fetch(getBaseUrl() + currentLocalWebhookId + queryStr, fetchOptions);
                alert('Request replayed successfully!');
            } catch (e) {
                alert(`Replay failed: ${e.message}`);
            }
        });

        requestDetails.appendChild(clone);
    };

    // Init
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
});
