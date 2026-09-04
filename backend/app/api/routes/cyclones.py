from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.schemas.cyclone import CycloneSummary, CycloneDetail, TrackPoint
from app.services.ibtracs_service import ibtracs_service

router = APIRouter()

@router.get("/cyclones", response_model=List[CycloneSummary])
def get_cyclones(limit: int = Query(50, ge=1, le=500), named_only: bool = Query(True)):
    """
    Return list of available historical tropical cyclone events from NOAA IBTrACS dataset.
    """
    return ibtracs_service.get_cyclones(limit=limit, named_only=named_only)

@router.get("/cyclones/{cyclone_id}", response_model=CycloneDetail)
def get_cyclone_detail(cyclone_id: str):
    """
    Get detailed cyclone metadata by SID or Name (e.g., 2023334N08088 or MICHAUNG).
    """
    cyclone = ibtracs_service.get_cyclone_by_id(cyclone_id)
    if not cyclone:
        raise HTTPException(status_code=404, detail=f"Cyclone '{cyclone_id}' not found in IBTrACS dataset.")
    return cyclone

@router.get("/cyclones/{cyclone_id}/track", response_model=List[TrackPoint])
def get_cyclone_track(cyclone_id: str):
    """
    Get raw observed track points for specified cyclone from IBTrACS dataset.
    """
    track = ibtracs_service.get_cyclone_track(cyclone_id)
    if not track:
        raise HTTPException(status_code=404, detail=f"Track points for cyclone '{cyclone_id}' not found.")
    return track
