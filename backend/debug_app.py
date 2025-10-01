# backend/debug_app.py
import os
import sys
import traceback
from flask import Flask, jsonify
from flask_cors import CORS

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_app():
    try:
        print("🚀 Starting Flask app creation...")
        
        from config import Config
        from utils.db import db, migrate
        
        app = Flask(__name__)
        app.config.from_object(Config)
        CORS(app)

        # init DB + migrations
        print("📦 Initializing database...")
        db.init_app(app)
        migrate.init_app(app, db)

        # Import models
        print("📚 Importing models...")
        from models import User, Meeting, Project

        # Import blueprints
        print("🔗 Registering blueprints...")
        from routes.auth_routes import bp as auth_bp
        from routes.meeting_routes import bp as meetings_bp
        from routes.ai_routes import bp as ai_bp
        from routes.extension_routes import bp as extensions_bp

        # sanity routes
        @app.get("/")
        def home():
            return jsonify({"message": "AutoMeet backend initialized successfully!"})

        @app.get("/api/health")
        def health():
            return {"status": "ok"}

        # blueprints
        app.register_blueprint(auth_bp)
        app.register_blueprint(meetings_bp)
        app.register_blueprint(ai_bp)
        app.register_blueprint(extensions_bp)

        print("✅ Flask app created successfully!")
        return app, db  # Return both app and db

    except Exception as e:
        print(f"❌ Error creating Flask app: {e}")
        print("📋 Stack trace:")
        traceback.print_exc()
        return None, None

if __name__ == "__main__":
    app, db_instance = create_app()
    if app and db_instance:
        try:
            print("🗄️ Creating database tables...")
            with app.app_context():
                db_instance.create_all()  # Use db_instance instead of db
                print("✅ Database tables created!")
            
            print("🌐 Starting Flask server on http://localhost:5000")
            app.run(debug=True, host="0.0.0.0", port=5000, use_reloader=False)
        except Exception as e:
            print(f"❌ Error starting server: {e}")
            traceback.print_exc()
    else:
        print("❌ Failed to create Flask app")