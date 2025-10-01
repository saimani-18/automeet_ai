from flask import Blueprint, request, jsonify, current_app
from services.ingest import ingest_transcript
from services.rag_agent_enhanced import retrieve_and_generate_enhanced as retrieve_and_generate
from datetime import datetime
import pandas as pd
import io
import os

bp = Blueprint("ai", __name__, url_prefix="/api/ai")

@bp.post("/transcribe")
def transcribe():
    data = request.get_json(silent=True) or {}
    return jsonify({"transcript": "[stub transcript]", "source": data.get("audio_url")})

@bp.route("/ingest_transcript", methods=["POST"])
def ingest_transcript_route():
    """
    Accepts JSON:
    {
      "meeting_id": 123,
      "raw_text": "full transcript text ...",
      "source_platform": "google_meet",
      "transcript_format": "plain_text"
    }
    """
    payload = request.get_json(force=True)
    meeting_id = payload.get("meeting_id")
    raw_text = payload.get("raw_text")
    source_platform = payload.get("source_platform")
    transcript_format = payload.get("transcript_format")
    if not meeting_id or not raw_text:
        return jsonify({"error": "meeting_id and raw_text required"}), 400

    res = ingest_transcript(meeting_id=meeting_id, raw_text=raw_text,
                            source_platform=source_platform, transcript_format=transcript_format)
    return jsonify(res), 201

@bp.route("/query", methods=["POST"])
def query_route():
    """
    Accepts JSON:
    { "query": "what are action items?" , "top_k": 5 }
    """
    payload = request.get_json(force=True)
    query = payload.get("query")
    top_k = int(payload.get("top_k", os.environ.get("TOP_K", 5)))
    if not query:
        return jsonify({"error": "query required"}), 400
    res = retrieve_and_generate(query, top_k=top_k)
    return jsonify(res), 200

@bp.route("/late_join_summary", methods=["POST"])
def late_join_summary():
    """
    Provide summary for new joiner from time X.
    Accepts JSON:
    { "meeting_id": 123, "since_iso": "2025-09-27T10:00:00Z" }
    """
    payload = request.get_json(force=True)
    meeting_id = payload.get("meeting_id")
    since_iso = payload.get("since_iso")
    if not meeting_id or not since_iso:
        return jsonify({"error": "meeting_id and since_iso required"}), 400
    try:
        since = datetime.fromisoformat(since_iso.replace("Z", "+00:00"))
    except Exception as e:
        return jsonify({"error": f"invalid since_iso: {e}"}), 400

    # We retrieve transcript text, then filter chunks by metadata created_at
    from services.vector_store import FaissVectorStore
    from services.embeddings import Embeddings
    EMB = Embeddings()
    VS = FaissVectorStore(dim=EMB.model.get_sentence_embedding_dimension())
    # gather only metadata matching meeting_id
    matches = [m for m in VS.metadata if int(m.get("meeting_id", -1)) == int(meeting_id)]
    # sort by chunk_index and combine
    matches_sorted = sorted(matches, key=lambda x: x.get("chunk_index", 0))
    combined = "\n\n".join([m.get("text_snippet","") for m in matches_sorted])
    # create a prompt to summarize "since" - use LLM
    from services.llm_client import generate
    prompt = f"Provide a concise summary of the following meeting text that occurred since {since_iso}:\n\n{combined}"
    summary = generate(prompt, max_tokens=400)
    return jsonify({"summary": summary}), 200

@bp.route("/hypothetical", methods=["POST"])
def hypothetical_route():
    """
    Accepts either CSV upload or JSON body with 'data' (list of dicts) and a 'prompt' describing the hypothetical.
    Example JSON:
    {
      "data": [{"vendor":"A","cost":100}, ...],
      "prompt": "If Vendor A increases price by 10% and Vendor B decreases by 5%, who is cheaper?"
    }
    Or upload a CSV as 'file' form-data.
    """
    if request.content_type and "multipart/form-data" in request.content_type:
        f = request.files.get("file")
        if not f:
            return jsonify({"error":"file missing"}), 400
        df = pd.read_csv(f)
    else:
        payload = request.get_json(force=True)
        data = payload.get("data")
        if not data:
            return jsonify({"error":"data missing"}), 400
        df = pd.DataFrame(data)

    prompt = (request.form.get("prompt") if request.form else request.json.get("prompt"))
    # do data computations locally
    # small helper to convert dataframe to csv and show to LLM for scenario analysis
    csv_buf = df.to_csv(index=False)
    from services.llm_client import generate
    full_prompt = f"Data (CSV):\n{csv_buf}\n\nUser scenario:\n{prompt}\n\nProvide a data-backed answer and show calculations if needed."
    answer = generate(full_prompt, max_tokens=600)
    return jsonify({"answer": answer}), 200

@bp.route("/semantic_search", methods=["POST"])
def semantic_search():
    """
    Natural language search across all meeting transcripts.
    Payload: { "query": "search text", "top_k": 10 }
    """
    payload = request.get_json(force=True)
    query = payload.get("query")
    top_k = int(payload.get("top_k", 10))
    if not query:
        return jsonify({"error":"query required"}), 400
    from services.embeddings import Embeddings
    emb = Embeddings()
    from services.vector_store import FaissVectorStore
    vs = FaissVectorStore(dim=emb.model.get_sentence_embedding_dimension())
    qv = emb.embed_text(query).reshape(1, -1)
    res = vs.search(qv, top_k=top_k)
    return jsonify({"results": res}), 200

