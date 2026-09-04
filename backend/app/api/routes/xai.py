from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.schemas.cyclone import XAIExplanationResponse
from app.services.xai_service import xai_service

router = APIRouter()

@router.get("/xai/{capability}/{cyclone_id}", response_model=XAIExplanationResponse)
def get_xai_explanation(
    capability: str,
    cyclone_id: str,
    frame_id: Optional[int] = Query(default=10, description="Satellite frame ID for frame-based capabilities"),
    origin_timestamp: Optional[str] = Query(default=None, description="Forecast origin timestamp for track capability"),
    method: Optional[str] = Query(default="ml", description="Method variant for temporal model ('ml' or 'linear')")
):
    """
    Get transparent Explainable AI (XAI) feature attributions and decision rules for a given capability.
    Valid capabilities: identification, classification, intensity, track, temporal.
    """
    cap = capability.lower()
    if cap == "identification":
        return xai_service.explain_identification(cyclone_id, frame_id)
    elif cap == "classification":
        return xai_service.explain_classification(cyclone_id, frame_id)
    elif cap == "intensity":
        return xai_service.explain_intensity(cyclone_id, frame_id)
    elif cap == "track":
        return xai_service.explain_track(cyclone_id, origin_timestamp)
    elif cap == "temporal":
        return xai_service.explain_temporal(cyclone_id, frame_id, method)
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown capability '{capability}'. Valid capabilities: identification, classification, intensity, track, temporal."
        )
