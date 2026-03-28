from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user_model import User
from .transaction_model import Transaction, FraudAlert
