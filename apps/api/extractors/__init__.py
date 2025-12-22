from fastapi import HTTPException
from extractors.base import BaseExtractor
from extractors.slack_extractor import SlackExtractor
from extractors.github_extractor import GitHubExtractor
from extractors.google_extractor import GoogleExtractor


def get_extractor(service: str) -> BaseExtractor:
    """
    Factory function to get the appropriate extractor based on service name.
    
    Args:
        service: Service name ("slack", "github", "google")
        
    Returns:
        BaseExtractor instance for the specified service
        
    Raises:
        HTTPException: If service is not supported
    """
    extractors = {
        "slack": SlackExtractor,
        "github": GitHubExtractor,
        "google": GoogleExtractor,
    }
    
    extractor_class = extractors.get(service.lower())
    
    if not extractor_class:
        supported_services = ", ".join(extractors.keys())
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported service: '{service}'. Supported services: {supported_services}"
        )
    
    return extractor_class()

