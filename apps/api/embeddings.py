"""
Embedding model for generating vector embeddings.
Provides a single instance of the SentenceTransformer model that can be used across the codebase.
"""
from sentence_transformers import SentenceTransformer

# Create a single model instance at module level
# This model will be downloaded from Hugging Face Hub on first import
# Usage: from embeddings import model; embeddings = model.encode_query("your text")
model: SentenceTransformer = SentenceTransformer("google/embeddinggemma-300m")

