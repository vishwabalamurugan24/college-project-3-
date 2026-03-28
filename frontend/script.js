let currentUser = null;
const API_BASE = 'http://127.0.0.1:5000/api';
let adminChart = null;

// VIEW MANAGEMENT
function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    
    // Show target view
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.classList.remove('hidden');
        window.scrollTo(0, 0);
    }
    
    // Update Nav visibility
    if (currentUser) {
        document.getElementById('nav-v-links').classList.remove('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        document.getElementById('login-nav-btn').classList.add('hidden');
        document.getElementById('user-avatar').classList.remove('hidden');
        
        // Show/hide based on admin
        document.getElementById('nav-dashboard').classList.toggle('hidden', currentUser.is_admin);
        document.getElementById('nav-history').classList.toggle('hidden', currentUser.is_admin);
        document.getElementById('nav-transfer').classList.toggle('hidden', currentUser.is_admin);
        document.getElementById('nav-profile').classList.remove('hidden');
        
        if (currentUser.is_admin && (viewId === 'dashboard' || viewId === 'home')) {
             showView('admin');
        }
    } else {
        document.getElementById('nav-v-links').classList.add('hidden');
        document.getElementById('logout-btn').classList.add('hidden');
        document.getElementById('user-avatar').classList.add('hidden');
        document.getElementById('login-nav-btn').classList.remove('hidden');
    }

    // Load data if switching to specific views
    if (viewId === 'dashboard') loadUserDashboard();
    if (viewId === 'history') loadHistory();
    if (viewId === 'admin') showAdminSubview('admin-dashboard');
    if (viewId === 'profile') loadProfile();
}

// ADMIN SUBVIEW MANAGEMENT
function showAdminSubview(subId) {
    document.querySelectorAll('.admin-subview').forEach(s => s.classList.add('hidden'));
    document.getElementById(subId).classList.remove('hidden');
    
    // Update nav styles
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        if (item.getAttribute('data-target') === subId) {
            item.classList.add('bg-white', 'text-[#003461]', 'shadow-sm');
            item.classList.remove('text-slate-500');
        } else {
            item.classList.remove('bg-white', 'text-[#003461]', 'shadow-sm');
            item.classList.add('text-slate-500');
        }
    });

    if (subId === 'admin-dashboard') loadAdminDashboard();
    if (subId === 'admin-fraud') loadFlaggedLedger();
    if (subId === 'admin-users') loadUserDirectory();
}

// Hook up admin nav clicks
document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.admin-nav-item');
    if (navItem) {
        showAdminSubview(navItem.getAttribute('data-target'));
    }
});

// AUTHENTICATION
async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

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
            showView('dashboard');
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (e) {
        alert('Server connection failed. Is Flask running?');
    }
}

async function handleRegister() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    if (!username || !password) return alert('Please fill all fields');

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            showView('login');
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (e) {
        alert('Server connection failed.');
    }
}

function logout() {
    currentUser = null;
    showView('home');
}

// USER LOGIC
async function loadUserDashboard() {
    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        const data = await response.json();
        
        document.getElementById('dash-balance').innerText = `$${data.balance.toLocaleString()}`;
        
        const hasFraud = data.transactions.some(t => t.is_fraud && t.status === 'Flagged');
        if (hasFraud) {
            const alertBox = document.querySelector('.bg-tertiary-container');
            document.getElementById('dash-alert-text').innerText = "1 potential threat intercepted. Review your history.";
            alertBox.classList.remove('bg-secondary-container');
            alertBox.classList.add('bg-tertiary');
        }
    } catch (e) { console.error(e); }
}

async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        const data = await response.json();
        
        const body = document.getElementById('history-body');
        body.innerHTML = data.transactions.map(t => `
            <tr class="hover:bg-surface-container-low transition-colors group">
                <td class="px-6 py-5">
                    <span class="block font-bold text-primary font-body text-[11px]">${t.timestamp}</span>
                </td>
                <td class="px-6 py-5 text-[10px] text-outline font-mono">#TX-${t.id.toString().padStart(6,'0')}</td>
                <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary font-black text-[10px]">${t.receiver.substring(0,2).toUpperCase()}</div>
                        <span class="font-bold text-primary text-xs">${t.receiver}</span>
                    </div>
                </td>
                <td class="px-6 py-5 text-center">
                    <span class="text-[10px] font-bold text-outline uppercase">${t.amount > 0 ? 'Debit' : 'Credit'}</span>
                </td>
                <td class="px-6 py-5 font-headline font-extrabold ${t.is_fraud ? 'text-tertiary' : 'text-primary'} text-sm">$${t.amount.toLocaleString()}</td>
                <td class="px-6 py-5">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${t.is_fraud ? 'bg-error-container text-on-error-container border border-error/20' : 'bg-secondary-container text-on-secondary-container border border-secondary/20'}">
                        ${t.status}
                    </span>
                </td>
                <td class="px-6 py-5 text-right">
                    <button class="material-symbols-outlined text-outline hover:text-primary transition-colors text-sm">more_vert</button>
                </td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

function loadProfile() {
    if (!currentUser) return;
    document.getElementById('profile-name').innerText = currentUser.username;
    // ... update other fields if needed ...
}

async function processNewTransaction() {
    const amount = document.getElementById('trans-amount').value;
    const receiver = document.getElementById('trans-receiver').value;
    
    if (!amount || !receiver) return alert('Please fill all fields');

    // UI state: Analyzing
    const indicator = document.getElementById('analysis-indicator');
    const icon = document.getElementById('analysis-icon');
    const text = document.getElementById('analysis-text');
    
    indicator.classList.add('animate-pulse');
    icon.innerText = 'cached';
    icon.classList.add('animate-spin');
    text.innerText = 'Analyzing for Fraud...';

    try {
        const response = await fetch(`${API_BASE}/transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount, 
                receiver,
                location_consistency: Math.random() > 0.9 ? 1 : 0,
                device_consistency: Math.random() > 0.95 ? 1 : 0
            })
        });

        const data = await response.json();
        
        // Reset UI state
        indicator.classList.remove('animate-pulse');
        icon.classList.remove('animate-spin');
        icon.innerText = 'security';
        text.innerText = 'AI Guard Verified';

        if (data.is_fraud) {
            openFraudModal(amount, receiver);
        } else {
            alert('Transaction successful!');
            showView('dashboard');
        }
    } catch (e) {
        alert('Transaction failed.');
        icon.innerText = 'error';
        text.innerText = 'Verification Failed';
    }
}

