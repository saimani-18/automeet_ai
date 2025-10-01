from app import app   # import your Flask app
from models import RawMeetingTranscript
import json

with app.app_context():   # <-- this sets up the Flask context
    all_records = RawMeetingTranscript.query.all()

    for record in all_records:
        raw_json = record.raw_data
        try:
            data = json.loads(raw_json)
        except json.JSONDecodeError:
            print(f"Error decoding JSON for record ID {record.id}")
            continue

        cleaned = [
            {"speaker": item["speaker"], "text": item["text"], "timestamp": item["timestamp"]}
            for item in data
            if item["speaker"].lower() not in ["arrow_downward", "person_add", "system", "live captions"]
               and item["text"].strip() != ""
        ]

        print(f"Meeting ID: {record.meeting_id}")
        for c in cleaned:
            print(f"[{c['timestamp']}] {c['speaker']}: {c['text']}")
        print("------")
