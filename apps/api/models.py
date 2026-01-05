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
    user_id: Optional[str] = Field(default=None, description="ID of the user who owns the extracted data")
    # Slack-specific fields (optional, only required when service is 'slack')
    slack_bot_token: Optional[str] = Field(default=None, description="Slack bot token (if not provided, uses configured token)")
    conversation_name: Optional[str] = Field(default=None, description="Channel name, private group name, or username/email for DM (Slack)")
    conversation_type: Optional[str] = Field(default=None, description="Type: 'channel', 'group', or 'im' (DM) (Slack)")
    limit: Optional[int] = Field(default=100, description="Number of items to retrieve")
    oldest: Optional[float] = Field(default=None, description="Oldest timestamp to include")
    latest: Optional[float] = Field(default=None, description="Latest timestamp to include")
    cursor: Optional[str] = Field(default=None, description="Pagination cursor for next page")


class RetrieveRequest(BaseModel):
    """Request model for semantic search retrieval."""
    prompt: str = Field(..., description="The user prompt to search for")
    user_id: Optional[str] = Field(default=None, description="User ID to filter documents by. If provided, only searches documents belonging to this user.")
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


class SlackChannelsRequest(BaseModel):
    """Request model for listing Slack channels."""
    slack_bot_token: str = Field(..., description="Slack bot token")


class SlackChannel(BaseModel):
    """Model for a Slack channel."""
    id: str
    name: str
    is_private: bool
    is_archived: bool


class SlackChannelsResponse(BaseModel):
    """Response model for Slack channels list."""
    channels: List[SlackChannel]
