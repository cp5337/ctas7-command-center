import torch
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional, Union
import pickle
import os

class SemanticEmbedder:
    """
    Semantic embedding engine for CTAS-HASH integration.
    Provides high-quality embeddings for patent search and semantic analysis.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2", cache_dir: Optional[str] = None):
        """
        Initialize the semantic embedder.

        Args:
            model_name: HuggingFace model name for embeddings
            cache_dir: Directory to cache embeddings
        """
        self.model = SentenceTransformer(model_name)
        self.cache_dir = cache_dir
        self.embedding_cache = {}

        if cache_dir and os.path.exists(os.path.join(cache_dir, "embeddings.pkl")):
            self._load_cache()

    def embed_text(self, text: Union[str, List[str]], normalize: bool = True) -> np.ndarray:
        """
        Generate semantic embeddings for text.

        Args:
            text: Text or list of texts to embed
            normalize: Whether to L2 normalize embeddings

        Returns:
            Embedding vectors as numpy array
        """
        # Check cache first
        if isinstance(text, str) and text in self.embedding_cache:
            return self.embedding_cache[text]

        # Generate embeddings
        embeddings = self.model.encode(text, normalize_embeddings=normalize)

        # Cache single text embeddings
        if isinstance(text, str):
            self.embedding_cache[text] = embeddings
            if self.cache_dir:
                self._save_cache()

        return embeddings

    def embed_document_sections(self, document_sections: Dict[str, str]) -> Dict[str, np.ndarray]:
        """
        Embed document sections with section-level granularity.

        Args:
            document_sections: Dict mapping section IDs to text content

        Returns:
            Dict mapping section IDs to embeddings
        """
        section_embeddings = {}

        for section_id, content in document_sections.items():
            # Clean and preprocess content
            cleaned_content = self._preprocess_text(content)
            embedding = self.embed_text(cleaned_content)
            section_embeddings[section_id] = embedding

        return section_embeddings

    def compute_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Compute cosine similarity between two embeddings.

        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector

        Returns:
            Cosine similarity score (0-1)
        """
        # Ensure embeddings are normalized
        embedding1 = embedding1 / np.linalg.norm(embedding1)
        embedding2 = embedding2 / np.linalg.norm(embedding2)

        return np.dot(embedding1, embedding2)

    def find_similar_sections(self, query_embedding: np.ndarray,
                            section_embeddings: Dict[str, np.ndarray],
                            threshold: float = 0.7,
                            top_k: int = 10) -> List[tuple]:
        """
        Find sections similar to a query embedding.

        Args:
            query_embedding: Query vector to match against
            section_embeddings: Dict of section embeddings to search
            threshold: Minimum similarity threshold
            top_k: Maximum number of results to return

        Returns:
            List of (section_id, similarity_score) tuples
        """
        similarities = []

        for section_id, embedding in section_embeddings.items():
            similarity = self.compute_similarity(query_embedding, embedding)
            if similarity >= threshold:
                similarities.append((section_id, similarity))

        # Sort by similarity and return top-k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]

    def should_embed(self, fingerprint: str, novelty_score: float,
                    cuid: str, mode: str = "adaptive") -> bool:
        """
        Determine if content should be embedded based on CTAS-HASH metrics.
        Integrates with the hybrid approach discussed in the specification.

        Args:
            fingerprint: CTAS-HASH fingerprint
            novelty_score: Computed novelty score
            cuid: Contextual unique identifier
            mode: Embedding decision mode

        Returns:
            Boolean indicating whether to embed
        """
        if mode == "strict":
            return novelty_score > 0.85
        elif mode == "targeted":
            return "prior_art" in cuid or "claim" in cuid
        elif mode == "adaptive":
            return novelty_score > 0.6 and "concept_expansion" in cuid
        elif mode == "manual":
            return True
        else:
            return False

    def extract_features(self, text: str, feature_dim: int = 64) -> List[float]:
        """
        Extract numerical features for GNN integration.

        Args:
            text: Input text content
            feature_dim: Desired feature vector dimension

        Returns:
            Feature vector as list of floats
        """
        # Get full embedding
        embedding = self.embed_text(text)

        # Reduce dimensionality if needed
        if len(embedding) > feature_dim:
            # Simple downsampling - could use PCA for better results
            step = len(embedding) // feature_dim
            reduced = embedding[::step][:feature_dim]
        else:
            # Pad if too small
            reduced = np.pad(embedding, (0, max(0, feature_dim - len(embedding))))

        return reduced.tolist()

    def _preprocess_text(self, text: str) -> str:
        """
        Clean and preprocess text for embedding.

        Args:
            text: Raw text content

        Returns:
            Cleaned text
        """
        # Remove excessive whitespace
        text = ' '.join(text.split())

        # Truncate if too long (model limits)
        max_length = 512  # Conservative limit for most models
        if len(text.split()) > max_length:
            text = ' '.join(text.split()[:max_length])

        return text

    def _save_cache(self):
        """Save embedding cache to disk."""
        if self.cache_dir:
            os.makedirs(self.cache_dir, exist_ok=True)
            cache_path = os.path.join(self.cache_dir, "embeddings.pkl")
            with open(cache_path, 'wb') as f:
                pickle.dump(self.embedding_cache, f)

    def _load_cache(self):
        """Load embedding cache from disk."""
        if self.cache_dir:
            cache_path = os.path.join(self.cache_dir, "embeddings.pkl")
            try:
                with open(cache_path, 'rb') as f:
                    self.embedding_cache = pickle.load(f)
            except (FileNotFoundError, pickle.UnpicklingError):
                self.embedding_cache = {}

    def get_cache_stats(self) -> Dict[str, int]:
        """Get statistics about the embedding cache."""
        return {
            "cached_embeddings": len(self.embedding_cache),
            "cache_enabled": self.cache_dir is not None
        }