from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.cyclone import IntensityResult, IntensityEvaluation
from app.services.frame_service import frame_service
from app.services.intensity_service import intensity_estimator

router = APIRouter()

@router.get("/intensity/status")
def get_intensity_status():
    """
    Returns baseline satellite intensity estimator status, metrics, and extension points.
    """
    return {
        "status": "baseline_active",
        "active_estimator": "Baseline Satellite Morphological Intensity Model (Physical IR Heuristic)",
        "estimator_type": "Satellite-Derived IR Convective Regression (Zero Ground-Truth Leakage)",
        "input_features": [
            "convective_area_pixels",
            "peak_cloud_intensity",
            "compactness_score",
            "aspect_ratio",
            "thermal_vigor_index",
            "min_thermal_intensity"
        ],
        "target_variable": "maximum_sustained_wind (km/h & kt)",
        "extension_points": ["CNN_Deep_Intensity_Estimator", "Swin_ViT_Intensity_Model", "Multi_Sensor_SAR_Scatterometer_Fusion"],
        "ground_truth_source": "NOAA IBTrACS v04r01 (USA_WIND)",
        "provenance": "INSAT-3D IR 10.8 µm Asset & NOAA IBTrACS v04r01",
        "disclaimer": "Research baseline intensity estimator — not an operational intensity forecast."
    }

@router.get("/cyclones/{cyclone_id}/intensity", response_model=List[IntensityResult])
def get_cyclone_intensity(
    cyclone_id: str,
    frame_id: Optional[int] = Query(None, ge=0, le=100)
):
    """
    Get baseline intensity estimations, trends, and ground-truth comparisons for frames of specified cyclone.
    """
    all_meta = frame_service.get_all_frames_metadata()
    if not all_meta:
        frame_service.initialize()
        all_meta = frame_service.get_all_frames_metadata()

    if not all_meta:
        raise HTTPException(status_code=404, detail=f"No satellite frames available for cyclone '{cyclone_id}'.")

    results = []
    frames_to_process = [frame_id] if frame_id is not None else [m["frame_id"] for m in all_meta]
    
    prev_wind = None
    for fid in frames_to_process:
        frame_data = frame_service.get_frame(fid)
        if not frame_data:
            continue
        est_res = intensity_estimator.estimate_frame_intensity(
            frame_data, 
            cyclone_id=cyclone_id,
            prev_estimated_wind_kmh=prev_wind
        )
        if est_res.get("estimated_wind_kmh") is not None:
            prev_wind = est_res["estimated_wind_kmh"]
        results.append(est_res)

    if not results:
        raise HTTPException(status_code=404, detail=f"Frame '{frame_id}' not found.")

    return results

@router.get("/cyclones/{cyclone_id}/intensity/evaluation", response_model=IntensityEvaluation)
def get_cyclone_intensity_evaluation(cyclone_id: str):
    """
    Get intensity evaluation metrics (MAE, RMSE, Mean Bias, Median Error) against IBTrACS ground truth.
    """
    return intensity_estimator.evaluate_cyclone(cyclone_id=cyclone_id)
