import os
from flask import Flask, render_template, send_from_directory
from flask_login import LoginManager
from flask_cors import CORS
from werkzeug.security import generate_password_hash

from backend.models import db, User
from backend.routes.auth import auth_bp
from backend.routes.transaction import transaction_bp
from backend.routes.admin import admin_bp

def create_app():
    app = Flask(__name__, static_folder='../frontend', template_folder='../frontend', static_url_path='')
    app.config['SECRET_KEY'] = 'secure-banking-key-123'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///netbanking.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app, resources={r"/api/*": {"origins": "*"}}) # Allow all origins for the API initially
    db.init_app(app)

    login_manager = LoginManager(app)
    # login_manager.login_view = 'auth.login' # No longer the primary entry point for users

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(transaction_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')

    @app.route('/api/health')
    def health_check():
        return {"status": "NOMINAL", "identity": "Guardian Ledger AI API"}, 200

    # Removed HTML routes for the static separation. Frontend is on Vercel.

    with app.app_context():
        db.create_all()
        if not User.query.filter_by(username='admin').first():
            hashed_pw = generate_password_hash('admin123', method='sha256')
            admin = User(username='admin', password=hashed_pw, is_admin=True)
            db.session.add(admin)
            db.session.commit()

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
