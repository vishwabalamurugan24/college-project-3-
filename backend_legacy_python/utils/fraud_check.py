import joblib
import os
import numpy as np

class FraudDetector:
    def __init__(self, model_path='data/fraud_model.joblib'):
        self.model_path = model_path
        self.model = None
        self.load_model()
        
    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except:
                print("Error loading model, using fallback rules.")
        else:
            print("Model path not found, using fallback rules.")
            
    def predict(self, data):
        """
        Predicts if a transaction is fraudulent.
        data: dict with keys [amount, hour, day_of_week, transaction_type, location_consistency, device_consistency]
        """
        # Rule-based fallback
        is_fraud = False
        confidence = 0.5
        
        if data['amount'] > 5000:
            is_fraud = True
            confidence = 0.8
        
        if data['location_consistency'] == 0:
            is_fraud = True
            confidence = 0.7
            
        # ML Prediction if model exists
        if self.model:
            try:
                features = np.array([[
                    data['amount'], 
                    data['hour'], 
                    data['day_of_week'], 
                    data['transaction_type'],
                    data['location_consistency'],
                    data['device_consistency']
                ]])
                ml_pred = self.model.predict(features)[0]
                confidence = self.model.predict_proba(features)[0][1]
                is_fraud = bool(ml_pred)
            except Exception as e:
                print(f"ML Prediction error: {e}")
                
        return is_fraud, confidence
