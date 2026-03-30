/**
 * FRAUDSHIELD AI - NEURAL INTERACTION ENGINE
 * Combined SPA Logic & API Integration
 * Optimized for Vercel (Frontend) & Render (Backend)
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:3000/api' 
    : 'https://fraudshield-backend.onrender.com/api'; 

let currentUser = null;
let currentView = 'home';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Neural Core: INITIALIZED (Tailwind Version)");
    initApp();
});

/**
 * App Initialization
 */
function initApp() {
    const savedUser = localStorage.getItem('fraudshield_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
        showView('dashboard');
    } else {
        showView('home');
    }
}

/**
 * SPA View Router
 */
function showView(viewId) {
    // Hide all views explicitly (Tailwind compatibility)
    document.querySelectorAll('.view-layer').forEach(v => {
        if(v.id !== 'fraud-modal') {
            v.classList.add('hidden-view');
        }
    });
    
    // Show target view
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.classList.remove('hidden-view');
        window.scrollTo(0, 0);
        currentView = viewId;
        updateNavHighlight(viewId);
    }

    // Trigger data loading for specific views
    if (viewId === 'dashboard') loadDashboardData();
    if (viewId === 'history') loadLedgerData();
    if (viewId === 'transfer') resetTransferForm();
}

function updateNavHighlight(viewId) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if(btn.dataset.target === viewId) {
            btn.classList.add('text-[#003461]', 'border-b-2', 'border-[#003461]', 'pb-1');
            btn.classList.remove('text-slate-500');
        } else {
            btn.classList.remove('text-[#003461]', 'border-b-2', 'border-[#003461]', 'pb-1');
            btn.classList.add('text-slate-500');
        }
    });
}

/**
 * Authentication
 */
function toggleAuthMode(mode) {
    const isLogin = mode === 'login';
    document.getElementById('form-login').classList.toggle('hidden-view', !isLogin);
    document.getElementById('form-register').classList.toggle('hidden-view', isLogin);
    
    // Tab styling
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');
    
    if(isLogin) {
        tabLogin.className = "text-lg font-bold text-primary border-b-2 border-primary pb-1";
        tabReg.className = "text-lg font-bold text-outline hover:text-primary transition-all pb-1";
        document.querySelector('.auth-hero').innerHTML = "Enter the <br/>Digital Vault.";
    } else {
        tabReg.className = "text-lg font-bold text-primary border-b-2 border-primary pb-1";
        tabLogin.className = "text-lg font-bold text-outline hover:text-primary transition-all pb-1";
        document.querySelector('.auth-hero').innerHTML = "Initiate <br/>New Ledger.";
    }
}

async function handleLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;

    if (!user || !pass) return showToast('Please enter credentials', 'warning');

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('fraudshield_user', JSON.stringify(currentUser));
            updateAuthUI();
            showView('dashboard');
            showToast('Authentication Successful', 'safe');
        } else {
            showToast(data.message || 'Access Denied', 'danger');
        }
    } catch (e) {
        showToast('Neural Core unreachable. Is Backend running?', 'danger');
    }
}

async function handleRegister() {
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;

    if (!user || pass.length < 4) return showToast('Invalid credentials (Min 4 chars)', 'warning');

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await response.json();
        if (response.ok) {
            showToast('Vault Initialized. Please Login.', 'safe');
            toggleAuthMode('login');
        } else {
            showToast(data.message || 'Registration failed', 'danger');
        }
    } catch (e) {
        showToast('Connection failed.', 'danger');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('fraudshield_user');
    updateAuthUI();
    showView('home');
    showToast('Securely Logged Out', 'safe');
}

function updateAuthUI() {
    const isAuth = !!currentUser;
    document.getElementById('guest-actions').classList.toggle('hidden', isAuth);
    document.getElementById('user-links').classList.toggle('hidden', !isAuth);
    document.getElementById('user-actions').classList.toggle('hidden', !isAuth);
}

/**
 * Dashboard & Data Loading
 */
