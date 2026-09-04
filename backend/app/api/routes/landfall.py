from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from app.schemas.cyclone import LandfallResponse, RiskResponse
from app.services.landfall_service import coastline_provider, landfall_analyzer, risk_service

router = APIRouter()

@router.get("/landfall/status")
def get_landfall_status():
    """
    Returns coastline data provider status, geometry resolution, and risk engine capabilities.
    """
    coast_status = coastline_provider.get_status()
    return {
        "status": "baseline_active",
        "coastline_provider": coast_status,
        "active_landfall_analyzer": "Baseline Landfall & Coastal Proximity Analyzer",
        "active_risk_engine": "Multi-Dimensional Categorical Risk Framework (No Fake Probability)",
        "supported_risk_states": ["LOW", "MODERATE", "HIGH", "VERY_HIGH", "UNAVAILABLE"],
        "probabilistic_risk": "unavailable",
        "probabilistic_risk_disclaimer": "Probabilistic risk unavailable — baseline forecast has no calibrated uncertainty.",
        "provenance": "Calibrated Bay of Bengal Coastal Geometry & NOAA IBTrACS v04r01",
        "disclaimer": "Research prototype landfall & risk intelligence — not an operational disaster warning system."
    }

@router.get("/cyclones/{cyclone_id}/landfall", response_model=LandfallResponse)
def get_cyclone_landfall(
    cyclone_id: str,
    origin_timestamp: Optional[str] = Query(None, description="ISO timestamp for forecast origin e.g. 2023-12-04 06:00:00")
):
    """
    Get landfall prediction, coastal proximity, and distance to coast across forecast horizons.
    """
    res = landfall_analyzer.analyze_landfall(cyclone_id=cyclone_id, origin_timestamp=origin_timestamp)
    if res.get("landfall_status") == "unavailable" or "landfall_summary" not in res:
        raise HTTPException(status_code=404, detail=res.get("reason", f"Track data unavailable for '{cyclone_id}'."))
    return res


@router.get("/cyclones/{cyclone_id}/risk", response_model=RiskResponse)
def get_cyclone_risk(
    cyclone_id: str,
    origin_timestamp: Optional[str] = Query(None, description="ISO timestamp for forecast origin e.g. 2023-12-04 06:00:00")
):
    """
    Get multi-dimensional categorical risk assessment (Wind hazard, Coastal proximity, Landfall state).
    """
    res = risk_service.assess_risk(cyclone_id=cyclone_id, origin_timestamp=origin_timestamp)
    if res.get("overall_risk_state") == "UNAVAILABLE":
        raise HTTPException(status_code=404, detail=res.get("reason", f"Risk evaluation unavailable for '{cyclone_id}'."))
    return res

@router.get("/cyclones/{cyclone_id}/risk/timeline")
def get_cyclone_risk_timeline(
    cyclone_id: str,
    origin_timestamp: Optional[str] = Query(None, description="ISO timestamp for forecast origin")
):
    """
    Get risk timeline breakdown (+6h to +72h) including distance to coast, nearest region, and risk level.
    """
    landfall_res = landfall_analyzer.analyze_landfall(cyclone_id=cyclone_id, origin_timestamp=origin_timestamp)
    risk_res = risk_service.assess_risk(cyclone_id=cyclone_id, origin_timestamp=origin_timestamp)
    
    return {
        "cyclone_id": cyclone_id,
        "forecast_origin_timestamp": risk_res.get("forecast_origin_timestamp"),
        "overall_risk_state": risk_res.get("overall_risk_state"),
        "risk_dimensions": risk_res.get("risk_dimensions"),
        "risk_explanation": risk_res.get("risk_explanation"),
        "timeline": landfall_res.get("proximity_timeline", []),
        "landfall_summary": landfall_res.get("landfall_summary"),
        "historical_ground_truth_landfall": landfall_res.get("historical_ground_truth_landfall"),
        "provenance": "Calibrated Bay of Bengal Coastal Geometry & NOAA IBTrACS v04r01",
        "disclaimer": "Research baseline risk intelligence — not an operational disaster warning system."
    }
