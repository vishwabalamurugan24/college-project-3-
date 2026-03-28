from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from ..models.transaction_model import Transaction, FraudAlert
from ..models import db
from ..utils.fraud_check import FraudDetector

transaction_bp = Blueprint('transaction', __name__)
detector = FraudDetector()

@transaction_bp.route('/transaction', methods=['POST'])
@login_required
def create_transaction():
    data = request.json
    amount = float(data['amount'])
    
    if amount > current_user.balance:
        return jsonify({'message': 'Insufficient funds'}), 400
    
    now = datetime.now()
    trans_data = {
        'amount': amount,
        'hour': now.hour,
        'day_of_week': now.weekday(),
        'transaction_type': 0,
        'location_consistency': data.get('location_consistency', 0),
        'device_consistency': data.get('device_consistency', 0)
    }
    
    is_fraud, confidence = detector.predict(trans_data)
    
    new_trans = Transaction(
        user_id=current_user.id,
        amount=amount,
        receiver=data['receiver'],
        hour=now.hour,
        day_of_week=now.weekday(),
        location_consistency=trans_data['location_consistency'],
        device_consistency=trans_data['device_consistency'],
        is_fraud=is_fraud,
        status='Flagged' if is_fraud else 'Approved'
    )
    
    if is_fraud:
        db.session.add(new_trans)
        db.session.commit()
        alert = FraudAlert(
            transaction_id=new_trans.id,
            reason=f"Suspicious activity detected (Confidence: {confidence:.2f})"
        )
        db.session.add(alert)
        db.session.commit()
    else:
        current_user.balance -= amount
        db.session.add(new_trans)
        db.session.commit()
        
    return jsonify({
        'message': 'Transaction processed',
        'is_fraud': is_fraud,
        'status': new_trans.status,
        'balance': current_user.balance
    }), 201

@transaction_bp.route('/dashboard')
@login_required
def dashboard():
    transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.timestamp.desc()).limit(10).all()
    trans_list = [{
        'id': t.id,
        'amount': t.amount,
        'receiver': t.receiver,
        'timestamp': t.timestamp.strftime('%Y-%m-%d %H:%M'),
        'status': t.status,
        'is_fraud': t.is_fraud
    } for t in transactions]
    
    return jsonify({
        'balance': current_user.balance,
        'transactions': trans_list
    })
