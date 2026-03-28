from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    balance = db.Column(db.Float, default=10000.0)
    
    transactions = db.relationship('Transaction', backref='user', lazy=True)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    receiver = db.Column(db.String(80), nullable=False)
    status = db.Column(db.String(20), default='Pending') # Pending, Approved, Blocked
    is_fraud = db.Column(db.Boolean, default=False)
    
    # Context features for ML
    hour = db.Column(db.Integer)
    day_of_week = db.Column(db.Integer)
    location_consistency = db.Column(db.Integer) # 0 or 1
    device_consistency = db.Column(db.Integer)   # 0 or 1

class FraudAlert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transaction.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    reason = db.Column(db.String(255))
    is_resolved = db.Column(db.Boolean, default=False)
