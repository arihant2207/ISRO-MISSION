import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.services.ibtracs_service import ibtracs_service
from app.services.frame_service import frame_service
from app.services.classification_service import classification_classifier

client = TestClient(app)

def setup_module(module):
    """Ensure dataset and frame service are initialized"""
    ibtracs_service.initialize()
    frame_service.initialize()

def test_taxonomy():
    assert len(classification_classifier.taxonomy) >= 7
    assert "Depression (D)" in classification_classifier.taxonomy
    assert "Severe Cyclonic Storm (SCS)" in classification_classifier.taxonomy

def test_classifier_determinism_and_no_leakage():
    frame = frame_service.get_frame(0)
    res1 = classification_classifier.classify_frame(frame, cyclone_id="MICHAUNG")
    res2 = classification_classifier.classify_frame(frame, cyclone_id="MICHAUNG")
    
    assert res1["predicted_class"] == res2["predicted_class"]
    assert res1["confidence"] is None # No fake confidence rule
    assert "input_features" in res1
    # Verify NO IBTrACS ground truth field is in input_features
    assert "USA_WIND" not in res1["input_features"]
    assert "WMO_WIND" not in res1["input_features"]

def test_insufficient_evidence_handling():
    dummy_frame = {
        "frame_id": 999,
        "width": 100,
        "height": 100,
        "timestamp": "2023-12-03 00:00:00",
        "array": np.zeros((100, 100), dtype=np.uint8),
        "provenance": "Dummy test frame"
    }
    res = classification_classifier.classify_frame(dummy_frame, cyclone_id="MICHAUNG")
    assert res["predicted_class"] == "insufficient_evidence"

def test_classification_status_endpoint():
    response = client.get("/api/classification/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "baseline_active"
    assert "taxonomy" in data
    assert "Research baseline pattern classifier" in data["disclaimer"]

def test_cyclone_classification_single_frame():
    response = client.get("/api/cyclones/MICHAUNG/classification?frame_id=0")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    item = data[0]
    assert "predicted_class" in item
    assert "ground_truth_class" in item
    assert item["confidence"] is None

def test_cyclone_classification_evaluation_endpoint():
    response = client.get("/api/cyclones/MICHAUNG/classification/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert data["cyclone_id"] == "MICHAUNG"
    assert data["total_frames_evaluated"] == 48
    assert data["accuracy"] is not None
    assert isinstance(data["accuracy"], float)
    assert "Single-event validation" in data["event_level_validation_status"]
