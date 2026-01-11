from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from fastapi import HTTPException
from typing import Optional


def get_conversation_id(client: WebClient, conversation_name: str, conversation_type: str) -> str:
    """
    Resolve conversation name to conversation ID.
    
    Args:
        client: Slack WebClient instance
        conversation_name: Name of the channel, group, or username/email for DM, or a conversation ID
        conversation_type: Type of conversation ('channel', 'group', or 'im')
    
    Returns:
        Conversation ID string
    
    Raises:
        HTTPException: If conversation is not found or inaccessible
    """
    try:
        # If conversation_name is already a valid Slack conversation ID, return it directly
        # Slack IDs start with: C (public channel), G (private channel/group), D (DM)
        # This check should happen FIRST, before any conversation_type logic
        if conversation_name and conversation_name.startswith(('C', 'G', 'D')):
            return conversation_name
        
        # Only do name-based lookup if it's not already an ID
        if conversation_type == "channel":
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
            
            # Match by name (case-insensitive)
            for channel in response.get("channels", []):
                if channel.get("name", "").lower() == conversation_name.lower():
                    return channel["id"]
            
            raise HTTPException(
                status_code=404,
                detail=f"Channel '{conversation_name}' not found"
            )
        
        elif conversation_type == "group":
            # Fetch private channels/groups
            response = client.conversations_list(
                types="private_channel",
                exclude_archived=True
            )
            
            if not response["ok"]:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to list private groups: {response.get('error', 'Unknown error')}"
                )
            
            # Match by name (case-insensitive)
            for group in response.get("channels", []):
                if group.get("name", "").lower() == conversation_name.lower():
                    return group["id"]
            
            raise HTTPException(
                status_code=404,
                detail=f"Private group '{conversation_name}' not found"
            )
        
        elif conversation_type == "im":
            # For DMs, first find the user by name or email
            users_response = client.users_list()
            
            if not users_response["ok"]:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to list users: {users_response.get('error', 'Unknown error')}"
                )
            
            # Try to match by username, display name, or email
            user_id = None
            for user in users_response.get("members", []):
                profile = user.get("profile", {})
                if (
                    user.get("name", "").lower() == conversation_name.lower() or
                    profile.get("display_name", "").lower() == conversation_name.lower() or
                    profile.get("email", "").lower() == conversation_name.lower() or
                    profile.get("real_name", "").lower() == conversation_name.lower()
                ):
                    user_id = user["id"]
                    break
            
            if not user_id:
                raise HTTPException(
                    status_code=404,
                    detail=f"User '{conversation_name}' not found"
                )
            
            # Open or get the DM conversation
            dm_response = client.conversations_open(users=[user_id])
            
            if not dm_response["ok"]:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to open DM: {dm_response.get('error', 'Unknown error')}"
                )
            
            return dm_response["channel"]["id"]
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid conversation_type: '{conversation_type}'. Must be 'channel', 'group', or 'im'"
            )
    
    except SlackApiError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Slack API error: {e.response.get('error', str(e))}"
        )


def get_user_name(client: WebClient, user_id: str) -> Optional[str]:
    """
    Get user's display name or real name from Slack user ID.
    
    Args:
        client: Slack WebClient instance
        user_id: Slack user ID (e.g., "U099Q293CQ6")
    
    Returns:
        User's display name, real name, or None if not found
    """
    try:
        response = client.users_info(user=user_id)
        
        if not response["ok"]:
            return None
        
        user = response.get("user", {})
        profile = user.get("profile", {})
        
        # Prefer display_name, fallback to real_name, then to name
        return (
            profile.get("display_name") or
            profile.get("real_name") or
            user.get("name") or
            None
        )
    except SlackApiError:
        return None
    except Exception:
        return None
