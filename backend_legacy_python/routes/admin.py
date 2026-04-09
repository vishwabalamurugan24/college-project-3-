from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from backend.models.user_model import User
from backend.models.transaction_model import Transaction, FraudAlert
from backend.models import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/stats')
@login_required
def admin_stats():
    if not current_user.is_admin:
        return jsonify({'message': 'Unauthorized'}), 403
    
    total_transactions = Transaction.query.count()
    fraud_cases = Transaction.query.filter_by(is_fraud=True).count()
    recent_alerts = FraudAlert.query.order_by(FraudAlert.timestamp.desc()).limit(10).all()
    
    alerts_list = []
    for a in recent_alerts:
        t = Transaction.query.get(a.transaction_id)
        u = User.query.get(t.user_id) if t else None
        alerts_list.append({
            'id': a.id,
            'reason': a.reason,
            'timestamp': a.timestamp.strftime('%Y-%m-%d %H:%M'),
            'amount': t.amount if t else 0,
            'username': u.username if u else 'Unknown',
            'is_resolved': a.is_resolved
        })
    
    return jsonify({
        'total_transactions': total_transactions,
        'fraud_cases': fraud_cases,
        'recent_alerts': alerts_list
    })

@admin_bp.route('/admin/users')
@login_required
def admin_users():
    if not current_user.is_admin:
        return jsonify({'message': 'Unauthorized'}), 403
    
    users = User.query.all()
    user_list = [{
        'id': u.id,
        'username': u.username,
        'is_admin': u.is_admin,
        'balance': u.balance,
        'status': 'Active'
    } for u in users]
    
    return jsonify(user_list)
