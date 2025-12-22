from fastapi import HTTPException
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from extractors.base import BaseExtractor
from models import ExtractRequest
from helpers import get_conversation_id
import constants


class SlackExtractor(BaseExtractor):
    """Extractor for Slack messages from channels, groups, or DMs."""
    
    def extract(self, request: ExtractRequest) -> dict:
        """
        Extract messages from a Slack conversation.
        
        Args:
            request: ExtractRequest with Slack-specific fields
            
        Returns:
            Raw Slack API response format
        """
        # Validate Slack token is configured
        if not constants.SLACK_BOT_TOKEN:
            raise HTTPException(
                status_code=500,
                detail="Slack bot token not configured. Please set SLACK_BOT_TOKEN in constants.py"
            )
        
        # Initialize Slack client
        client = WebClient(token=constants.SLACK_BOT_TOKEN)
        
        try:
            # Resolve conversation name to ID
            conversation_id = get_conversation_id(
                client,
                request.conversation_name,
                request.conversation_type
            )
            
            # Prepare parameters for conversations.history
            params = {
                "channel": conversation_id,
                "limit": request.limit
            }
            
            if request.oldest is not None:
                params["oldest"] = str(request.oldest)
            
            if request.latest is not None:
                params["latest"] = str(request.latest)
            
            if request.cursor:
                params["cursor"] = request.cursor
            
            # Fetch conversation history
            response = client.conversations_history(**params)
            
            # If bot is not in channel, try to join it automatically
            if not response["ok"] and response.get("error") == "not_in_channel":
                try:
                    # Try to join the channel
                    join_response = client.conversations_join(channel=conversation_id)
                    if not join_response["ok"]:
                        raise HTTPException(
                            status_code=403,
                            detail=f"Cannot access channel. Bot must be added to channel '{request.conversation_name}'. Error: {join_response.get('error', 'Unknown error')}"
                        )
                    # Retry fetching messages after joining
                    response = client.conversations_history(**params)
                except SlackApiError as join_error:
                    raise HTTPException(
                        status_code=403,
                        detail=f"Cannot access channel. Bot must be added to channel '{request.conversation_name}'. Error: {join_error.response.get('error', str(join_error))}"
                    )
            
            if not response["ok"]:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to fetch messages: {response.get('error', 'Unknown error')}"
                )
            
            # Return raw Slack API response format
            return {
                "ok": response["ok"],
                "messages": response.get("messages", []),
                "has_more": response.get("has_more", False),
                "response_metadata": response.get("response_metadata", {}),
                "pin_count": response.get("pin_count", 0)
            }
        
        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise
        except SlackApiError as e:
            error_msg = e.response.get("error", str(e))
            status_code = 500
            
            # Handle specific Slack API errors
            if e.response.get("error") == "channel_not_found":
                status_code = 404
            elif e.response.get("error") == "not_in_channel":
                status_code = 403
            elif e.response.get("error") == "not_authed" or e.response.get("error") == "invalid_auth":
                status_code = 401
            elif e.response.get("error") == "rate_limited":
                status_code = 429
            
            raise HTTPException(
                status_code=status_code,
                detail=f"Slack API error: {error_msg}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error: {str(e)}"
            )

