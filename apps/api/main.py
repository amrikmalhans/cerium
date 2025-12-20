from fastapi import FastAPI, HTTPException
from models import ExtractRequest
from extractors import get_extractor

app = FastAPI()


@app.post("/extract")
def extract_data(request: ExtractRequest):
    """
    Extract data from various services (Slack, GitHub, Google, etc.).
    
    Accepts a service parameter and service-specific fields to extract data.
    Returns service-specific response format.
    """
    # Validate service-specific required fields
    if request.service.value == "slack":
        if not request.conversation_name:
            raise HTTPException(
                status_code=400,
                detail="conversation_name is required when service is 'slack'"
            )
        if not request.conversation_type:
            raise HTTPException(
                status_code=400,
                detail="conversation_type is required when service is 'slack'"
            )
    
    # Get the appropriate extractor for the service
    extractor = get_extractor(request.service.value)
    
    # Extract data using the service-specific extractor
    return extractor.extract(request)


@app.get("/health")
def health_check():
    return {"status": "ok"}

