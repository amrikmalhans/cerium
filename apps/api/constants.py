"""
API configuration constants for various services.
Fill in these values with your actual credentials.
"""
import os

# Slack API configuration
# Get this from https://api.slack.com/apps -> Your App -> OAuth & Permissions
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_API_BASE_URL = "https://slack.com/api"

# GitHub API configuration
# Get this from https://github.com/settings/tokens
GITHUB_TOKEN = ""
GITHUB_API_BASE_URL = "https://api.github.com"

# Google API configuration
# Get these from https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID = ""
GOOGLE_CLIENT_SECRET = ""
GOOGLE_API_BASE_URL = "https://www.googleapis.com"

