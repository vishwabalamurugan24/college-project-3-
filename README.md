# Net Banking Fraud Detection using Machine Learning

A premium, intelligent web-based system designed to enhance the security of online banking transactions using real-time Machine Learning analysis.

## 🚀 Features
- **Real-time Fraud Detection**: Every transaction is analyzed by a Random Forest model.
- **Machine Learning Integration**: Uses historical transaction patterns to identify anomalies.
- **Premium Glassmorphism UI**: A stunning, modern interface with interactive elements and micro-animations.
- **Admin Dashboard**: Comprehensive monitoring for fraudulent activities and system statistics.
- **Secure Authentication**: User and Admin login modules.

## 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (SPA).
- **Backend**: Flask (Python framework), SQLite (Database).
- **ML Engine**: Scikit-learn, Pandas, Joblib.

## 📦 Installation & Setup

### 1. Prerequisite
Ensure you have Python 3.8+ installed.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Train the Machine Learning Model
Since this is a simulation, you first need to generate the synthetic data and train the model.
```bash
python ml/train_model.py
```
This will create `data/fraud_model.joblib` which the backend uses for predictions.

### 4. Run the Application
```bash
cd backend
python app.py
```
Visit `http://127.0.0.1:5000` in your browser.

## 🔑 Default Credentials
- **Admin**: `admin` / `admin123`
- **User**: Register a new account via the UI.

## 🧠 ML Features Explained
The system analyzes the following parameters for each transaction:
1. **Amount**: Detects unusually high transactions.
2. **Time of Day**: Monitors for suspicious night-time activities.
3. **Day of Week**: Learns spending patterns based on the day.
4. **Device Consistency**: Flags transactions from unrecognized devices.
5. **Location Consistency**: Flags transactions from unusual geographic locations.
