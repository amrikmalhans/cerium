from extractors.base import BaseExtractor
from models import ExtractRequest


class GoogleExtractor(BaseExtractor):
    """Placeholder extractor for Google services (Gmail, Drive, Docs, Sheets, etc.)."""
    
    def extract(self, request: ExtractRequest) -> dict:
        """
        Placeholder implementation for Google extraction.
        
        Args:
            request: ExtractRequest (Google-specific fields to be added later)
            
        Returns:
            TODO message indicating this service is not yet implemented
        """
        return {
            "message": "TODO",
            "service": "google"
        }

