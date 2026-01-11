"""
Supabase client for database access.
Provides a single instance of the Supabase client that can be used across the codebase.
"""
from supabase import create_client, Client
import constants

# Create a single client instance at module level
# Usage: from db import supabase; supabase.table('your_table').select('*').execute()
supabase: Client = create_client(
    constants.SUPABASE_URL,
    constants.SUPABASE_KEY
)

