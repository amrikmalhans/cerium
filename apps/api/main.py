from fastapi import FastAPI, HTTPException
from models import ExtractRequest, RetrieveRequest, RetrieveResponse, DocumentMatch
from extractors import get_extractor
from embeddings import model
from db import supabase
import numpy as np

app = FastAPI()


@app.post("/extract")
def extract_data(request: ExtractRequest):
    """
    Extract data from various services (Slack, GitHub, Google, etc.).
    
    Accepts a service parameter and service-specific fields to extract data.
    Returns service-specific response format.
    """
    # Validate service-specific required fields
    if request.service.value == "slack":
        if not request.conversation_name:
            raise HTTPException(
                status_code=400,
                detail="conversation_name is required when service is 'slack'"
            )
        if not request.conversation_type:
            raise HTTPException(
                status_code=400,
                detail="conversation_type is required when service is 'slack'"
            )
    
    # Get the appropriate extractor for the service
    extractor = get_extractor(request.service.value)
    
    # Extract data using the service-specific extractor
    return extractor.extract(request)


@app.post("/retrieve", response_model=RetrieveResponse)
def retrieve_documents(request: RetrieveRequest):
    """
    Retrieve documents using semantic search based on a user prompt.
    
    Converts the prompt to an embedding and searches for similar documents
    using the match_documents Postgres function.
    """
    try:
        # Generate embedding from the prompt
        # Using encode() for query embedding (standard SentenceTransformer method)
        embedding = model.encode(request.prompt)
        # Convert numpy array to list for JSON serialization
        if isinstance(embedding, np.ndarray):
            if embedding.ndim == 1:
                embedding_list = embedding.tolist()
            else:
                # If batch, take first item
                embedding_list = embedding[0].tolist()
        else:
            embedding_list = list(embedding)
        
        # Call the Postgres function via Supabase RPC
        response = supabase.rpc(
            "match_documents",
            {
                "query_embedding": embedding_list,
                "match_count": request.match_count,
                "match_threshold": request.match_threshold
            }
        ).execute()
        
        # Parse the response
        matches = [
            DocumentMatch(**match) for match in response.data
        ]
        
        return RetrieveResponse(
            matches=matches,
            count=len(matches)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving documents: {str(e)}"
        )


@app.get("/health")
def health_check():
    return {"status": "ok"}

