from flask import Blueprint, request, jsonify

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    return jsonify({"message": "registered (stub)", "data": data}), 201

@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    return jsonify({"access_token": "dummy-token", "email": data.get("email")})
