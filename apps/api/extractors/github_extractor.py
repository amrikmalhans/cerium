from extractors.base import BaseExtractor
from models import ExtractRequest


class GitHubExtractor(BaseExtractor):
    """Placeholder extractor for GitHub data (PRs, Issues, Commits, etc.)."""
    
    def extract(self, request: ExtractRequest) -> dict:
        """
        Placeholder implementation for GitHub extraction.
        
        Args:
            request: ExtractRequest (GitHub-specific fields to be added later)
            
        Returns:
            TODO message indicating this service is not yet implemented
        """
        return {
            "message": "TODO",
            "service": "github"
        }

