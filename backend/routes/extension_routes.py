from flask import Blueprint, request, jsonify
from models import db, RawMeetingTranscript, Meeting, MeetingTranscript
from datetime import datetime
import json

bp = Blueprint('extensions', __name__)

@bp.route("/api/extension/transcript", methods=["POST"])
def save_transcript():
    try:
        data = request.get_json(force=True)
        raw_data = data.get("raw_data")
        transcript_text = data.get("transcript", "")
        meeting_id = data.get("meeting_id")
        metadata = data.get("metadata", {})

        # Ensure meeting_id exists or create a dummy meeting
        if not meeting_id:
            new_meeting = Meeting(
                title="AutoCreated Meeting",
                platform=metadata.get("platform", "unknown"),
                meeting_link=metadata.get("meeting_link"),
                started_at=None,
                ended_at=None,
                created_by=None,
                raw_metadata=json.dumps(metadata),
            )
            db.session.add(new_meeting)
            db.session.commit()
            meeting_id = new_meeting.id

        # Save raw data safely
        raw_entry = RawMeetingTranscript(
            meeting_id=meeting_id,
            raw_data=json.dumps(raw_data) if raw_data else "{}",
            transcript_format=metadata.get("format", "raw"),
            source_platform=metadata.get("platform", "unknown"),
        )
        db.session.add(raw_entry)

        # Save transcript safely
        transcript_entry = MeetingTranscript(
            meeting_id=meeting_id,
            full_text=transcript_text or "[empty transcript]"
        )
        db.session.add(transcript_entry)

        db.session.commit()

        return jsonify({"message": "Transcript saved", "meeting_id": meeting_id}), 201

    except Exception as e:
        import traceback
        traceback.print_exc() 
        return jsonify({"error": str(e)}), 500


@bp.route('/api/extension/transcript/processed', methods=['POST'])
def save_processed_transcript():
    """
    Save processed/segmented transcript data
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        meeting_id = data.get('meeting_id')
        full_text = data.get('full_text')
        segments = data.get('segments', [])
        
        if not meeting_id or not full_text:
            return jsonify({"error": "Meeting ID and full text are required"}), 400
        
        # Save the full processed transcript
        transcript = MeetingTranscript(
            meeting_id=meeting_id,
            full_text=full_text
        )
        db.session.add(transcript)
        
        # Save individual segments if provided
        if segments:
            from models import MeetingSegment
            for segment_data in segments:
                segment = MeetingSegment(
                    meeting_id=meeting_id,
                    t_start_ms=segment_data.get('t_start_ms'),
                    t_end_ms=segment_data.get('t_end_ms'),
                    speaker_label=segment_data.get('speaker_label'),
                    text=segment_data.get('text'),
                    confidence=segment_data.get('confidence')
                )
                db.session.add(segment)
        
        db.session.commit()
        
        return jsonify({
            "message": "Processed transcript saved successfully",
            "meeting_id": meeting_id,
            "transcript_id": transcript.id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to save processed transcript: {str(e)}"}), 500

@bp.route('/api/extension/meetings', methods=['GET'])
def get_user_meetings():
    """
    Get meetings for the current user (simplified - would need auth in real implementation)
    """
    try:
        # In a real implementation, you'd get user_id from authentication
        # For now, we'll return all meetings
        meetings = Meeting.query.order_by(Meeting.created_at.desc()).limit(10).all()
        
        result = []
        for meeting in meetings:
            result.append({
                "id": meeting.id,
                "title": meeting.title,
                "platform": meeting.platform,
                "started_at": meeting.started_at.isoformat() if meeting.started_at else None,
                "ended_at": meeting.ended_at.isoformat() if meeting.ended_at else None
            })
        
        return jsonify({"meetings": result}), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch meetings: {str(e)}"}), 500