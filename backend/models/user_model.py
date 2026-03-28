from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

# Import db from the main app or a shared extensions file
# For simplicity in this refactor, we'll assume db is passed or imported
from . import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    balance = db.Column(db.Float, default=10000.0)
    
    transactions = db.relationship('Transaction', backref='user', lazy=True)
