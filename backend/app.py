from flask import Flask, jsonify
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # allow frontend requests (useful later)

    @app.route("/")
    def home():
        return jsonify({"message": "AutoMeet backend initialized successfully!"})

    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)

