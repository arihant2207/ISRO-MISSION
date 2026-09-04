import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_system_evaluation_summary():
    """Verify system evaluation summary aggregates capability-isolated metrics."""
    response = client.get("/api/evaluation/summary")
    assert response.status_code == 200
    data = response.json()

    assert "capabilities" in data
    caps = data["capabilities"]
    assert "identification" in caps
    assert "classification" in caps
    assert "intensity" in caps
    assert "track" in caps
    assert "temporal" in caps

    # Verify no global accuracy averaging
    assert "accuracy" not in data
    assert "average_ai_score" not in data


def test_capability_evaluation_isolated():
    """Verify isolated capability metrics and validation quality taxonomy."""
    # Identification
    id_resp = client.get("/api/evaluation/identification")
    assert id_resp.status_code == 200
    id_data = id_resp.json()
    assert id_data["capability"] == "identification"
    assert id_data["validation_scope"] == "WITHIN_EVENT"
    assert id_data["primary_metric_name"] == "Center Localization MAE"
    assert id_data["primary_metric_value"] is not None and id_data["primary_metric_value"] > 0.0

    # Track
    tr_resp = client.get("/api/evaluation/track")
    assert tr_resp.status_code == 200
    tr_data = tr_resp.json()
    assert tr_data["capability"] == "track"
    assert tr_data["validation_scope"] == "MULTI_EVENT_BASELINE"
    assert tr_data["event_count"] >= 1

    # Temporal
    tp_resp = client.get("/api/evaluation/temporal")
    assert tp_resp.status_code == 200
    tp_data = tp_resp.json()
    assert tp_data["capability"] == "temporal"
    assert tp_data["validation_scope"] == "WITHIN_EVENT_HELD_OUT"


def test_evaluation_provenance():
    """Verify evaluation provenance metadata."""
    response = client.get("/api/evaluation/provenance")
    assert response.status_code == 200
    data = response.json()
    assert data["satellite_platform"] == "INSAT-3D"
    assert data["sensor_instrument"] == "Imager"
    assert "10.8 µm" in data["spectral_channel"]
    assert "NOAA IBTrACS" in data["ground_truth_reference"]


def test_evaluation_limitations():
    """Verify structured limitation registry returns all core limitations."""
    response = client.get("/api/evaluation/limitations")
    assert response.status_code == 200
    lims = response.json()
    assert isinstance(lims, list)
    assert len(lims) >= 8

    lim_ids = [l["limitation_id"] for l in lims]
    assert "LIM_SINGLE_SOURCE" in lim_ids
    assert "LIM_MICHAUNG_ONLY" in lim_ids
    assert "LIM_NO_LIVE" in lim_ids
    assert "LIM_FUSION_NOT_READY" in lim_ids


def test_evaluation_report_json():
    """Verify machine-readable evaluation report JSON generation."""
    response = client.get("/api/evaluation/report.json")
    assert response.status_code == 200
    data = response.json()
    assert data["system_version"] == "Phase 9 — CycloneAI Unified Scientific Baseline"
    assert data["overall_status"] == "RESEARCH_BASELINE_VERIFIED"
    assert data["multi_source_fusion_status"] == "INSUFFICIENT_CONNECTED_SOURCES"
    assert "capabilities" in data
    assert "source_registry_summary" in data
    assert data["source_registry_summary"]["connected_count"] == 1


def test_404_invalid_capability():
    """Verify requesting an unknown evaluation capability returns 404."""
    response = client.get("/api/evaluation/non_existent_capability")
    assert response.status_code == 404
    assert "unknown capability" in response.json()["detail"].lower()
