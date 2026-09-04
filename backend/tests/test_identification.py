from fastapi.testclient import TestClient
from app.main import app
from app.services.ibtracs_service import ibtracs_service
from app.services.frame_service import frame_service
from app.services.identification_service import identification_detector

client = TestClient(app)

def setup_module(module):
    """Ensure dataset and frame service are initialized"""
    ibtracs_service.initialize()
    frame_service.initialize()

def test_frame_service():
    meta = frame_service.get_all_frames_metadata()
    assert len(meta) == 48
    first_frame = frame_service.get_frame(0)
    assert first_frame is not None
    assert first_frame["width"] == 1260
    assert first_frame["height"] == 1418
    assert "array" in first_frame

def test_baseline_detector_output():
    frame = frame_service.get_frame(0)
    res = identification_detector.detect_frame(frame, cyclone_id="MICHAUNG")
    assert "detected" in res
    assert "detector_name" in res
    assert res["detector_type"] == "Classical/Algorithmic Baseline"
    assert "disclaimer" in res
    if res["detected"]:
        assert len(res["center_pixel"]) == 2
        assert "candidate_geo" in res
        assert "bounding_box_pixel" in res
        assert "features" in res
        assert "convective_area_pixels" in res["features"]

def test_identification_status_endpoint():
    response = client.get("/api/identification/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "baseline_active"
    assert data["architecture_ready"] is True
    assert len(data["extension_points"]) >= 3

def test_cyclone_identification_single_frame():
    response = client.get("/api/cyclones/MICHAUNG/identification?frame_id=0")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    item = data[0]
    assert item["frame_id"] == 0
    assert item["detector_type"] == "Classical/Algorithmic Baseline"
    assert "Research baseline" in item["disclaimer"]

def test_cyclone_identification_all_frames():
    response = client.get("/api/cyclones/MICHAUNG/identification")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 48

def test_cyclone_identification_evaluation_endpoint():
    response = client.get("/api/cyclones/MICHAUNG/identification/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert data["cyclone_id"] == "MICHAUNG"
    assert data["total_frames_evaluated"] == 48
    assert data["detected_count"] > 0
    assert data["matched_ibtracs_observations"] > 0
    assert data["center_error_mae_km"] is not None
    assert isinstance(data["center_error_mae_km"], float)
