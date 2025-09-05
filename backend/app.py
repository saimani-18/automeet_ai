from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from utils.db import db, migrate
from models import *  # registers User, Meeting models

# Import blueprints
from routes.auth_routes import bp as auth_bp
from routes.meeting_routes import bp as meetings_bp
from routes.ai_routes import bp as ai_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # init DB + migrations
    db.init_app(app)
    migrate.init_app(app, db)

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

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
