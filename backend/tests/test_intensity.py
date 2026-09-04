import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.intensity_service import intensity_estimator
from app.services.frame_service import frame_service

client = TestClient(app)

def test_intensity_status_endpoint():
    response = client.get("/api/intensity/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "baseline_active"
    assert "convective_area_pixels" in data["input_features"]
    assert data["target_variable"] == "maximum_sustained_wind (km/h & kt)"
    assert "disclaimer" in data

def test_estimate_frame_intensity_determinism():
    frame_service.initialize()
    meta = frame_service.get_all_frames_metadata()
    assert len(meta) > 0
    
    frame_data = frame_service.get_frame(0)
    assert frame_data is not None
    
    res1 = intensity_estimator.estimate_frame_intensity(frame_data, cyclone_id="MICHAUNG")
    res2 = intensity_estimator.estimate_frame_intensity(frame_data, cyclone_id="MICHAUNG")
    
    assert res1["estimated_wind_kt"] == res2["estimated_wind_kt"]
    assert res1["estimated_wind_kmh"] == res2["estimated_wind_kmh"]
    assert res1["confidence"] is None
    assert res1["method"] == "Baseline Satellite Morphological Intensity Model (Physical IR Heuristic)"

def test_no_ground_truth_leakage_in_intensity_prediction():
    frame_service.initialize()
    frame_data = frame_service.get_frame(10)
    assert frame_data is not None
    
    res = intensity_estimator.estimate_frame_intensity(frame_data, cyclone_id="MICHAUNG")
    
    # Verify satellite input features do NOT contain IBTrACS wind/pressure
    feats = res["input_features"]
    assert "ground_truth_wind_kt" not in feats
    assert "ground_truth_wind_kmh" not in feats
    assert "USA_WIND" not in feats
    assert "WMO_WIND" not in feats

def test_unit_conversion_and_trend():
    frame_service.initialize()
    f0 = frame_data = frame_service.get_frame(0)
    f1 = frame_data = frame_service.get_frame(1)
    
    res0 = intensity_estimator.estimate_frame_intensity(f0, cyclone_id="MICHAUNG", prev_estimated_wind_kmh=None)
    res1 = intensity_estimator.estimate_frame_intensity(f1, cyclone_id="MICHAUNG", prev_estimated_wind_kmh=res0["estimated_wind_kmh"])
    
    if res0["estimated_wind_kt"] is not None:
        expected_kmh = round(res0["estimated_wind_kt"] * 1.852, 1)
        assert abs(res0["estimated_wind_kmh"] - expected_kmh) < 0.2
    
    assert res1["trend"] in ["strengthening", "weakening", "stable", "insufficient_evidence"]

def test_intensity_evaluation_endpoint():
    response = client.get("/api/cyclones/MICHAUNG/intensity/evaluation")
    assert response.status_code == 200
    data = response.json()
    
    assert data["cyclone_id"] == "MICHAUNG"
    assert data["total_frames_evaluated"] == 48
    assert data["matched_frames"] > 0
    assert data["mae_kmh"] is not None
    assert data["rmse_kmh"] is not None
    assert "Single-event calibrated research baseline" in data["validation_status"]

def test_insufficient_evidence_handling():
    import numpy as np
    # Empty frame dummy test (all white non-convective matrix)
    empty_frame = {
        "frame_id": 999,
        "timestamp": "2023-12-03 00:00:00",
        "array": np.full((10, 10), 255, dtype=np.uint8),
        "provenance": "test"
    }
    res = intensity_estimator.estimate_frame_intensity(empty_frame, cyclone_id="MICHAUNG")
    assert res["estimated_wind_kt"] is None
    assert res["estimated_wind_kmh"] is None
    assert res["trend"] == "insufficient_evidence"