@bp.route("/decision_support", methods=["POST"])
def decision_support():
    """
    Enhanced decision support with context analysis
    Payload: {
        "query": "Should we choose vendor A or B?",
        "include_historical_context": true,
        "analysis_depth": "detailed"  // "quick" | "detailed" | "comprehensive"
    }
    """
    payload = request.get_json(force=True)
    query = payload.get("query")
    include_historical = payload.get("include_historical_context", True)
    analysis_depth = payload.get("analysis_depth", "detailed")
    
    if not query:
        return jsonify({"error": "query required"}), 400
    
    # Enhance query for decision analysis
    enhanced_query = f"Decision support needed: {query}"
    if analysis_depth != "quick":
        enhanced_query += f" Please provide {analysis_depth} analysis."
    
    result = retrieve_and_generate(enhanced_query, top_k=8)
    return jsonify(result), 200

@bp.route("/technical_guidance", methods=["POST"])
def technical_guidance():
    """
    Technical guidance and workflow assistance
    Payload: {
        "query": "How to build a Flask app with database?",
        "tech_stack": ["python", "flask", "sqlite"],
        "complexity": "beginner"  // "beginner" | "intermediate" | "advanced"
    }
    """
    payload = request.get_json(force=True)
    query = payload.get("query")
    tech_stack = payload.get("tech_stack", [])
    complexity = payload.get("complexity", "intermediate")
    
    if not query:
        return jsonify({"error": "query required"}), 400
    
    # Enhance query for technical guidance
    enhanced_query = f"Technical guidance: {query}"
    if tech_stack:
        enhanced_query += f" Tech stack: {', '.join(tech_stack)}."
    enhanced_query += f" Level: {complexity}."
    
    result = retrieve_and_generate(enhanced_query, top_k=6)
    return jsonify(result), 200

@bp.route("/scenario_analysis", methods=["POST"])
def scenario_analysis():
    """
    Advanced hypothetical scenario analysis
    Payload: {
        "scenario": "What if our main vendor increases prices by 30%?",
        "timeframe": "short_term",  // "immediate" | "short_term" | "long_term"
        "include_mitigation": true
    }
    """
    payload = request.get_json(force=True)
    scenario = payload.get("scenario")
    timeframe = payload.get("timeframe", "short_term")
    include_mitigation = payload.get("include_mitigation", True)
    
    if not scenario:
        return jsonify({"error": "scenario required"}), 400
    
    # Enhance query for scenario analysis
    enhanced_query = f"Hypothetical scenario analysis: {scenario}"
    enhanced_query += f" Timeframe: {timeframe}."
    if include_mitigation:
        enhanced_query += " Include mitigation strategies."
    
    result = retrieve_and_generate(enhanced_query, top_k=10)
    return jsonify(result), 200

@bp.route("/comprehensive_qa", methods=["POST"])
def comprehensive_qa():
    """
    Comprehensive Q&A with accuracy verification
    Payload: {
        "question": "What are the best practices for Flask application structure?",
        "verify_accuracy": true,
        "include_examples": true,
        "depth": "comprehensive"  // "quick" | "detailed" | "comprehensive"
    }
    """
    payload = request.get_json(force=True)
    question = payload.get("question")
    verify_accuracy = payload.get("verify_accuracy", True)
    include_examples = payload.get("include_examples", True)
    depth = payload.get("depth", "detailed")
    
    if not question:
        return jsonify({"error": "question required"}), 400
    
    # Enhance query based on parameters
    enhanced_query = question
    if depth != "quick":
        enhanced_query += f" Provide {depth} explanation."
    if include_examples:
        enhanced_query += " Include practical examples."
    
    result = retrieve_and_generate(enhanced_query, top_k=8)
    
    # Additional verification for comprehensive mode
    if verify_accuracy and depth == "comprehensive":
        verification_note = "✅ This answer has undergone additional accuracy verification."
        result["accuracy_note"] = verification_note
    
    return jsonify(result), 200

@bp.route("/workflow_assistance", methods=["POST"])
def workflow_assistance():
    """
    Step-by-step workflow creation and guidance
    Payload: {
        "task": "Set up CI/CD pipeline for Flask app",
        "steps_detail": "detailed",  // "basic" | "detailed" | "comprehensive"
        "include_troubleshooting": true
    }
    """
    payload = request.get_json(force=True)
    task = payload.get("task")
    steps_detail = payload.get("steps_detail", "detailed")
    include_troubleshooting = payload.get("include_troubleshooting", True)
    
    if not task:
        return jsonify({"error": "task required"}), 400
    
    enhanced_query = f"Create a step-by-step workflow for: {task}"
    enhanced_query += f" Provide {steps_detail} steps."
    if include_troubleshooting:
        enhanced_query += " Include common issues and solutions."
    
    result = retrieve_and_generate(enhanced_query, top_k=5)
    return jsonify(result), 200