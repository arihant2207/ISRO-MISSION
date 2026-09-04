import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_xai_identification():
    """Verify identification XAI response feature attributions and decision rules."""
    response = client.get("/api/xai/identification/MICHAUNG?frame_id=10")
    assert response.status_code == 200
    data = response.json()
    assert data["capability"] == "identification"
    assert data["method_type"] == "feature_attribution"
    assert len(data["attributions"]) >= 3
    assert len(data["decision_rules"]) >= 2
    assert "convective_area_pixels" in data["mathematical_breakdown"]


def test_xai_classification():
    """Verify classification XAI response decision path through Dvorak IR heuristics."""
    response = client.get("/api/xai/classification/MICHAUNG?frame_id=10")
    assert response.status_code == 200
    data = response.json()
    assert data["capability"] == "classification"
    assert data["method_type"] == "deterministic_heuristic"
    assert "thermal_vigor_index" in data["mathematical_breakdown"]
    assert any("Severe Cyclonic Storm" in rule for rule in data["decision_rules"])


def test_xai_intensity():
    """Verify intensity XAI response mathematical component breakdown."""
    response = client.get("/api/xai/intensity/MICHAUNG?frame_id=10")
    assert response.status_code == 200
    data = response.json()
    assert data["capability"] == "intensity"
    breakdown = data["mathematical_breakdown"]
    assert "base_component_kmh" in breakdown
    assert "area_component_kmh" in breakdown
    assert "thermal_component_kmh" in breakdown
    assert "compactness_component_kmh" in breakdown
    assert "final_estimated_wind_kmh" in breakdown


def test_xai_track():
    """Verify track XAI response kinematic vector extrapolation breakdown."""
    response = client.get("/api/xai/track/MICHAUNG")
    assert response.status_code == 200
    data = response.json()
    assert data["capability"] == "track"
    assert data["method_type"] == "kinematic_extrapolation"
    assert "translation_speed_kmh" in data["mathematical_breakdown"]
    assert "heading_deg" in data["mathematical_breakdown"]


def test_xai_temporal():
    """Verify temporal XAI response residual difference map diagnostics."""
    response = client.get("/api/xai/temporal/MICHAUNG?frame_id=10&method=ml")
    assert response.status_code == 200
    data = response.json()
    assert data["capability"] == "temporal"
    assert data["method_type"] == "difference_residual"
    assert data["residual_diagnostics"] is not None
    assert "Pixel-level attribution unavailable" in data["disclaimer"]


def test_xai_invalid_capability():
    """Verify requesting XAI for unknown capability returns 404."""
    response = client.get("/api/xai/invalid_capability/MICHAUNG")
    assert response.status_code == 404
    assert "unknown capability" in response.json()["detail"].lower()