function openFraudModal(amount, receiver) {
    document.getElementById('modal-amount').innerText = `$${parseFloat(amount).toLocaleString()}`;
    document.getElementById('modal-receiver').innerText = receiver;
    document.getElementById('fraud-modal').classList.remove('hidden');
    document.getElementById('fraud-modal').classList.add('flex');
}

function closeFraudModal() {
    document.getElementById('fraud-modal').classList.add('hidden');
    document.getElementById('fraud-modal').classList.remove('flex');
    showView('dashboard');
}

function showFraudToast(msg) {
    const toast = document.getElementById('fraud-toast');
    document.getElementById('toast-msg').innerText = msg;
    toast.classList.remove('hidden');
    // Hide after 8s
    setTimeout(() => toast.classList.add('hidden'), 8000);
}

// ADMIN LOGIC
async function loadAdminDashboard() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`);
        const data = await response.json();
        
        document.getElementById('admin-total-t').innerText = data.total_transactions;
        document.getElementById('admin-total-f').innerText = data.fraud_cases;
        
        const alertsContainer = document.getElementById('admin-critical-alerts');
        alertsContainer.innerHTML = data.recent_alerts.map(a => `
            <div class="glass-card p-4 rounded-lg flex items-start gap-4 hover:shadow-md transition-shadow">
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
        `).join('') || '<p class="text-on-surface-variant">No critical alerts detected.</p>';

        updateAdminChart(data.total_transactions, data.fraud_cases);
    } catch (e) { console.error(e); }
}

function updateAdminChart(total, fraud) {
    const ctx = document.getElementById('adminChart').getContext('2d');
    if (adminChart) adminChart.destroy();
    
    adminChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Safe', 'Fraud'],
            datasets: [{
                data: [total - fraud, fraud],
                backgroundColor: ['#003461', '#ba1a1a'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { font: { family: 'Inter', weight: 'bold' } } }
            }
        }
    });
}

async function loadFlaggedLedger() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`);
        const data = await response.json();
        
        const body = document.getElementById('flagged-ledger-body');
        body.innerHTML = data.recent_alerts.map(a => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4">
                    <span class="px-2 py-0.5 ${a.is_resolved ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-error/10 text-error border-error/20'} rounded-full text-[9px] font-extrabold uppercase border">
                        ${a.is_resolved ? 'Resolved' : 'Flagged'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold">${a.username.substring(0,1)}</div>
                        <div>
                            <p class="font-bold text-primary">${a.username}</p>
                            <p class="text-[9px] text-outline">TX-REF: ${a.id}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <p class="font-bold text-primary">$${a.amount.toLocaleString()}</p>
                    <p class="text-[9px] text-outline uppercase tracking-tighter">Debit • Internal Ledger</p>
                </td>
                <td class="px-6 py-4">
                    <span class="flex items-center gap-1 text-tertiary font-bold">
                        <span class="w-1 h-1 rounded-full bg-tertiary"></span>
                        ${a.reason}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <p class="font-bold text-primary">Logged</p>
                    <p class="text-[9px] text-outline">${a.timestamp}</p>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex gap-2 justify-end">
                        <button class="px-2 py-1 bg-slate-100 rounded font-bold text-[10px] text-slate-500">Exclude</button>
                        <button class="px-2 py-1 bg-tertiary text-white rounded font-bold text-[10px]">Block User</button>
                    </div>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" class="p-8 text-center text-outline">No flagged transactions found.</td></tr>';
    } catch (e) { console.error(e); }
}

async function loadUserDirectory() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`);
        const users = await response.json();
        const body = document.getElementById('user-directory-body');

        body.innerHTML = users.map(u => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-mono text-outline uppercase">NODE-00${u.id}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">${u.username.substring(0,1)}</div>
                        <div>
                            <p class="font-bold text-primary">${u.username}</p>
                            <p class="text-[9px] text-outline">${u.is_admin ? 'ADMIN ACCESS' : 'STANDARD USER'}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <p class="font-bold text-primary">Dec 2023</p>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-0.5 ${u.status === 'Active' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-tertiary/10 text-tertiary border-tertiary/20'} rounded-full text-[9px] font-extrabold uppercase border">
                        ${u.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex gap-2 justify-end">
                        <button class="px-3 py-1 bg-slate-100 rounded font-bold text-[10px] text-slate-500">Edit</button>
                        ${u.status === 'Flagged' ? '<button class="px-3 py-1 bg-secondary text-white rounded font-bold text-[10px]">Manage</button>' : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

// Initialize
window.onload = () => {
    showView('home');
};
