from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.cyclone import ClassificationResult, ClassificationEvaluation
from app.services.frame_service import frame_service
from app.services.classification_service import classification_classifier

router = APIRouter()

@router.get("/classification/status")
def get_classification_status():
    """
    Returns baseline pattern classifier status, taxonomy, and extension points.
    """
    return {
        "status": "baseline_active",
        "active_classifier": "Baseline Satellite Morphological & Thermal Pattern Classifier (Dvorak IR Heuristics)",
        "classifier_type": "Satellite-Derived Feature Heuristic (Zero Ground-Truth Leakage)",
        "taxonomy": classification_classifier.taxonomy,
        "extension_points": ["CNN_ResNet_Classifier", "Swin_ViT_Pattern_Classifier", "Multi_Modal_Fusion_Classifier"],
        "ground_truth_source": "NOAA IBTrACS v04r01 WMO/IMD Wind Speed Scale",
        "provenance": "INSAT-3D IR 10.8 µm Asset & NOAA IBTrACS v04r01",
        "disclaimer": "Research baseline pattern classifier — not an operational forecasting model."
    }

@router.get("/cyclones/{cyclone_id}/classification", response_model=List[ClassificationResult])
def get_cyclone_classification(
    cyclone_id: str,
    frame_id: Optional[int] = Query(None, ge=0, le=100)
):
    """
    Get baseline pattern classification & evidence features for frames of specified cyclone.
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
        c_res = classification_classifier.classify_frame(frame_data, cyclone_id=cyclone_id)
        results.append(c_res)

    if not results:
        raise HTTPException(status_code=404, detail=f"Frame '{frame_id}' not found.")

    return results

@router.get("/cyclones/{cyclone_id}/classification/evaluation", response_model=ClassificationEvaluation)
def get_cyclone_classification_evaluation(cyclone_id: str):
    """
    Get classification evaluation report (accuracy, precision, recall, F1) against IBTrACS ground truth.
    """
    return classification_classifier.evaluate_cyclone(cyclone_id=cyclone_id)
