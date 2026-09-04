import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.track_service import (
    track_predictor, 
    haversine_distance_km, 
    calculate_initial_bearing_deg, 
    extrapolate_destination
)
from app.services.ibtracs_service import ibtracs_service

client = TestClient(app)

def test_spherical_geometry_helpers():
    # Distance between Chennai (13.08, 80.27) and Visakhapatnam (17.68, 83.21)
    dist = haversine_distance_km(13.08, 80.27, 17.68, 83.21)
    assert 580 < dist < 620
    
    bearing = calculate_initial_bearing_deg(13.08, 80.27, 17.68, 83.21)
    assert 20 < bearing < 40 # North-East direction
    
    dest = extrapolate_destination(13.08, 80.27, 100.0, 45.0)
    assert dest["lat"] > 13.08
    assert dest["lon"] > 80.27

def test_track_status_endpoint():
    response = client.get("/api/track/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "baseline_active"
    assert data["supported_horizons_hours"] == [6, 12, 24, 48, 72]
    assert data["uncertainty_status"] == "unavailable"

def test_forecast_generation_horizons():
    ibtracs_service.initialize()
    fc = track_predictor.generate_forecast(cyclone_id="MICHAUNG")
    assert fc["status"] == "valid"
    assert "forecast_origin_timestamp" in fc
    
    pts = fc["forecast_points"]
    assert len(pts) == 5
    horizons = [p["horizon_hours"] for p in pts]
    assert horizons == [6, 12, 24, 48, 72]
    assert fc["uncertainty_status"] == "unavailable"

def test_zero_future_data_leakage_prevented():
    """
    CRITICAL SCIENTIFIC TEST:
    Verifies that mutating future IBTrACS data (after origin T) does NOT alter the forecast.
    """
    ibtracs_service.initialize()
    tracks = ibtracs_service.get_cyclone_track("MICHAUNG")
    assert len(tracks) >= 10
    
    # Select origin timestamp at index 5
    origin_time = tracks[5].time
    
    # 1. Generate original forecast
    fc1 = track_predictor.generate_forecast(cyclone_id="MICHAUNG", origin_timestamp=origin_time)
    
    # 2. Mutate future track points (index > 5) in memory
    future_pts = [pt for pt in tracks if pt.time > origin_time]
    assert len(future_pts) > 0
    
    original_lats = [pt.lat for pt in future_pts]
    for pt in future_pts:
        pt.lat = pt.lat + 10.0 # Mutate future positions arbitrarily
        
    # Generate forecast again from same origin_time
    fc2 = track_predictor.generate_forecast(cyclone_id="MICHAUNG", origin_timestamp=origin_time)
    
    # Restore original positions
    for idx, pt in enumerate(future_pts):
        pt.lat = original_lats[idx]

    # Verify that forecast 1 and forecast 2 are IDENTICAL (zero leakage!)
    for p1, p2 in zip(fc1["forecast_points"], fc2["forecast_points"]):
        assert p1["latitude"] == p2["latitude"]
        assert p1["longitude"] == p2["longitude"]

def test_track_evaluation_single_and_multievent():
    # Single event evaluation
    res = track_predictor.evaluate_cyclone_track("MICHAUNG")
    assert res["evaluated_cyclone_events"] == 1
    assert "horizon_metrics" in res
    assert "6h" in res["horizon_metrics"]
    
    # Multi event evaluation
    multi_res = track_predictor.evaluate_multi_event_tracks(["MICHAUNG", "BIPARJOY", "DANA"])
    assert multi_res["evaluated_cyclone_events"] >= 1
    assert multi_res["uncertainty_status"] == "unavailable"

def test_track_forecast_api_endpoints():
    response = client.get("/api/cyclones/MICHAUNG/track/forecast")
    assert response.status_code == 200
    data = response.json()
    assert data["cyclone_id"] == "MICHAUNG"
    assert len(data["forecast_points"]) == 5
    
    eval_resp = client.get("/api/cyclones/MICHAUNG/track/evaluation")
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert eval_data["evaluated_cyclone_events"] == 1

def test_invalid_cyclone_handling():
    response = client.get("/api/cyclones/NON_EXISTENT_CYC/track/forecast")
    assert response.status_code == 404
