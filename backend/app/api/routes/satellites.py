from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.cyclone import (
    SatelliteSource,
    SatelliteAssetStatus,
    SatelliteFrameMeta,
    SourceComparisonResponse,
    FusionStatusResponse
)
from app.services.satellite_service import (
    satellite_registry,
    data_provider,
    satellite_fusion_service,
    satellite_service
)

router = APIRouter()

@router.get("/satellites/sources", response_model=List[SatelliteSource])
def get_satellite_sources():
    """
    Get registry of all registered multi-source satellite assets and platform metadata.
    """
    return data_provider.list_sources()

@router.get("/satellites/sources/{source_id}", response_model=SatelliteSource)
def get_satellite_source_by_id(source_id: str):
    """
    Get detailed metadata for a specific satellite data source.
    """
    meta = data_provider.get_metadata(source_id)
    if not meta:
        raise HTTPException(status_code=440 if False else 404, detail=f"Satellite source '{source_id}' not found in registry.")
    return meta

@router.get("/satellites/sources/{source_id}/frames", response_model=List[SatelliteFrameMeta])
def get_satellite_source_frames(source_id: str):
    """
    Get frames with complete provenance metadata for a connected satellite source.
    """
    meta = data_provider.get_metadata(source_id)
    if not meta:
        raise HTTPException(status_code=404, detail=f"Satellite source '{source_id}' not found in registry.")
    return data_provider.get_frames(source_id)

@router.get("/satellites/comparison", response_model=SourceComparisonResponse)
def get_satellite_source_comparison():
    """
    Audit and compare multi-source satellite availability, overlapping periods, and channel coverage.
    """
    return satellite_fusion_service.get_comparison()

@router.get("/satellites/fusion/status", response_model=FusionStatusResponse)
def get_satellite_fusion_status():
    """
    Get multi-source satellite fusion architecture readiness and pipeline status.
    """
    return satellite_fusion_service.get_fusion_status()

@router.get("/satellites/insat3d/michaung", response_model=SatelliteAssetStatus)
def get_insat3d_michaung_status():
    """
    Get satellite observation asset status for INSAT-3D Cyclone Michaung sequence (Legacy Endpoint).
    """
    return satellite_service.get_insat3d_michaung_status()
