/**
 * FRAUDSHIELD AI - NEURAL INTERACTION ENGINE
 * Combined SPA Logic & API Integration
 * Optimized for Vercel (Frontend) & Render (Backend)
 */

// Configuration - Point this to your Render service URL once deployed
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:3000/api' 
    : 'https://fraudshield-backend.onrender.com/api'; // Replace with your Render URL

let currentUser = null;
let currentView = 'home';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Neural Core: INITIALIZED");
    initApp();
});

/**
 * App Initialization
 */
function initApp() {
    // Check if user is already "logged in" (for demo/session purposes)
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
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    
    // Show target view
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.classList.remove('hidden');
        window.scrollTo(0, 0);
        currentView = viewId;
    }

    // Trigger data loading for specific views
    if (viewId === 'dashboard') loadDashboardData();
    if (viewId === 'history') loadLedgerData();
    if (viewId === 'transfer') resetTransferForm();
}

/**
 * Section: Authentication
 */
function toggleAuthMode(mode) {
    const isLogin = mode === 'login';
    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-register').classList.toggle('hidden', isLogin);
    document.getElementById('tab-login').classList.toggle('active', isLogin);
    document.getElementById('tab-register').classList.toggle('active', !isLogin);
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
}

function updateAuthUI() {
    const isAuth = !!currentUser;
    document.getElementById('guest-links').classList.toggle('hidden', isAuth);
    document.getElementById('user-links').classList.toggle('hidden', !isAuth);
}

/**
 * Section: Dashboard & Data Loading
 */
async function loadDashboardData() {
    const balanceElem = document.getElementById('user-balance');
    const historyList = document.getElementById('dash-history-list');

    try {
        const response = await fetch(`${API_BASE}/dashboard`); // Assuming session handled by cookie or simply public for this project structure
        const data = await response.json();

        // Update Balance
        balanceElem.innerText = `$${parseFloat(data.balance).toLocaleString()}`;
        
        // Update Health Bar (Simulated animation)
        const healthBar = document.getElementById('health-bar');
        healthBar.style.width = '0%';
        setTimeout(() => healthBar.style.width = '99.8%', 100);

        // Render Recent Activity Preview (Top 3)
        if (data.transactions && data.transactions.length > 0) {
            historyList.innerHTML = data.transactions.slice(0, 3).map(t => renderLedgerPreviewItem(t)).join('');
        } else {
            historyList.innerHTML = '<p class="text-muted">No recent neural activity.</p>';
        }

    } catch (e) {
        balanceElem.innerText = '$---';
        historyList.innerHTML = '<p class="text-error">Error connecting to Ledger.</p>';
    }
}

async function loadLedgerData() {
    const tableBody = document.getElementById('history-body');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Synchronizing Ledger...</td></tr>';

    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        const data = await response.json();

        if (data.transactions && data.transactions.length > 0) {
            tableBody.innerHTML = data.transactions.map(t => `
                <tr class="fade-in">
                    <td><span class="text-mono small">${t.timestamp}</span></td>
                    <td><span class="text-muted text-mono">TX-${t.id}</span></td>
                    <td><strong>${t.receiver}</strong></td>
                    <td class="text-muted uppercase small">${t.amount > 0 ? 'Debit' : 'Credit'}</td>
                    <td><strong class="${t.is_fraud ? 'text-danger' : 'text-primary'}">$${t.amount.toLocaleString()}</strong></td>
                    <td><span class="status-label ${t.is_fraud ? 'flagged' : 'safe'}">${t.status}</span></td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No transactions recorded.</td></tr>';
        }
    } catch (e) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Data sync error.</td></tr>';
    }
}

function renderLedgerPreviewItem(t) {
    const initials = t.receiver.substring(0, 2).toUpperCase();
    return `
        <div class="ledger-item">
            <div class="item-left">
                <div class="item-avatar">${initials}</div>
                <div class="item-info">
                    <h4>${t.receiver}</h4>
                    <p>${t.timestamp}</p>
                </div>
            </div>
            <div class="item-right">
                <div class="item-amount ${t.is_fraud ? 'text-accent' : ''}">$${t.amount.toLocaleString()}</div>
                <p class="status-badge ${t.is_fraud ? 'danger' : 'safe'}" style="font-size: 8px;">${t.status}</p>
            </div>
        </div>
    `;
}

/**
 * Section: Transactions & Fraud Detection
 */
async function processTransaction() {
    const amount = document.getElementById('trans-amount').value;
    const receiver = document.getElementById('trans-receiver').value;
    const btn = document.getElementById('btn-transfer');

    if (!amount || !receiver) return showToast('Incomplete data vectors', 'warning');

    // UI State: Analyzing
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined pulse">sync</span> AI GUARD ANALYZING...`;
    
    document.getElementById('sec-icon').className = 'material-symbols-outlined animate-spin';
    document.getElementById('sec-title').innerText = 'NEURAL AUDIT IN PROGRESS';
    document.getElementById('sec-status').innerText = 'Cross-referencing behavioral patterns...';

    try {
        const response = await fetch(`${API_BASE}/transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount, 
                receiver,
                // Simulate consistent/inconsistent environmental data
                location_consistency: Math.random() > 0.85 ? 1 : 0, 
                device_consistency: Math.random() > 0.95 ? 1 : 0
            })
        });

        const data = await response.json();
        
        setTimeout(() => {
            if (data.is_fraud) {
                openFraudModal(amount, receiver, data.reason || 'Anomalous Transfer Behavior');
            } else {
                showToast('Transaction Secured & Executed', 'safe');
                showView('dashboard');
            }
            
            // Reset Button
            btn.disabled = false;
            btn.innerHTML = `EXECUTE SECURE TRANSFER`;
        }, 1200);

    } catch (e) {
        showToast('Neural link failed.', 'danger');
        btn.disabled = false;
        btn.innerHTML = `RETRY SECURE TRANSFER`;
    }
}

function resetTransferForm() {
    document.getElementById('trans-amount').value = '';
    document.getElementById('trans-receiver').value = '';
    document.getElementById('sec-icon').className = 'material-symbols-outlined';
    document.getElementById('sec-title').innerText = 'AI-Leger Shield: Active';
    document.getElementById('sec-status').innerText = 'Analyzing destination risk profile...';
}

/**
 * Section: Fraud Alerts & Modals
 */
function openFraudModal(amount, receiver, reason) {
    document.getElementById('fraud-target').innerText = receiver;
    document.getElementById('fraud-value').innerText = `$${parseFloat(amount).toLocaleString()}`;
    document.getElementById('fraud-vector').innerText = reason;
    document.getElementById('fraud-modal').classList.remove('hidden');
}

function closeFraudModal() {
    document.getElementById('fraud-modal').classList.add('hidden');
    showView('dashboard');
}

/**
 * Utilities: Notifications
 */
function showToast(msg, type = 'safe') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const icon = type === 'safe' ? 'check_circle' : (type === 'warning' ? 'warning' : 'dangerous');
    
    toast.className = `toast-item ${type}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined">${icon}</span>
        <p>${msg}</p>
    `;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}
