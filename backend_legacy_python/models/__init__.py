from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from backend.models.user_model import User
from backend.models.transaction_model import Transaction, FraudAlert
