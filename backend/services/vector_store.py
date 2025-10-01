# backend/services/vector_store.py
import os
import json
import faiss
import numpy as np
from pathlib import Path

VECTOR_DIR = Path(os.environ.get("VECTOR_STORE_PATH", "./faiss_index"))
VECTOR_DIR.mkdir(parents=True, exist_ok=True)
INDEX_FILE = VECTOR_DIR / "index.faiss"
META_FILE = VECTOR_DIR / "metadata.json"

class FaissVectorStore:
    def __init__(self, dim: int):
        self.dim = dim
        self.index = None
        self._load_or_init()
        # metadata: list of dicts aligned with index order
        self.metadata = self._load_metadata()

    def _load_or_init(self):
        if INDEX_FILE.exists():
            self.index = faiss.read_index(str(INDEX_FILE))
            # attempt to get dim from index
            self.dim = self.index.d
        else:
            # flat index for simplicity
            self.index = faiss.IndexFlatL2(self.dim)

    def _load_metadata(self):
        if META_FILE.exists():
            with open(META_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def _persist(self):
        faiss.write_index(self.index, str(INDEX_FILE))
        with open(META_FILE, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=2)

    def add(self, vectors: np.ndarray, metadatas: list):
        """
        vectors: np.ndarray shape (n, dim)
        metadatas: list of dicts length n
        """
        assert vectors.shape[1] == self.dim
        self.index.add(vectors)
        self.metadata.extend(metadatas)
        self._persist()

    def search(self, query_vector: np.ndarray, top_k: int = 5):
        """
        query_vector: np.ndarray shape (1, dim)
        returns list of (score, metadata) pairs
        """
        if self.index.ntotal == 0:
            return []
        dists, ids = self.index.search(query_vector, top_k)
        results = []
        for dist, idx in zip(dists[0], ids[0]):
            if idx < 0 or idx >= len(self.metadata):
                continue
            results.append({"score": float(dist), "metadata": self.metadata[idx], "id": int(idx)})
        return results

    def get_total_count(self):
        return int(self.index.ntotal)

    def reset(self):
        self.index = faiss.IndexFlatL2(self.dim)
        self.metadata = []
        self._persist()
