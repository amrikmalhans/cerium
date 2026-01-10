from fastapi import HTTPException
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from extractors.base import BaseExtractor
from models import ExtractRequest
from helpers import get_conversation_id


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
        # Get Slack token from request - no fallback
        slack_token = request.slack_bot_token
        
        # Validate Slack token is available
        if not slack_token:
            raise HTTPException(
                status_code=400,
                detail="Slack bot token is required. Please provide slack_bot_token in request."
            )
        
        # Initialize Slack client
        client = WebClient(token=slack_token)
        
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
            
            # If bot is not in channel, provide clear error message
            # (Note: Only channels the bot is already a member of should be shown in the UI)
            if not response["ok"] and response.get("error") == "not_in_channel":
                raise HTTPException(
                    status_code=403,
                    detail=f"Bot is not a member of channel '{request.conversation_name}'. Please add the bot to this channel in Slack before extracting messages."
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

