/**
 * The Guardian Ledger - Multi-page Refactor
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:5000/api' 
    : 'https://YOUR-RENDER-BACKEND-URL.onrender.com/api'; // REPLACE THIS WITH YOUR RENDER URL
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let adminChart = null;

// PAGE INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const path = window.location.pathname;
    
    // Check authentication for protected pages
    const protectedPaths = ['/dashboard', '/history', '/transaction', '/profile', '/admin'];
    if (protectedPaths.includes(path) && !currentUser) {
        window.location.href = '/login';
        return;
    }

    // Load page-specific data
    if (path === '/dashboard') loadUserDashboard();
    if (path === '/history') loadHistory();
    if (path === '/profile') loadProfile();
    if (path === '/admin' || path.startsWith('/admin/')) {
        loadAdminDashboard();
        if (path === '/admin/monitoring') {
            loadFlaggedLedger();
            startNeuralTerminal();
        }
        if (path === '/admin/users') loadUserDirectory();
    }
    
    if (currentUser) {
        updateNavbar();
    }
});

function initTheme() {
    const theme = localStorage.getItem('guardian-theme') || 'light';
    document.documentElement.className = theme;
}

function toggleTheme() {
    const current = document.documentElement.className;
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.className = next;
    localStorage.setItem('guardian-theme', next);
}

function startNeuralTerminal() {
    const messages = [
        "Auditing node integrity...",
        "Neural patterns synchronized.",
        "Anomaly detected in Sector 7G.",
        "Proactive halt initiated on packet #882.",
        "Verifying hardware signature...",
        "Identity confirmed. Resuming stream.",
        "Cross-referencing geographic nodes..."
    ];
    
    const terminal = document.getElementById('terminal-logs');
    if (!terminal) return;

    setInterval(() => {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'text-[10px] font-mono mb-1 text-secondary opacity-0 animate-fade-in-up';
        entry.innerHTML = `<span class="text-outline">[${time}]</span> ${msg}`;
        terminal.prepend(entry);
        if (terminal.children.length > 50) terminal.removeChild(terminal.lastChild);
    }, 2500);
}

function updateNavbar() {
    const userDisplay = document.getElementById('profile-name');
    if (userDisplay && currentUser) userDisplay.innerText = currentUser.username;
}

// AUTHENTICATION
async function handleLogin() {
    const username = document.getElementById('identity').value;
    const password = document.getElementById('password').value;

    if (!username || !password) return alert('Please enter credentials');

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            window.location.href = '/dashboard';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (e) {
        alert('Server connection failed. Is Flask running?');
    }
}

async function handleRegister() {
    const fullName = document.getElementById('full_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    if (!fullName || !password) return alert('Please fill required fields');
    if (password !== confirmPassword) return alert('Passwords do not match');

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: fullName, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = '/login';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (e) {
        alert('Server connection failed.');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    fetch(`${API_BASE}/logout`).then(() => {
        window.location.href = '/login';
    });
}

// USER LOGIC
async function loadUserDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && document.getElementById('dash-username')) {
        document.getElementById('dash-username').innerText = user.username;
    }

    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        const data = await response.json();
        
        if (document.getElementById('dash-balance')) {
            document.getElementById('dash-balance').innerText = `$${data.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        }
        
        const hasFraud = data.transactions.some(t => t.is_fraud && t.status === 'Flagged');
        if (hasFraud && document.getElementById('dash-alert-text')) {
            document.getElementById('dash-alert-text').innerText = "Security Alert: Unusual activity detected in recent transactions.";
            const alertBox = document.getElementById('dash-alert-box');
            if (alertBox) {
                alertBox.classList.add('bg-error-container/20', 'border-error/20');
                alertBox.querySelector('span').classList.add('text-error');
            }
        }

        if (document.getElementById('dashboard-transactions-body')) {
            const body = document.getElementById('dashboard-transactions-body');
            body.innerHTML = data.transactions.slice(0, 5).map(t => `
                <tr class="hover:bg-surface-container-low transition-colors group">
                    <td class="px-8 py-5">
                        <span class="block font-bold text-primary font-body text-xs">${t.timestamp}</span>
                    </td>
                    <td class="px-8 py-5">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">${t.receiver.substring(0,2).toUpperCase()}</div>
                            <span class="font-bold text-primary text-sm">${t.receiver}</span>
                        </div>
                    </td>
                    <td class="px-8 py-5 font-headline font-extrabold ${t.is_fraud ? 'text-error' : 'text-primary'} text-base">$${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td class="px-8 py-5 text-right">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${t.status === 'Flagged' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}">
                            ${t.status}
                        </span>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="4" class="px-8 py-10 text-center text-outline">No recent activity.</td></tr>';
        }
    } catch (e) { console.error(e); }
}

async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        const data = await response.json();
        
        const body = document.getElementById('history-body');
        if (body) {
            body.innerHTML = data.transactions.map(t => `
                <tr class="hover:bg-surface-container-low transition-colors group">
                    <td class="px-8 py-5">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-primary-fixed/30 text-primary">Debit</span>
                    </td>
                    <td class="px-8 py-5">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">${t.receiver.substring(0,1).toUpperCase()}</div>
                            <div>
                                <p class="font-bold text-primary text-sm">${t.receiver}</p>
                                <p class="text-[10px] text-outline">REF: TX-${t.id}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-8 py-5">
                        <p class="font-extrabold text-primary text-base">$${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </td>
                    <td class="px-8 py-5">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${t.is_fraud ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}">
                            ${t.status}
                        </span>
                    </td>
                    <td class="px-8 py-5 text-outline text-xs font-medium">${t.timestamp}</td>
                    <td class="px-8 py-5 text-right">
                        <button class="material-symbols-outlined text-outline hover:text-primary transition-colors text-sm">more_vert</button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="6" class="p-12 text-center text-outline italic">No transaction records found.</td></tr>';
        }
    } catch (e) { console.error(e); }
}

async function processNewTransaction() {
    const amount = document.getElementById('trans-amount').value;
    const receiver = document.getElementById('trans-receiver').value;
    
    if (!amount || !receiver) return alert('Please fill all fields');

    // UI state: Analyzing
    const indicator = document.getElementById('analysis-indicator');
    const icon = document.getElementById('analysis-icon');
    const text = document.getElementById('analysis-text');
    
    if (indicator) {
        indicator.classList.add('animate-pulse');
        icon.classList.add('animate-spin');
        icon.innerText = 'cached';
        text.innerText = 'AI Engine Analyzing...';
    }

    try {
        const response = await fetch(`${API_BASE}/transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount: parseFloat(amount), 
                receiver,
                location_consistency: 1,
                device_consistency: 1
            })
        });

        const data = await response.json();
        
        // Reset UI state
        if (indicator) {
            indicator.classList.remove('animate-pulse');
            icon.classList.remove('animate-spin');
            icon.innerText = 'security';
            text.innerText = 'AI Guard Verified';
        }

        if (data.is_fraud) {
            openFraudModal(amount, receiver);
        } else {
            alert('Transaction successful!');
            window.location.href = '/dashboard';
        }
    } catch (e) {
        alert('Transaction failed.');
        if (icon) icon.innerText = 'error';
        if (text) text.innerText = 'Verification Failed';
    }
}

function openFraudModal(amount, receiver) {
    if (document.getElementById('modal-amount')) {
        document.getElementById('modal-amount').innerText = parseFloat(amount).toLocaleString(undefined, {minimumFractionDigits: 2});
        document.getElementById('modal-receiver').innerText = receiver;
        const modal = document.getElementById('fraud-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeFraudModal() {
    const modal = document.getElementById('fraud-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    window.location.href = '/dashboard';
}

function loadProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    if (document.getElementById('profile-name')) {
        document.getElementById('profile-name').innerText = user.username;
    }
    if (document.getElementById('profile-full-name')) {
        document.getElementById('profile-full-name').innerText = user.username;
    }
}

// ADMIN LOGIC
async function loadAdminDashboard() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`);
        const data = await response.json();
        
        if (document.getElementById('admin-total-t')) document.getElementById('admin-total-t').innerText = data.total_transactions;
        if (document.getElementById('admin-total-f')) document.getElementById('admin-total-f').innerText = data.fraud_cases;
        
        const alertsContainer = document.getElementById('admin-critical-alerts');
        if (alertsContainer) {
            alertsContainer.innerHTML = data.recent_alerts.map(a => `
                <div class="glass-card p-4 rounded-lg flex items-start gap-4 hover:shadow-md transition-shadow border border-outline-variant/10">
                    <div class="p-2 bg-error-container rounded-full shrink-0">
                        <span class="material-symbols-outlined text-error text-sm">warning</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-on-surface truncate">${a.reason}</p>
                        <div class="flex justify-between items-center mt-2">
                            <span class="bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">High Risk</span>
                            <span class="text-[10px] font-medium opacity-60">${a.timestamp}</span>
                        </div>
                    </div>
                </div>
            `).join('') || '<p class="text-on-surface-variant italic">No critical alerts detected.</p>';
        }

        if (document.getElementById('adminChart')) {
            updateAdminChart(data.total_transactions, data.fraud_cases);
        }
    } catch (e) { console.error(e); }
}

function updateAdminChart(total, fraud) {
    const canvas = document.getElementById('adminChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (adminChart) adminChart.destroy();
    
    adminChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Safe Transactions', 'Intercepted Threats'],
            datasets: [{
                data: [total - fraud, fraud],
                backgroundColor: ['#003461', '#ba1a1a'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            cutout: '75%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'bottom', 
                    labels: { 
                        font: { family: 'Inter', size: 11, weight: 'bold' },
                        padding: 20
                    } 
                }
            }
        }
    });
}

async function loadFlaggedLedger() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`);
        const data = await response.json();
        
        const body = document.getElementById('flagged-ledger-body');
        if (body) {
            body.innerHTML = data.recent_alerts.map(a => `
                <tr class="hover:bg-surface-container-low transition-colors">
                    <td class="px-8 py-5">
                        <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${a.is_resolved ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-error/10 text-error border-error/20'}">
                            ${a.is_resolved ? 'Resolved' : 'Flagged'}
                        </span>
                    </td>
                    <td class="px-8 py-5">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">${a.username.substring(0,1).toUpperCase()}</div>
                            <div>
                                <p class="font-bold text-primary text-sm">${a.username}</p>
                                <p class="text-[10px] text-outline">REF: TX-${a.id}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-8 py-5">
                        <p class="font-extrabold text-primary text-base">$${a.amount.toLocaleString()}</p>
                    </td>
                    <td class="px-8 py-5">
                        <span class="flex items-center gap-2 text-error font-bold text-xs">
                            <span class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                            ${a.reason}
                        </span>
                    </td>
                    <td class="px-8 py-5 text-outline text-xs font-medium">${a.timestamp}</td>
                    <td class="px-8 py-5 text-right">
                        <div class="flex gap-2 justify-end">
                            <button class="px-3 py-1.5 bg-surface-container-high rounded font-bold text-[10px] text-outline hover:bg-surface-variant transition-colors">Exclude</button>
                            <button class="px-3 py-1.5 bg-error text-white rounded font-bold text-[10px] hover:opacity-90 shadow-sm transition-all">Block Node</button>
                        </div>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="6" class="p-12 text-center text-outline italic">No threats currently active.</td></tr>';
        }
    } catch (e) { console.error(e); }
}

async function loadUserDirectory() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`);
        const users = await response.json();
        const body = document.getElementById('user-directory-body');

        if (body) {
            body.innerHTML = users.map(u => `
                <tr class="hover:bg-surface-container-low transition-colors">
                    <td class="px-8 py-5 font-mono text-xs text-outline tracking-widest">NODE-${u.id.toString().padStart(4,'0')}</td>
                    <td class="px-8 py-5">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">${u.username.substring(0,1).toUpperCase()}</div>
                            <div>
                                <p class="font-bold text-primary text-sm">${u.username}</p>
                                <p class="text-[9px] font-bold text-outline opacity-70">${u.is_admin ? 'INTERNAL ADMIN' : 'EXTERNAL PARTICIPANT'}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-8 py-5 text-xs text-outline font-medium">Verified 2024</td>
                    <td class="px-8 py-5">
                        <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border bg-secondary/10 text-secondary border-secondary/20">
                            Active
                        </span>
                    </td>
                    <td class="px-8 py-5 text-right">
                        <button class="px-4 py-1.5 bg-surface-container-high rounded font-bold text-[10px] text-primary hover:bg-primary hover:text-white transition-all">Manage Node</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) { console.error(e); }
}
