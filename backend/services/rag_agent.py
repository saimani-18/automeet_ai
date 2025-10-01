# backend/services/rag_agent.py
from services.embeddings import Embeddings
from services.vector_store import FaissVectorStore
from services.llm_client import generate
import os
import textwrap
import json

EMBEDDER = Embeddings()
VECTOR_STORE = FaissVectorStore(dim=EMBEDDER.model.get_sentence_embedding_dimension())
TOP_K = int(os.environ.get("TOP_K", 5))

SYSTEM_PROMPT_RAG = """
You are MeetingAssist — a helpful meeting assistant. Use the provided context snippets to answer user queries.
When you reference facts, include source references in the form (meeting_id:chunk_index).
If the question is out of scope of the context, say so and offer next steps.
Keep answers concise and actionable.
"""

SYSTEM_PROMPT_GENERAL = """
You are MeetingAssist — a helpful AI assistant. Answer the user's question helpfully and accurately.
If the question seems related to meetings, projects, or business contexts, provide general best practices.
Be concise and actionable in your responses.
"""

def build_prompt(user_query: str, retrieved_chunks: list):
    if not retrieved_chunks:
        # No context found - use general knowledge
        return user_query
    
    # retrieved_chunks: list of dicts with metadata & maybe full snippet
    context_texts = []
    for r in retrieved_chunks:
        meta = r.get("metadata", {})
        snippet = meta.get("text_snippet", "")
        m_id = meta.get("meeting_id")
        cidx = meta.get("chunk_index")
        header = f"[meeting:{m_id} chunk:{cidx}]"
        context_texts.append(f"{header}\n{snippet}")

    context_block = "\n\n---\n\n".join(context_texts)
    prompt = textwrap.dedent(f"""
    Context:
    {context_block}

    User question:
    {user_query}

    Answer using only the context above; if you need to cite context, use (meeting_id:chunk_index).
    Provide a short answer and then a 2-3 line action list if applicable.
    """)
    return prompt

def retrieve_and_generate(query: str, top_k: int = TOP_K):
    q_emb = EMBEDDER.embed_text(query).reshape(1, -1)
    retrieved = VECTOR_STORE.search(q_emb, top_k=top_k)
    
    if not retrieved:
        # No relevant context found - use general knowledge
        print("🔍 No relevant context found, using general knowledge...")
        answer = generate(query, system_prompt=SYSTEM_PROMPT_GENERAL, max_tokens=600, temperature=0.2)
        return {"answer": answer, "sources": [], "context_used": False}
    else:
        # Context found - use RAG
        print(f"🔍 Found {len(retrieved)} relevant context chunks")
        prompt = build_prompt(query, retrieved)
        answer = generate(prompt, system_prompt=SYSTEM_PROMPT_RAG, max_tokens=600, temperature=0.2)
        return {"answer": answer, "sources": retrieved, "context_used": True}