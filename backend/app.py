from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from utils.db import db, migrate
<<<<<<< Updated upstream
from models import *  # registers User, Meeting models

# Import blueprints
from routes.auth_routes import bp as auth_bp
from routes.meeting_routes import bp as meetings_bp
from routes.ai_routes import bp as ai_bp
=======
import os 
>>>>>>> Stashed changes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

<<<<<<< Updated upstream
    # init DB + migrations
    db.init_app(app)
    migrate.init_app(app, db)

    # sanity routes
=======
    # Initialize DB first
    db.init_app(app)
    migrate.init_app(app, db)

    # Now import models and blueprints
    with app.app_context():
        # Import models
        from models import User, Meeting, Project, MeetingTranscript, RawMeetingTranscript
        
    

        # Import blueprints
        from routes.auth_routes import bp as auth_bp
        from routes.meeting_routes import bp as meetings_bp
        from routes.ai_routes import bp as ai_bp
        from routes.extension_routes import bp as extensions_bp

        # Register blueprints
        app.register_blueprint(auth_bp)
        app.register_blueprint(meetings_bp)
        app.register_blueprint(ai_bp)
        app.register_blueprint(extensions_bp)

    # Routes
>>>>>>> Stashed changes
    @app.get("/")
    def home():
        return jsonify({"message": "AutoMeet backend initialized successfully!"})

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

<<<<<<< Updated upstream
    # blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(meetings_bp)
    app.register_blueprint(ai_bp)

=======
>>>>>>> Stashed changes
    return app

if __name__ == "__main__":
    app = create_app()
<<<<<<< Updated upstream
    app.run(debug=True)
=======
    print("🌐 Starting Flask server on http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
>>>>>>> Stashed changes
