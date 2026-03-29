# The Guardian Ledger

**AI-Powered Banking Security & Fraud Intervention System**

The Guardian Ledger is a premium, intelligent web-based platform designed to protect financial assets through real-time Machine Learning analysis. It features a modern, high-conversion interface and a proactive "AI Guard" that intercepts fraudulent transactions before they are finalized.

## 🚀 Key Features
- **Neural Fraud Detection**: Every transaction is audited by a Random Forest ML engine in milliseconds.
- **Proactive Intervention**: High-risk transactions trigger a specialized "Security Halt" modal for manual review.
- **Guardian Dashboard**: A stunning user hub with glassmorphic cards, balance audits, and transaction history.
- **Administrative Suite**: A full-featured admin portal with system metrics, threat distribution charts (via Chart.js), and a real-time flagged ledger.
- **Multi-Page Architecture**: Rebuilt from a monolithic SPA to a robust, scalable Flask-based multi-page application.

## 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (Modern Security Theme).
- **Backend**: Flask (Python), Blueprint-based modular routing.
- **Database**: SQLite with SQLAlchemy ORM.
- **ML Engine**: Scikit-learn (Random Forest Classifier), Pandas.
- **Visuals**: Chart.js for admin analytics, Material Symbols for modern iconography.

## 🚀 The Guardian Ledger v5.0 (Cloud Edition)

The project is now configured with a **decoupled architecture** for high-performance cloud hosting:

### 🌐 Frontend (Vercel)
The user interface is a pure static site optimized for Vercel's global CDN:
- **Deployment**: Connect your GitHub repository to Vercel and select the root directory.
- **Routing**: Managed automatically by `vercel.json` (supports clean URLs like `/dashboard`).
- **Configuration**: Set `API_BASE` in `frontend/js/script.js` to your backend URL.

### 🧠 Backend (Render)
The Neural Engine API is optimized for Render's serverless/web service environment:
- **Deployment**: Deploy the root directory to Render as a **Web Service**.
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn "backend.app:create_app()"`
- **Health Check**: Configured at `/api/health`.

### 🛠️ Local Development
To run the specialized monolithic mode locally:
1. Ensure `python` and all dependencies are installed.
2. Execute `python start_website.py`.
3. The system will perform a neural health check and open the ledger at `localhost:5000`.

> [!IMPORTANT]
> **Manual Requirement Update**: Before deploying to Render, manually add `gunicorn` to a new line in your `requirements.txt`. (This is necessary for the production WSGI server).

---
*Developed for 'Net Banking Fraud Detection' modernization.*

## 📦 Quick Start

### 1. Prerequisites
Ensure you have Python 3.8+ installed.

### 2. Setup Environment
```bash
pip install -r requirements.txt
```

### 3. Initialize ML Brain
Generate the synthetic training data and calibrate the neural model:
```bash
python ml/train_model.py
```
This generates `data/fraud_model.joblib` which the AI Guard uses for real-time auditing.

### 4. Deploy Locally
Launch the secure environment:
```bash
python start_website.py
```
Visit `http://127.0.0.1:5000` to access the vault.

## 🔑 Access Credentials
- **Authorized Admin**: `admin` / `admin123`
- **User Node**: Register a new account directly via the landing page.

## 🧠 Auditing Parameters
The AI Guard analyzes five critical vectors for every transaction:
1. **Node Volume**: Detects unusually high transaction amounts.
2. **Temporal Window**: Audits for suspicious night-time or off-peak activity.
3. **Weekly Cadence**: Learns specific user spending patterns based on the day.
4. **Device Integrity**: Identifies transactions from unrecognized hardware signatures.
5. **Geographic Consistency**: Labels transactions from anomalous geographic locations.

---
*Secured by The Guardian Ledger Neural Engine v4.0*
