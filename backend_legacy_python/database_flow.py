import sqlite3

# Connect to the database
conn = sqlite3.connect('bank.db', check_same_thread=False)
cursor = conn.cursor()

# Create users table
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)
""")
conn.commit()

# Create transactions table
cursor.execute("""
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
""")
conn.commit()

# Create fraud_logs table
cursor.execute("""
CREATE TABLE IF NOT EXISTS fraud_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    result TEXT NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions (id)
)
""")
conn.commit()

# Function to register a user
def register_user(name, email, password):
    try:
        cursor.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                       (name, email, password))
        conn.commit()
        return "User registered successfully"
    except sqlite3.IntegrityError:
        return "Email already exists"

# Function to log in a user
def login_user(email, password):
    cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
    user = cursor.fetchone()
    
    if user:
        return "Login Success"
    else:
        return "Invalid Credentials"

# Function to add a transaction
def add_transaction(user_id, amount, status):
    cursor.execute("INSERT INTO transactions (user_id, amount, status) VALUES (?, ?, ?)",
                   (user_id, amount, status))
    conn.commit()
    return "Transaction added successfully"

# Function to save fraud detection result
def save_fraud_result(transaction_id, result):
    cursor.execute("INSERT INTO fraud_logs (transaction_id, result) VALUES (?, ?)",
                   (transaction_id, result))
    conn.commit()
    return "Fraud result saved successfully"

# Function to fetch transactions for a user
def get_transactions(user_id):
    cursor.execute("SELECT * FROM transactions WHERE user_id=?", (user_id,))
    return cursor.fetchall()