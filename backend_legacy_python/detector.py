import joblib
import os
import pandas as pd
from datetime import datetime

class FraudDetector:
    def __init__(self, model_path='data/fraud_model.joblib'):
        self.model_path = model_path
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                print(f"Model loaded from {self.model_path}")
            except Exception as e:
                print(f"Error loading model: {e}")
                self.model = None
        else:
            print(f"Model not found at {self.model_path}. Using rule-based fallback.")
            self.model = None

    def predict(self, transaction_data):
        """
        transaction_data: dict with keys:
        - amount
        - hour
        - day_of_week
        - transaction_type (0-3)
        - location_consistency (0 or 1)
        - device_consistency (0 or 1)
        """
        if self.model:
            # Prepare feature vector for ML
            df = pd.DataFrame([transaction_data])
            # Ensure columns match training data order
            cols = ['amount', 'hour', 'day_of_week', 'transaction_type', 
                    'location_consistency', 'device_consistency']
            df = df[cols]
            
            is_fraud = self.model.predict(df)[0]
            confidence = self.model.predict_proba(df)[0][1] if hasattr(self.model, 'predict_proba') else 1.0
            return bool(is_fraud), float(confidence)
        else:
            # Fallback heuristic rules
            is_fraud = False
            confidence = 0.0
            
            # Rule 1: High amount
            if transaction_data['amount'] > 4000:
                is_fraud = True
                confidence = 0.8
            
            # Rule 2: Night time + unusual device
            if (transaction_data['hour'] < 5 or transaction_data['hour'] > 23) and transaction_data['device_consistency'] == 1:
                is_fraud = True
                confidence = 0.9
                
            return is_fraud, confidence
