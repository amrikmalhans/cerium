from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from fastapi import HTTPException
from typing import Dict, List, Any, Optional


def get_conversation_id(client: WebClient, conversation_name: str, conversation_type: str) -> str:
    """
    Resolve conversation name to conversation ID.
    
    Args:
        client: Slack WebClient instance
        conversation_name: Name of the channel, group, or username/email for DM
        conversation_type: Type of conversation ('channel', 'group', or 'im')
    
    Returns:
        Conversation ID string
    
    Raises:
        HTTPException: If conversation is not found or inaccessible
    """
    try:
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


def get_user_id_to_username_map(client: WebClient, user_ids: List[str]) -> Dict[str, str]:
    """
    Get username mapping for a list of user IDs from Slack.
    
    Args:
        client: Slack WebClient instance
        user_ids: List of Slack user IDs to look up
        
    Returns:
        Dictionary mapping user IDs to usernames:
        {
            "U123": "john.doe",
            "U456": "jane.smith",
            ...
        }
    """
    if not user_ids:
        return {}
    
    user_id_to_username: Dict[str, str] = {}
    
    try:
        # Get all users from Slack
        users_response = client.users_list()
        
        if not users_response.get("ok"):
            return user_id_to_username
        
        # Create a mapping of user IDs to usernames
        for user in users_response.get("members", []):
            user_id = user.get("id")
            if user_id in user_ids:
                # Prefer display_name, fallback to name, then real_name
                profile = user.get("profile", {})
                username = (
                    profile.get("display_name") or
                    profile.get("real_name") or
                    user.get("name") or
                    user_id  # Fallback to user ID if no name found
                )
                user_id_to_username[user_id] = username
        
    except Exception as e:
        # If lookup fails, return empty dict (will use user IDs as fallback)
        print(f"Warning: Failed to get user info: {e}")
    
    return user_id_to_username


def parse_slack_messages_individual(slack_response: Dict[str, Any], user_id_to_username_map: Optional[Dict[str, str]] = None) -> List[Dict[str, str]]:
    """
    Parse Slack API response and extract individual messages in order.
    Only includes messages that have text content (messages with blocks attribute).
    
    Args:
        slack_response: The Slack API response dictionary with structure:
            {
                "ok": bool,
                "messages": [
                    {
                        "user": "U123",
                        "blocks": [...],
                        ...
                    },
                    ...
                ],
                ...
            }
        user_id_to_username_map: Optional dictionary mapping user IDs to usernames.
            If provided, usernames will be used instead of user IDs.
            If None, user IDs will be used.
    
    Returns:
        List of dictionaries in order, each containing user_name and content:
        [
            {"user_name": "john.doe", "content": "hi"},
            {"user_name": "john.doe", "content": "can you do this"},
            {"user_name": "jane.smith", "content": "yes"},
            ...
        ]
        
        All newlines are removed and replaced with spaces.
    """
    if not slack_response.get("ok"):
        return []
    
    messages = slack_response.get("messages", [])
    parsed_messages = []
    
    for message in messages:
        # Only process messages that have blocks (text messages)
        if "blocks" not in message or not message.get("blocks"):
            continue
        
        # Skip messages without a user field
        if "user" not in message:
            continue
        
        user_id = message["user"]
        
        # Extract text from blocks structure
        # Path: blocks[0].elements[0].elements[0].text
        text = None
        try:
            blocks = message.get("blocks", [])
            if blocks and len(blocks) > 0:
                elements = blocks[0].get("elements", [])
                if elements and len(elements) > 0:
                    inner_elements = elements[0].get("elements", [])
                    if inner_elements and len(inner_elements) > 0:
                        # Look for text element
                        for elem in inner_elements:
                            if elem.get("type") == "text" and "text" in elem:
                                text = elem["text"]
                                break
        except (KeyError, IndexError, TypeError):
            # If structure is different, try to get text directly from message
            text = message.get("text", "")
        
        # If we found text, add it to the list
        if text and text.strip():
            # Remove newlines and clean up text
            cleaned_text = text.strip().replace('\n', ' ').replace('\r', ' ')
            cleaned_text = ' '.join(cleaned_text.split())
            
            # Get username if mapping provided, otherwise use user_id
            if user_id_to_username_map and user_id in user_id_to_username_map:
                user_name = user_id_to_username_map[user_id]
            else:
                user_name = user_id
            
            parsed_messages.append({
                "user_name": user_name,
                "content": cleaned_text,
                "ts": message.get("ts")  # Include timestamp for tracking
            })
    
    return parsed_messages


