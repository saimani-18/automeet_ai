# backend/services/ingest.py
import math
import re
from datetime import datetime
from services.embeddings import Embeddings
from services.vector_store import FaissVectorStore
import numpy as np
import os

# chunking settings
CHUNK_SIZE = int(os.environ.get("RAG_CHUNK_SIZE", 1000))     # characters
CHUNK_OVERLAP = int(os.environ.get("RAG_CHUNK_OVERLAP", 200))

def clean_text(s: str) -> str:
    # simple cleaning; extend to remove timestamps, speaker tokens, etc.
    if not s:
        return ""
    s = s.strip()
    s = re.sub(r"\s+", " ", s)
    return s

def chunk_text(text: str, chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP):
    text = clean_text(text)
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - chunk_overlap
        if start < 0:
            start = 0
    return chunks

# initialize singletons
EMBEDDER = Embeddings()
# initialize vector store lazily with known dim from embedder
VECTOR_STORE = FaissVectorStore(dim=EMBEDDER.model.get_sentence_embedding_dimension())

def ingest_transcript(meeting_id: int, raw_text: str, source_platform: str = None, transcript_format: str = None):
    """
    - Save RawMeetingTranscript & MeetingTranscript
    - Chunk raw_text, embed chunks, upsert to FAISS with metadata
    """
    from app import create_app
    from models import db, RawMeetingTranscript, MeetingTranscript
    
    app = create_app()
    
    with app.app_context():
        now = datetime.utcnow()
        # Save raw transcript row
        raw_row = RawMeetingTranscript(
            meeting_id=meeting_id, 
            raw_data=raw_text,
            transcript_format=transcript_format, 
            source_platform=source_platform,
            created_at=now, 
            updated_at=now
        )
        db.session.add(raw_row)
        db.session.commit()

        # Save summarized 'full_text' row (could be same as raw or preprocessed)
        mt = MeetingTranscript(
            meeting_id=meeting_id, 
            full_text=raw_text, 
            created_at=now, 
            updated_at=now
        )
        db.session.add(mt)
        db.session.commit()

        # chunk
        chunks = chunk_text(raw_text)
        vectors = EMBEDDER.embed_texts(chunks)  # (n, d)
        metadatas = []
        for i, c in enumerate(chunks):
            meta = {
                "meeting_id": int(meeting_id),
                "chunk_index": i,
                "text_snippet": c[:400],  # store first 400 chars for reference
                "created_at": now.isoformat(),
            }
            metadatas.append(meta)
        # add to vector store
        VECTOR_STORE.add(vectors, metadatas)

        return {"ingested_chunks": len(chunks), "vector_total": VECTOR_STORE.get_total_count()}