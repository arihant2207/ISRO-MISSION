from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.cyclone import TrackForecastResponse, TrackEvaluationResponse
from app.services.track_service import track_predictor

router = APIRouter()

@router.get("/track/status")
def get_track_status():
    """
    Returns baseline track predictor status, horizons supported, and extension points.
    """
    return {
        "status": "baseline_active",
        "active_predictor": "Persistence & Spherical Translation Vector Extrapolation Baseline",
        "predictor_type": "Physics-Based Spherical Trajectory Extrapolation (Zero Future Data Leakage)",
        "supported_horizons_hours": [6, 12, 24, 48, 72],
        "input_features": [
            "latest_latitude",
            "latest_longitude",
            "previous_latitude",
            "previous_longitude",
            "translational_velocity_kmh",
            "initial_bearing_degrees"
        ],
        "uncertainty_status": "unavailable",
        "uncertainty_disclaimer": "Uncertainty cone unavailable — insufficient independent validation data.",
        "extension_points": ["LSTM_Spatiotemporal_Track_Model", "Transformer_Trajectory_Network", "Multi_Member_Ensemble_Forecast"],
        "ground_truth_source": "NOAA IBTrACS v04r01 Trajectory Stream",
        "provenance": "NOAA IBTrACS v04r01",
        "disclaimer": "Research baseline track predictor — not an operational forecast."
    }

@router.get("/cyclones/{cyclone_id}/track/forecast", response_model=TrackForecastResponse)
def get_cyclone_track_forecast(
    cyclone_id: str,
    origin_timestamp: Optional[str] = Query(None, description="ISO timestamp for forecast origin e.g. 2023-12-04 06:00:00")
):
    """
    Get baseline trajectory forecast (+6h, +12h, +24h, +48h, +72h) from specified forecast origin time.
    Strictly forbids using future observations as predictor inputs.
    """
    res = track_predictor.generate_forecast(cyclone_id=cyclone_id, origin_timestamp=origin_timestamp)
    if res.get("status") == "unavailable":
        raise HTTPException(status_code=404, detail=res.get("reason", f"No track points found for '{cyclone_id}'."))
    return res

@router.get("/cyclones/{cyclone_id}/track/evaluation", response_model=TrackEvaluationResponse)
def get_cyclone_track_evaluation(
    cyclone_id: str,
    multi_event: bool = Query(False, description="Set True to evaluate across multiple North Indian Ocean cyclones")
):
    """
    Get track forecast error metrics (MAE, median, min/max in km) per horizon (+6h, +12h, +24h, +48h, +72h).
    """
    if multi_event or cyclone_id.upper() == "ALL":
        priority_ids = ["MICHAUNG", "BIPARJOY", "MOCHA", "DANA", "REMAL", "TEJ", "AMPHAN", "FANI"]
        return track_predictor.evaluate_multi_event_tracks(cyclone_ids=priority_ids)
    
    return track_predictor.evaluate_cyclone_track(cyclone_id=cyclone_id)
