from typing import Optional
from supabase import create_client, Client
from app.config import settings

_client: Optional[Client] = None


def get_supabase() -> Client:
    """Get or create the Supabase client instance."""
    global _client
    if _client is None:
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _client


def get_admin_supabase() -> Client:
    """Get a Supabase client with service role (admin) privileges."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
