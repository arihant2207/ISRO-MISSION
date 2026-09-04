import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.landfall_service import coastline_provider, landfall_analyzer, risk_service
from app.services.ibtracs_service import ibtracs_service

client = TestClient(app)

def test_coastline_provider():
    status = coastline_provider.get_status()
    assert status["asset_status"] == "AVAILABLE"
    assert status["segment_count"] > 10
    
    # Distance to Bapatla AP (15.90, 80.47)
    dist, region = coastline_provider.distance_to_coast(15.90, 80.47)
    assert dist == 0.0
    assert "Bapatla" in region

def test_landfall_status_endpoint():
    response = client.get("/api/landfall/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "baseline_active"
    assert "VERY_HIGH" in data["supported_risk_states"]
    assert data["probabilistic_risk"] == "unavailable"

def test_cyclone_landfall_analysis():
    ibtracs_service.initialize()
    res = landfall_analyzer.analyze_landfall(cyclone_id="MICHAUNG")
    assert res["cyclone_id"] == "MICHAUNG"
    assert "landfall_summary" in res
    assert "proximity_timeline" in res
    assert len(res["proximity_timeline"]) > 0

def test_cyclone_risk_assessment():
    ibtracs_service.initialize()
    res = risk_service.assess_risk(cyclone_id="MICHAUNG")
    assert res["cyclone_id"] == "MICHAUNG"
    assert res["overall_risk_state"] in ["LOW", "MODERATE", "HIGH", "VERY_HIGH"]
    assert res["risk_dimensions"]["wind_hazard"] in ["LOW", "MODERATE", "HIGH", "VERY_HIGH"]
    assert res["probabilistic_risk_status"] == "unavailable"

def test_landfall_api_routes():
    res1 = client.get("/api/cyclones/MICHAUNG/landfall")
    assert res1.status_code == 200
    assert "landfall_summary" in res1.json()

    res2 = client.get("/api/cyclones/MICHAUNG/risk")
    assert res2.status_code == 200
    assert "overall_risk_state" in res2.json()

    res3 = client.get("/api/cyclones/MICHAUNG/risk/timeline")
    assert res3.status_code == 200
    assert "timeline" in res3.json()

def test_invalid_cyclone_landfall():
    res = client.get("/api/cyclones/NON_EXISTENT_CYC/landfall")
    assert res.status_code == 404
