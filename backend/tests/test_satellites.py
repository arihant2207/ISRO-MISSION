import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_satellite_sources_list():
    """Verify registry lists satellite sources with honest status flags."""
    response = client.get("/api/satellites/sources")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5

    source_ids = [s["source_id"] for s in data]
    assert "INSAT3D_IR" in source_ids
    assert "INSAT3DR_TIR" in source_ids
    assert "EOS06_SCAT" in source_ids
    assert "HIMAWARI9_AHI" in source_ids
    assert "GOES19_ABI" in source_ids


def test_insat3d_metadata():
    """Verify INSAT-3D metadata details and CONNECTED status."""
    response = client.get("/api/satellites/sources/INSAT3D_IR")
    assert response.status_code == 200
    data = response.json()
    assert data["source_id"] == "INSAT3D_IR"
    assert data["platform"] == "INSAT-3D"
    assert data["instrument"] == "Imager"
    assert data["channel"] == "IR 10.8 µm"
    assert data["channel_category"] == "TIR"
    assert data["status"] == "CONNECTED"
    assert data["frame_count"] == 48
    assert "ISRO" in data["provenance"]


def test_unavailable_source_handling():
    """Verify unconnected sources return appropriate status and 0 frames."""
    response = client.get("/api/satellites/sources/EOS06_SCAT")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "NOT_CONNECTED"
    assert data["frame_count"] == 0

    # Frames request for non-connected source returns empty list
    frames_resp = client.get("/api/satellites/sources/EOS06_SCAT/frames")
    assert frames_resp.status_code == 200
    assert frames_resp.json() == []


def test_404_for_invalid_source():
    """Verify invalid source ID returns 404 Not Found."""
    response = client.get("/api/satellites/sources/NON_EXISTENT_SATELLITE")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_channel_normalization():
    """Verify channel category normalization model."""
    response = client.get("/api/satellites/sources")
    assert response.status_code == 200
    sources = response.json()
    
    valid_categories = {"VIS", "SWIR", "MWIR", "TIR", "WATER_VAPOUR", "SST", "OCEAN_WIND", "DERIVED_WIND"}
    for s in sources:
        assert s["channel_category"] in valid_categories


def test_provenance_preservation():
    """Verify satellite frames preserve full provenance metadata."""
    response = client.get("/api/satellites/sources/INSAT3D_IR/frames")
    assert response.status_code == 200
    frames = response.json()
    assert len(frames) == 48
    
    first_frame = frames[0]
    assert first_frame["source_id"] == "INSAT3D_IR"
    assert first_frame["platform"] == "INSAT-3D"
    assert first_frame["instrument"] == "Imager"
    assert first_frame["channel"] == "IR 10.8 µm"
    assert first_frame["channel_category"] == "TIR"
    assert "timestamp" in first_frame
    assert "provenance" in first_frame


def test_source_comparison():
    """Verify multi-source comparison reports INSUFFICIENT_CONNECTED_SOURCES when only INSAT-3D is connected."""
    response = client.get("/api/satellites/comparison")
    assert response.status_code == 200
    data = response.json()
    
    assert data["connected_count"] == 1
    assert data["multi_source_status"] == "INSUFFICIENT_CONNECTED_SOURCES"
    assert "Additional satellite source required" in data["message"]


def test_fusion_readiness():
    """Verify fusion readiness reports NOT_READY and INSUFFICIENT_CONNECTED_SOURCES."""
    response = client.get("/api/satellites/fusion/status")
    assert response.status_code == 200
    data = response.json()
    
    assert data["fusion_status"] == "NOT_READY"
    assert data["multi_source_status"] == "INSUFFICIENT_CONNECTED_SOURCES"
    assert data["connected_source_count"] == 1
    assert data["required_minimum_sources"] == 2
    assert "pipeline_nodes" in data
    assert len(data["pipeline_nodes"]) > 0


def test_no_fake_source_claims():
    """Scientifically verify no satellite source is claimed CONNECTED without local asset."""
    response = client.get("/api/satellites/sources")
    assert response.status_code == 200
    sources = response.json()

    connected_sources = [s for s in sources if s["status"] == "CONNECTED"]
    # Only INSAT-3D has a verified asset on disk
    assert len(connected_sources) == 1
    assert connected_sources[0]["platform"] == "INSAT-3D"
