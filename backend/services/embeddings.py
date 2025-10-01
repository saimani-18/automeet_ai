# backend/services/embeddings.py
import os
from sentence_transformers import SentenceTransformer
import numpy as np

_EMBED_MODEL = os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

class Embeddings:
    def __init__(self, model_name: str = None):
        model_name = model_name or _EMBED_MODEL
        # load the sentence-transformers model
        self.model = SentenceTransformer(model_name)

    def embed_texts(self, texts):
        """
        Accepts list of strings -> returns numpy array (n, d)
        """
        if not isinstance(texts, list):
            texts = [texts]
        embs = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        # ensure float32 for faiss
        return embs.astype('float32')

    def embed_text(self, text):
        return self.embed_texts([text])[0]
