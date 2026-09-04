from fastapi import APIRouter
from app.schemas.cyclone import ModelStatusResponse
from app.services.model_service import model_service

router = APIRouter()

@router.get("/models/status", response_model=ModelStatusResponse)
def get_model_status():
    """
    Returns scientific honesty contract detailing which ML models are connected or offline.
    """
    return model_service.get_status()
