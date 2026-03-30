const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { auditTransaction } = require('./utils/shield');

const app = express();
app.use(cors());
app.use(express.json());

// Database Path
const dbPath = path.join(__dirname, 'db.json');

// Read DB Helper
function readDB() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

// Write DB Helper
function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));
}

// Global active user hack for simple local server demonstration (not for real production auth)
let activeUser = null; 

// 1. HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({ status: 'Online', service: 'FraudShield Node Backend' });
});

// 2. AUTHENTICATION (Login)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();

    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
        // Remove password before sending to frontend
        const safeUser = { id: user.id, username: user.username };
        activeUser = user.username; // track pseudo-session locally
        res.status(200).json({ message: 'Authentication Successful', user: safeUser });
    } else {
        res.status(401).json({ message: 'Invalid Node Credentials' });
    }
});

// 3. REGISTRATION
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();

    if (db.users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Vault ID already exists' });
    }

    const newUser = {
        id: Date.now(),
        username,
        password,
        balance: 10000.00, // Initial balance
        transactions: []
    };

    db.users.push(newUser);
    writeDB(db);

    res.status(201).json({ message: 'Vault Created successfully' });
});

// 4. FETCH DASHBOARD & LEDGER
app.get('/api/dashboard', (req, res) => {
    const db = readDB();
    // Default to first user if activeUser isn't bound (for simple frontend without proper cookies)
    const user = db.users.find(u => u.username === activeUser) || db.users[0];

    if (!user) {
        return res.status(404).json({ message: 'No active user found.' });
    }

    res.status(200).json({
        balance: user.balance,
        transactions: user.transactions.reverse() // Newest first
    });
});

// 5. PROCESS TRANSACTION
app.post('/api/transaction', (req, res) => {
    const { amount, receiver, location_consistency, device_consistency } = req.body;
    const db = readDB();
    
    // Default to first user again for simple connection
    const user = db.users.find(u => u.username === activeUser) || db.users[0];
    const numAmount = parseFloat(amount);

    // AI Check
    const fraudCheck = auditTransaction({ amount, receiver, location_consistency, device_consistency });

    if (fraudCheck.is_fraud) {
        // Log flagged transaction
        const entry = {
            id: Math.floor(1000 + Math.random() * 9000).toString(),
            receiver,
            amount: -numAmount,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'Flagged - Blocked',
            is_fraud: true
        };
        user.transactions.push(entry);
        writeDB(db);

        return res.status(200).json({ is_fraud: true, reason: fraudCheck.reason });
    }

    // Success (Deduct balance)
    user.balance -= numAmount;
    const entry = {
        id: Math.floor(1000 + Math.random() * 9000).toString(),
        receiver,
        amount: -numAmount,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Secured',
        is_fraud: false
    };
    user.transactions.push(entry);
    writeDB(db);

    res.status(200).json({ is_fraud: false, balance: user.balance });
});

// Start listening
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`============================================`);
    console.log(` FRAUDSHIELD AI NODE BACKEND `);
    console.log(` Backend Service running on http://127.0.0.1:${PORT}`);
    console.log(`============================================`);
});