async function loadDashboardData() {
    const balanceElem = document.getElementById('user-balance');
    const historyList = document.getElementById('dash-history-list');

    try {
        const response = await fetch(`${API_BASE}/dashboard`); 
        const data = await response.json();

        // Update Balance
        balanceElem.innerText = `$${parseFloat(data.balance).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        
        // Update Health Bar 
        const healthBar = document.getElementById('health-bar');
        healthBar.style.width = '0%';
        setTimeout(() => healthBar.style.width = '99.8%', 300);

        // Render Recent Activity Preview
        if (data.transactions && data.transactions.length > 0) {
            historyList.innerHTML = `<div class="space-y-3">` + data.transactions.slice(0, 3).map(t => renderLedgerPreviewItem(t)).join('') + `</div>`;
        } else {
            historyList.innerHTML = '<p class="text-on-surface-variant p-4">No recent neural activity.</p>';
        }

    } catch (e) {
        balanceElem.innerText = '$---';
        historyList.innerHTML = '<p class="text-error p-4">Error connecting to Ledger.</p>';
    }
}

async function loadLedgerData() {
    const tableBody = document.getElementById('history-body');
    tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-on-surface-variant">Synchronizing Ledger...</td></tr>';

    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        const data = await response.json();

        if (data.transactions && data.transactions.length > 0) {
            tableBody.innerHTML = data.transactions.map(t => {
                const isDebit = t.amount > 0;
                const statusBadge = t.is_fraud 
                    ? `<span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-error-container text-error uppercase tracking-widest"><span class="w-1.5 h-1.5 rounded-full bg-error mr-2"></span>Blocked</span>`
                    : `<span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-secondary-container text-secondary uppercase tracking-widest"><span class="w-1.5 h-1.5 rounded-full bg-secondary mr-2"></span>Success</span>`;
                
                return `
                <tr class="hover:bg-surface-container-low transition-colors group border-b border-outline-variant/10">
                    <td class="px-6 py-5">
                        <span class="block font-bold text-primary">${t.timestamp}</span>
                    </td>
                    <td class="px-6 py-5 font-mono text-xs text-outline">TX-${t.id}</td>
                    <td class="px-6 py-5 font-bold text-primary">${t.receiver}</td>
                    <td class="px-6 py-5 text-sm font-medium text-on-surface-variant">${isDebit ? 'Debit' : 'Credit'}</td>
                    <td class="px-6 py-5 font-extrabold text-lg ${t.is_fraud ? 'text-error line-through' : 'text-primary'}">
                        $${t.amount.toLocaleString()}
                    </td>
                    <td class="px-6 py-5">${statusBadge}</td>
                </tr>
            `}).join('');
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-on-surface-variant">No transactions recorded.</td></tr>';
        }
    } catch (e) {
        tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-error">Data sync error.</td></tr>';
    }
}

function renderLedgerPreviewItem(t) {
    const initials = t.receiver.substring(0, 2).toUpperCase();
    return `
        <div class="p-3 rounded-lg bg-surface-container-high flex items-center gap-4 hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-full font-bold flex items-center justify-center shrink-0 ${t.is_fraud ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}">${initials}</div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-on-surface truncate">${t.receiver}</p>
                <p class="text-xs text-on-surface-variant">${t.timestamp}</p>
            </div>
            <div class="text-right">
                <p class="font-extrabold ${t.is_fraud ? 'text-error line-through' : 'text-primary'}">$${t.amount.toLocaleString()}</p>
                <p class="text-[10px] uppercase font-bold tracking-widest ${t.is_fraud ? 'text-error' : 'text-secondary'}">${t.is_fraud ? 'Intercepted' : 'Secured'}</p>
            </div>
        </div>
    `;
}

/**
 * Transactions & Fraud Alerts
 */
async function processTransaction() {
    const amount = document.getElementById('trans-amount').value;
    const receiver = document.getElementById('trans-receiver').value;
    const btn = document.getElementById('btn-transfer');

    if (!amount || !receiver) return showToast('Incomplete data vectors', 'warning');

    // UI state
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin">refresh</span> VERIFYING...`;
    
    document.getElementById('sec-icon').className = 'material-symbols-outlined text-primary text-3xl animate-bounce';
    document.getElementById('sec-title').innerText = 'NEURAL AUDIT IN PROGRESS';
    document.getElementById('sec-status').innerText = 'Evaluating destination routing...';

    try {
        const response = await fetch(`${API_BASE}/transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount, 
                receiver,
                location_consistency: Math.random() > 0.85 ? 1 : 0, 
                device_consistency: Math.random() > 0.95 ? 1 : 0
            })
        });

        const data = await response.json();
        
        setTimeout(() => {
            if (data.is_fraud) {
                openFraudModal(amount, receiver, data.reason || 'Pattern recognition anomaly');
            } else {
                showToast('Transaction Secured & Executed', 'safe');
                showView('dashboard');
            }
            
            resetTransferForm();
            btn.disabled = false;
            btn.innerHTML = `EXECUTE SECURE TRANSFER`;
        }, 800);

    } catch (e) {
        showToast('Neural link failed.', 'danger');
        btn.disabled = false;
        btn.innerHTML = `RETRY SECURE TRANSFER`;
    }
}

function resetTransferForm() {
    document.getElementById('trans-amount').value = '';
    document.getElementById('trans-receiver').value = '';
    document.getElementById('sec-icon').className = 'material-symbols-outlined text-primary text-3xl';
    document.getElementById('sec-title').innerText = 'AI-Leger Shield: Active';
    document.getElementById('sec-status').innerText = 'Analyzing destination risk profile...';
}

function openFraudModal(amount, receiver, reason) {
    document.getElementById('fraud-target').innerText = receiver;
    document.getElementById('fraud-value').innerText = `$${parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('fraud-vector').innerText = reason;
    document.getElementById('fraud-modal').classList.remove('hidden-view');
}

function closeFraudModal() {
    document.getElementById('fraud-modal').classList.add('hidden-view');
    showView('dashboard');
}

/**
 * Toast Notifications
 */
function showToast(msg, type = 'safe') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const icon = type === 'safe' ? 'check_circle' : (type === 'warning' ? 'warning' : 'dangerous');
    
    toast.className = `toast-item ${type}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined text-2xl">${icon}</span>
        <p>${msg}</p>
    `;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 4500);
}
