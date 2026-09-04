from fastapi.testclient import TestClient
from app.main import app
from app.services.ibtracs_service import ibtracs_service

# Initialize test client and data
client = TestClient(app)

def setup_module(module):
    """Ensure dataset is loaded before running tests"""
    ibtracs_service.initialize()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "cycloneai-sat-backend"
    assert "timestamp" in data

def test_system_status_endpoint():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["backend"]["status"] == "available"
    assert data["ibtracs"]["status"] == "available"
    assert data["insat3d"]["status"] == "available"
    assert data["ml_inference"]["status"] == "not_connected"

def test_get_cyclones_list():
    response = client.get("/api/cyclones?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Check if Michaung is in top list
    michaung = next((c for c in data if "MICHAUNG" in c["name"].upper()), None)
    assert michaung is not None
    assert michaung["id"] == "2023334N08088"
    assert michaung["observation_count"] == 49

def test_get_michaung_detail_by_name():
    response = client.get("/api/cyclones/MICHAUNG")
    assert response.status_code == 200
    data = response.json()
    assert "MICHAUNG" in data["name"].upper()
    assert data["id"] == "2023334N08088"
    assert data["season"] == 2023
    assert data["basin"] == "NI"
    assert data["observation_count"] == 49
    assert data["peak_wind_kt"] == 55.0
    assert data["min_pressure_hpa"] == 986.0

def test_get_michaung_detail_by_sid():
    response = client.get("/api/cyclones/2023334N08088")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "2023334N08088"
    assert "MICHAUNG" in data["name"].upper()

def test_get_michaung_track():
    response = client.get("/api/cyclones/MICHAUNG/track")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 49
    first_pt = data[0]
    assert first_pt["lat"] == 7.5
    assert first_pt["lon"] == 88.0
    assert first_pt["wind_kt"] == 15.0
    assert first_pt["wind_kmh"] == round(15.0 * 1.852, 1)
    assert first_pt["pres_hpa"] == 1008.0
    assert "source" in first_pt



def test_invalid_cyclone_id():
    response = client.get("/api/cyclones/INVALID_ID_999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_satellite_status_endpoint():
    response = client.get("/api/satellites/insat3d/michaung")
    assert response.status_code == 200
    data = response.json()
    assert data["satellite"] == "INSAT-3D"
    assert data["event"] == "Cyclone Michaung"
    assert data["asset_status"] == "available"

def test_model_status_endpoint():
    response = client.get("/api/models/status")
    assert response.status_code == 200
    data = response.json()
    assert data["detection"]["status"] == "not_connected"
    assert data["classification"]["status"] == "not_connected"
    assert data["intensity"]["status"] == "not_connected"
    assert data["track_forecast"]["status"] == "not_connected"
