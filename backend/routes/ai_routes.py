from flask import Blueprint, request, jsonify

bp = Blueprint("ai", __name__, url_prefix="/api/ai")

@bp.post("/transcribe")
def transcribe():
    data = request.get_json(silent=True) or {}
    return jsonify({"transcript": "[stub transcript]", "source": data.get("audio_url")})
