from datetime import datetime
from backend.models import db

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    receiver = db.Column(db.String(80), nullable=False)
    status = db.Column(db.String(20), default='Pending') 
    is_fraud = db.Column(db.Boolean, default=False)
    
    # Context features for ML
    hour = db.Column(db.Integer)
    day_of_week = db.Column(db.Integer)
    location_consistency = db.Column(db.Integer) 
    device_consistency = db.Column(db.Integer)   

class FraudAlert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transaction.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    reason = db.Column(db.String(255))
    is_resolved = db.Column(db.Boolean, default=False)
