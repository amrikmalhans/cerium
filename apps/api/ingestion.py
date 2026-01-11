"""
Ingestion module for embedding and storing documents in the database.
"""
from typing import List, Optional
import numpy as np
from embeddings import model
from db import supabase


class DocumentIngestion:
    """
    Handles embedding generation and document insertion into the database.
    """
    
    def __init__(self):
        self.model = model
        self.supabase = supabase
    
    def ingest(self, content: str, user_id: Optional[str] = None) -> dict:
        """
        Embed a string and insert it into the documents table.
        
        Args:
            content: The text content to embed and store
            user_id: Optional user ID to associate with the document
            
        Returns:
            Dictionary containing the inserted document data
            
        Raises:
            Exception: If embedding or insertion fails
        """
        if not content or not content.strip():
            raise ValueError("Content cannot be empty")
        
        # Generate embedding for the content
        # Using encode_document for document content (encode_query is for search queries)
        embedding = self.model.encode_document(content)
        
        # Convert numpy array to list for JSON serialization
        # Handle both single document and batch cases
        if isinstance(embedding, np.ndarray):
            if embedding.ndim == 1:
                embedding_list = embedding.tolist()
            else:
                # If batch, take first item
                embedding_list = embedding[0].tolist()
        else:
            embedding_list = list(embedding)
        
        # Prepare document data
        document_data = {
            'content': content,
            'embedding': embedding_list
        }
        
        # Add user_id if provided
        if user_id:
            document_data['user_id'] = user_id
        
        # Insert into Supabase documents table
        result = self.supabase.table('documents').insert(document_data).execute()
        
        if not result.data:
            raise Exception("Failed to insert document into database")
        
        return result.data[0] if isinstance(result.data, list) else result.data
    
    def ingest_batch(
        self, 
        contents: List[str], 
        user_id: Optional[str] = None,
        user_names: Optional[List[Optional[str]]] = None,
        slack_timestamps: Optional[List[Optional[float]]] = None
    ) -> List[dict]:
        """
        Embed multiple strings and insert them into the documents table in batch.
        
        Args:
            contents: List of text contents to embed and store
            user_id: Optional user ID to associate with all documents
            user_names: Optional list of user names (one per content item)
            slack_timestamps: Optional list of Slack timestamps (one per content item)
            
        Returns:
            List of dictionaries containing the inserted document data
            
        Raises:
            Exception: If embedding or insertion fails
        """
        if not contents:
            raise ValueError("Contents list cannot be empty")
        
        # Filter out empty content and keep track of valid indices
        valid_indices = [i for i, c in enumerate(contents) if c and c.strip()]
        valid_contents = [contents[i] for i in valid_indices]
        
        if not valid_contents:
            raise ValueError("No valid content to process")
        
        # Generate embeddings for all documents at once (more efficient)
        embeddings = self.model.encode_document(valid_contents)
        
        # Convert numpy arrays to lists
        if isinstance(embeddings, np.ndarray):
            embeddings_list = embeddings.tolist()
        else:
            embeddings_list = [list(emb) for emb in embeddings]
        
        # Prepare batch insert data
        documents = []
        for idx, (content, embedding) in enumerate(zip(valid_contents, embeddings_list)):
            doc_data = {
                'content': content,
                'embedding': embedding,
            }
            
            # Add user_id if provided
            if user_id:
                doc_data['user_id'] = user_id
            
            # Add user_name if provided (match by index in valid_indices)
            if user_names and valid_indices[idx] < len(user_names):
                user_name = user_names[valid_indices[idx]]
                if user_name:
                    doc_data['user_name'] = user_name
            
            # Add slack_ts if provided (match by index in valid_indices)
            if slack_timestamps and valid_indices[idx] < len(slack_timestamps):
                slack_ts = slack_timestamps[valid_indices[idx]]
                if slack_ts is not None:
                    doc_data['slack_ts'] = slack_ts
            
            documents.append(doc_data)
        
        # Insert batch into Supabase
        result = self.supabase.table('documents').insert(documents).execute()
        
        if not result.data:
            raise Exception("Failed to insert documents into database")
        
        return result.data


# Create a module-level instance for convenient access
# Usage: from ingestion import ingestion; ingestion.ingest("your text")
ingestion = DocumentIngestion()
