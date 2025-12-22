from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


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
