from flask import Blueprint, request, jsonify

bp = Blueprint("meetings", __name__, url_prefix="/api/meetings")

@bp.get("/")
def list_meetings():
    return jsonify({"items": []})

@bp.post("/")
def create_meeting():
    data = request.get_json(silent=True) or {}
    # Return a fake id so frontend can proceed during Sprint 1
    return jsonify({"id": 1, "received": data}), 201
