/**
 * The Guardian Ledger - Multi-page Refactor
 */

const API_BASE = '/api';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// PAGE INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
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
    
    if (currentUser) {
        updateNavbar();
    }
});

function updateNavbar() {
    // This function can handle UI updates if common elements are present
    const userDisplay = document.getElementById('profile-name');
    if (userDisplay && currentUser) userDisplay.innerText = currentUser.username;
}

// AUTHENTICATION
async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) return alert('Username and password required');

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            currentUser = data.user;
            window.location.href = '/dashboard';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (e) {
        alert('Network error');
    }
}

async function handleRegister() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    if (!username || !password) return alert('Fill all fields');

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = '/login';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (e) {
        alert('Network error');
    }
}

async function logout() {
    await fetch(`${API_BASE}/logout`);
    localStorage.removeItem('currentUser');
    window.location.href = '/';
}

// DATA LOADING
async function loadUserDashboard() {
    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        const data = await response.json();
        
        document.getElementById('dash-balance').innerText = `$${data.balance.toLocaleString()}`;
        // Update other dashboard elements if needed
    } catch (e) { console.error(e); }
}

async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        const data = await response.json();
        
        const body = document.getElementById('history-body');
        if (!body) return;

        body.innerHTML = data.transactions.map(t => `
            <tr class="hover:bg-slate-50 transition-colors group">
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
                    <span class="text-[10px] font-bold text-outline uppercase">Debit</span>
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
        `).join('') || '<tr><td colspan="7" class="p-8 text-center text-outline">No transactions found.</td></tr>';
    } catch (e) { console.error(e); }
}

async function processNewTransaction() {
    const receiver = document.getElementById('trans-receiver').value;
    const amount = document.getElementById('trans-amount').value;

    if (!receiver || !amount) return alert('Receiver and amount required');

    // UI state: Analyzing
    const indicator = document.getElementById('analysis-indicator');
    const icon = document.getElementById('analysis-icon');
    const text = document.getElementById('analysis-text');
    
    indicator.classList.add('animate-pulse');
    icon.innerText = 'sync';
    icon.classList.add('animate-spin');
    text.innerText = 'Analyzing with AI Guard...';

    try {
        const response = await fetch(`${API_BASE}/transaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiver, amount })
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
            window.location.href = '/dashboard';
        }
    } catch (e) {
        alert('Transaction failed.');
        icon.innerText = 'error';
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
    window.location.href = '/dashboard';
}

function loadProfile() {
    if (!currentUser) return;
    document.getElementById('profile-name').innerText = currentUser.username;
}
