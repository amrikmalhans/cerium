from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ExtractRequest, RetrieveRequest, RetrieveResponse, DocumentMatch, SlackChannelsRequest, SlackChannelsResponse, SlackChannel
from extractors import get_extractor
from embeddings import model
from db import supabase
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from ingestion import ingestion
from helpers import get_user_name
import numpy as np

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add your frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/extract")
def extract_data(request: ExtractRequest):
    """
    Extract data from various services (Slack, GitHub, Google, etc.).
    
    Accepts a service parameter and service-specific fields to extract data.
    For Slack, also ingests the extracted messages as embeddings into Supabase.
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
    extracted_data = extractor.extract(request)
    
    # If Slack, ingest the messages into the database
    if request.service.value == "slack" and extracted_data.get("ok") and extracted_data.get("messages"):
        try:
            messages = extracted_data.get("messages", [])
            
            # Initialize Slack client to look up user names
            slack_token = request.slack_bot_token
            client = WebClient(token=slack_token) if slack_token else None
            
            # Prepare content strings and user names for ingestion
            contents = []
            user_names = []
            slack_timestamps = []
            
            for message in messages:
                # Skip bot messages and messages without text
                if message.get("bot_id") or not message.get("text"):
                    continue
                
                # Get message details
                slack_user_id = message.get("user")
                text = message.get("text", "")
                ts = message.get("ts")
                
                # Look up user name from Slack user ID
                user_name = None
                if slack_user_id and client:
                    try:
                        user_name = get_user_name(client, slack_user_id)
                    except Exception:
                        # If lookup fails, continue without user name
                        pass
                
                # Use just the text content (no user ID prefix)
                contents.append(text)
                user_names.append(user_name)
                slack_timestamps.append(float(ts) if ts else None)
            
            # Ingest messages in batch if there are any
            if contents:
                ingested_docs = ingestion.ingest_batch(
                    contents, 
                    user_id=request.user_id,
                    user_names=user_names,
                    slack_timestamps=slack_timestamps
                )
                
                # Update the response to include ingestion info
                extracted_data["ingested_count"] = len(ingested_docs)
                extracted_data["ingested_document_ids"] = [doc.get("id") for doc in ingested_docs]
            else:
                extracted_data["ingested_count"] = 0
                extracted_data["ingested_document_ids"] = []
                
        except Exception as e:
            # Log the error but don't fail the extraction
            # The extraction was successful, ingestion failure is separate
            extracted_data["ingestion_error"] = str(e)
            extracted_data["ingested_count"] = 0
    
    return extracted_data


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
        rpc_params = {
            "query_embedding": embedding_list,
            "match_count": request.match_count,
            "match_threshold": request.match_threshold
        }
        
        # Add user_id filter if provided
        if request.user_id:
            rpc_params["filter_user_id"] = request.user_id
        
        response = supabase.rpc("match_documents", rpc_params).execute()
        
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


@app.post("/slack/channels", response_model=SlackChannelsResponse)
def list_slack_channels(request: SlackChannelsRequest):
    """
    List all Slack channels (public and private) that the bot can access.
    
    Requires a Slack bot token with appropriate scopes.
    """
    try:
        client = WebClient(token=request.slack_bot_token)
        
        # Fetch all channels (public and private)
        response = client.conversations_list(
            types="public_channel,private_channel",
            exclude_archived=True
        )
        
        if not response["ok"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list channels: {response.get('error', 'Unknown error')}"
            )
        
        # Parse channels
        channels = [
            SlackChannel(
                id=channel["id"],
                name=channel.get("name", ""),
                is_private=channel.get("is_private", False),
                is_archived=channel.get("is_archived", False)
            )
            for channel in response.get("channels", [])
            if not channel.get("is_archived", False)  # Filter out archived channels
        ]
        
        return SlackChannelsResponse(channels=channels)
    
    except SlackApiError as e:
        error_msg = e.response.get("error", str(e))
        status_code = 500
        
        if e.response.get("error") == "not_authed" or e.response.get("error") == "invalid_auth":
            status_code = 401
        elif e.response.get("error") == "invalid_token":
            status_code = 401
        
        raise HTTPException(
            status_code=status_code,
            detail=f"Slack API error: {error_msg}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@app.get("/health")
def health_check():
    return {"status": "ok"}

