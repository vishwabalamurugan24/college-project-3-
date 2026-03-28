import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Create data directory if not exists
os.makedirs('data', exist_ok=True)

def generate_synthetic_data(n_samples=2000):
    np.random.seed(42)
    
    # Features
    amounts = np.random.uniform(10, 5000, n_samples)
    hours = np.random.randint(0, 24, n_samples)
    days = np.random.randint(0, 7, n_samples)
    
    # 0: Transfer, 1: Withdrawal, 2: Payment, 3: Deposit
    trans_types = np.random.randint(0, 4, n_samples)
    
    # 0: Usual, 1: Unusual
    location_consistency = np.random.choice([0, 1], size=n_samples, p=[0.9, 0.1])
    device_consistency = np.random.choice([0, 1], size=n_samples, p=[0.95, 0.05])
    
    # Target: Fraud (simplified rules for synthetic data)
    # Fraud probability increases with:
    # - High amount
    # - Night time (0-5)
    # - Unusual location/device
    
    fraud_prob = (
        (amounts / 5000) * 0.3 + 
        ((hours < 6) | (hours > 22)).astype(int) * 0.2 + 
        location_consistency * 0.4 + 
        device_consistency * 0.5
    )
    
    # Normalize prob to [0, 1] and add noise
    fraud_prob = np.clip(fraud_prob + np.random.normal(0, 0.1, n_samples), 0, 1)
    labels = (fraud_prob > 0.7).astype(int)
    
    df = pd.DataFrame({
        'amount': amounts,
        'hour': hours,
        'day_of_week': days,
        'transaction_type': trans_types,
        'location_consistency': location_consistency,
        'device_consistency': device_consistency,
        'is_fraud': labels
    })
    
    return df

def train():
    print("Generating synthetic data...")
    df = generate_synthetic_data()
    
    X = df.drop('is_fraud', axis=1)
    y = df['is_fraud']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training on {len(X_train)} samples...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    print("\nModel Evaluation:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(classification_report(y_test, y_pred))
    
    # Save model
    model_path = 'data/fraud_model.joblib'
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")
    
    # Save a sample of the data for reference
    df.to_csv('data/transactions_sample.csv', index=False)

if __name__ == "__main__":
    train()
