from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from app.schemas.cyclone import TemporalResultResponse, TemporalEvaluationResponse
from app.services.temporal_service import temporal_service

router = APIRouter()

@router.get("/temporal/status")
def get_temporal_status():
    """
    Returns temporal enhancement status, active ML/baseline models, and dataset triplet info.
    """
    return temporal_service.get_status()

@router.get("/cyclones/{cyclone_id}/temporal", response_model=TemporalResultResponse)
def get_cyclone_temporal_interpolation(
    cyclone_id: str,
    frame_id: int = Query(1, ge=1, le=100, description="Target frame ID T1 to interpolate"),
    method: str = Query("ml", description="linear | ml")
):
    """
    Get intermediate temporal frame interpolation (Linear Baseline vs CNN Model) for specified target frame T1.
    """
    res = temporal_service.interpolate_triplet(target_frame_id=frame_id, method=method, cyclone_id=cyclone_id)
    if res.get("status") == "invalid_frame" or res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("reason", f"Cannot interpolate frame {frame_id}."))
    return res

@router.get("/cyclones/{cyclone_id}/temporal/evaluation", response_model=TemporalEvaluationResponse)
def get_cyclone_temporal_evaluation(cyclone_id: str):
    """
    Get held-out evaluation comparison (MAE, MSE, PSNR, SSIM) between Linear Baseline and CNN ML Model.
    """
    return temporal_service.evaluate_temporal_pipeline(cyclone_id=cyclone_id)