def parse_slack_messages(slack_response: Dict[str, Any], user_id_to_username_map: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    """
    Parse Slack API response and extract user-to-message mappings.
    Only includes messages that have text content (messages with blocks attribute).
    
    Args:
        slack_response: The Slack API response dictionary with structure:
            {
                "ok": bool,
                "messages": [
                    {
                        "user": "U123",
                        "blocks": [...],
                        ...
                    },
                    ...
                ],
                ...
            }
    
    Args:
        slack_response: The Slack API response dictionary with structure:
            {
                "ok": bool,
                "messages": [
                    {
                        "user": "U123",
                        "blocks": [...],
                        ...
                    },
                    ...
                ],
                ...
            }
        user_id_to_username_map: Optional dictionary mapping user IDs to usernames.
            If provided, usernames will be used as keys instead of user IDs.
            If None, user IDs will be used as keys.
    
    Returns:
        Dictionary mapping usernames (or user IDs if mapping not provided) to their message text:
        {
            "john.doe": "their message text",
            "jane.smith": "another message",
            ...
        }
        
        If a user has multiple messages, they are concatenated with spaces.
        All newlines are removed and replaced with spaces.
    """
    if not slack_response.get("ok"):
        return {}
    
    messages = slack_response.get("messages", [])
    user_messages: Dict[str, List[str]] = {}
    
    for message in messages:
        # Only process messages that have blocks (text messages)
        if "blocks" not in message or not message.get("blocks"):
            continue
        
        # Skip messages without a user field
        if "user" not in message:
            continue
        
        user_id = message["user"]
        
        # Extract text from blocks structure
        # Path: blocks[0].elements[0].elements[0].text
        text = None
        try:
            blocks = message.get("blocks", [])
            if blocks and len(blocks) > 0:
                elements = blocks[0].get("elements", [])
                if elements and len(elements) > 0:
                    inner_elements = elements[0].get("elements", [])
                    if inner_elements and len(inner_elements) > 0:
                        # Look for text element
                        for elem in inner_elements:
                            if elem.get("type") == "text" and "text" in elem:
                                text = elem["text"]
                                break
        except (KeyError, IndexError, TypeError):
            # If structure is different, try to get text directly from message
            text = message.get("text", "")
        
        # If we found text, add it to the user's messages
        if text and text.strip():
            if user_id not in user_messages:
                user_messages[user_id] = []
            # Remove newlines from individual messages and strip whitespace
            cleaned_text = text.strip().replace('\n', ' ').replace('\r', ' ')
            # Remove extra spaces
            cleaned_text = ' '.join(cleaned_text.split())
            user_messages[user_id].append(cleaned_text)
    
    # Convert list of messages per user to single string (concatenated with spaces)
    result: Dict[str, str] = {}
    for user_id, messages_list in user_messages.items():
        # Join messages with spaces and ensure no newlines remain
        combined = " ".join(messages_list)
        combined = combined.replace('\n', ' ').replace('\r', ' ')
        
        # Use username if mapping provided, otherwise use user_id
        if user_id_to_username_map and user_id in user_id_to_username_map:
            key = user_id_to_username_map[user_id]
        else:
            key = user_id
        
        result[key] = combined
    
    return result
