from abc import ABC, abstractmethod
from typing import Dict, Any
from models import ExtractRequest


class BaseExtractor(ABC):
    """
    Abstract base class for all service extractors.
    All extractors must implement the extract method.
    """
    
    @abstractmethod
    def extract(self, request: ExtractRequest) -> Dict[str, Any]:
        """
        Extract data from the service based on the request.
        
        Args:
            request: ExtractRequest containing service-specific parameters
            
        Returns:
            Dictionary containing the extracted data in service-specific format
            
        Raises:
            HTTPException: If extraction fails
        """
        pass

