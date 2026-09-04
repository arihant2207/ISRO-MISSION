from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from app.schemas.cyclone import IdentificationResult, IdentificationEvaluation, ComponentStatus
from app.services.frame_service import frame_service
from app.services.identification_service import identification_detector

router = APIRouter()

@router.get("/identification/status")
def get_identification_status():
    """
    Returns baseline cyclone detector status and available model interfaces.
    """
    return {
        "status": "baseline_active",
        "active_detector": "Baseline Cyclone Candidate Detector (IR Convection Thresholding)",
        "detector_type": "Classical/Algorithmic Baseline",
        "architecture_ready": True,
        "extension_points": ["CNN_Segmenter", "YOLO_Cyclone_Detector", "Swin_Transformer_Detector"],
        "provenance": "INSAT-3D IR 10.8 µm Asset & NOAA IBTrACS v04r01",
        "disclaimer": "Research baseline candidate detector — not an operational forecasting model"
    }

@router.get("/cyclones/{cyclone_id}/identification", response_model=List[IdentificationResult])
def get_cyclone_identification(
    cyclone_id: str,
    frame_id: Optional[int] = Query(None, ge=0, le=100)
):
    """
    Get baseline cyclone identification & core localization results for frames of specified cyclone.
    """
    all_meta = frame_service.get_all_frames_metadata()
    if not all_meta:
        frame_service.initialize()
        all_meta = frame_service.get_all_frames_metadata()

    if not all_meta:
        raise HTTPException(status_code=404, detail=f"No satellite frames available for cyclone '{cyclone_id}'.")

    results = []
    frames_to_process = [frame_id] if frame_id is not None else [m["frame_id"] for m in all_meta]

    for fid in frames_to_process:
        frame_data = frame_service.get_frame(fid)
        if not frame_data:
            continue
        det = identification_detector.detect_frame(frame_data, cyclone_id=cyclone_id)
        results.append(det)

    if not results:
        raise HTTPException(status_code=404, detail=f"Frame '{frame_id}' not found.")

    return results

@router.get("/cyclones/{cyclone_id}/identification/evaluation", response_model=IdentificationEvaluation)
def get_cyclone_identification_evaluation(cyclone_id: str):
    """
    Get baseline detection evaluation report (center error MAE/median in km against IBTrACS).
    """
    return identification_detector.evaluate_cyclone(cyclone_id=cyclone_id)
