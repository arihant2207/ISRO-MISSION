import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.ml.model import cnn_interpolator
from app.ml.evaluate import evaluate_prediction, calculate_ssim, calculate_psnr
from app.services.temporal_service import temporal_service
from app.services.frame_service import frame_service

client = TestClient(app)

def test_cnn_interpolator_prediction_shape():
    f0 = np.full((64, 64), 100, dtype=np.uint8)
    f2 = np.full((64, 64), 200, dtype=np.uint8)
    
    pred = cnn_interpolator.predict(f0, f2)
    assert pred.shape == (64, 64)
    assert pred.dtype == np.uint8
    assert np.min(pred) >= 0 and np.max(pred) <= 255

def test_evaluate_prediction_metrics():
    img1 = np.full((32, 32), 100, dtype=np.uint8)
    img2 = np.full((32, 32), 100, dtype=np.uint8)
    
    m = evaluate_prediction(img1, img2)
    assert m["mae"] == 0.0
    assert m["mse"] == 0.0
    assert m["psnr_db"] == 100.0
    assert m["ssim"] == 1.0

def test_temporal_status_endpoint():
    response = client.get("/api/temporal/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "baseline_and_ml_active"
    assert data["model_status"] == "TRAINED"
    assert data["evaluation_status"] == "EVALUATION_AVAILABLE"

def test_temporal_interpolation_linear_and_ml():
    frame_service.initialize()
    
    # Test target frame ID 10
    res_lin = temporal_service.interpolate_triplet(target_frame_id=10, method="linear", cyclone_id="MICHAUNG")
    assert res_lin["status"] == "valid"
    assert res_lin["method_code"] == "linear"
    assert res_lin["metrics"]["ssim"] > 0.0

    res_ml = temporal_service.interpolate_triplet(target_frame_id=10, method="ml", cyclone_id="MICHAUNG")
    assert res_ml["status"] == "valid"
    assert res_ml["method_code"] == "ml"
    assert res_ml["metrics"]["ssim"] > 0.0

def test_zero_target_frame_leakage():
    """
    Verifies that target frame T1 is NOT passed into model input.
    """
    res = temporal_service.interpolate_triplet(target_frame_id=15, method="ml", cyclone_id="MICHAUNG")
    assert res["input_frame_ids"] == [14, 16]
    assert 15 not in res["input_frame_ids"]

def test_temporal_evaluation_held_out():
    res = temporal_service.evaluate_temporal_pipeline(cyclone_id="MICHAUNG")
    assert res["evaluated_test_triplets_count"] > 0
    assert "comparison_results" in res
    assert "linear_baseline" in res["comparison_results"]
    assert "ml_model" in res["comparison_results"]

def test_temporal_api_routes():
    r1 = client.get("/api/cyclones/MICHAUNG/temporal?frame_id=5&method=ml")
    assert r1.status_code == 200
    assert r1.json()["target_frame_id"] == 5

    r2 = client.get("/api/cyclones/MICHAUNG/temporal/evaluation")
    assert r2.status_code == 200
    assert "comparison_results" in r2.json()

def test_invalid_target_frame_id():
    response = client.get("/api/cyclones/MICHAUNG/temporal?frame_id=0") # Frame 0 has no T0
    assert response.status_code in [400, 422]

