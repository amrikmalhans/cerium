from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime


class ServiceType(str, Enum):
    """Supported service types for extraction."""
    SLACK = "slack"
    GITHUB = "github"
    GOOGLE = "google"


class ExtractRequest(BaseModel):
    service: ServiceType = Field(..., description="Service to extract from: 'slack', 'github', or 'google'")
    # Slack-specific fields (optional, only required when service is 'slack')
    conversation_name: Optional[str] = Field(default=None, description="Channel name, private group name, or username/email for DM (Slack)")
    conversation_type: Optional[str] = Field(default=None, description="Type: 'channel', 'group', or 'im' (DM) (Slack)")
    limit: Optional[int] = Field(default=100, description="Number of items to retrieve")
    oldest: Optional[float] = Field(default=None, description="Oldest timestamp to include")
    latest: Optional[float] = Field(default=None, description="Latest timestamp to include")
    cursor: Optional[str] = Field(default=None, description="Pagination cursor for next page")


class RetrieveRequest(BaseModel):
    """Request model for semantic search retrieval."""
    prompt: str = Field(..., description="The user prompt to search for")
    match_count: Optional[int] = Field(default=5, description="Number of documents to retrieve")
    match_threshold: Optional[float] = Field(default=0.7, description="Minimum similarity threshold (0-1)")


class DocumentMatch(BaseModel):
    """Response model for a matched document."""
    id: int
    content: str
    user_name: Optional[str] = None
    slack_ts: Optional[float] = None
    created_at: datetime
    similarity: float


class RetrieveResponse(BaseModel):
    """Response model for retrieval endpoint."""
    matches: List[DocumentMatch]
    count: int
