from fastapi import APIRouter
from datetime import datetime, timezone
from app.schemas.cyclone import HealthResponse, SystemStatus, ComponentStatus
from app.services.ibtracs_service import ibtracs_service
from app.services.satellite_service import satellite_service
from app.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(
        status="ok",
        service="cycloneai-sat-backend",
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@router.get("/system/status", response_model=SystemStatus)
def get_system_status():
    ibtracs_loaded = ibtracs_service.df is not None and not ibtracs_service.df.empty
    insat_status = satellite_service.get_insat3d_michaung_status()
    
    return SystemStatus(
        backend=ComponentStatus(status="available", detail="FastAPI Backend Online"),
        ibtracs=ComponentStatus(
            status="available" if ibtracs_loaded else "unavailable",
            detail="NOAA IBTrACS v04r01 North Indian Ocean Dataset Loaded" if ibtracs_loaded else "IBTrACS CSV missing"
        ),
        insat3d=ComponentStatus(
            status=insat_status.asset_status,
            detail=f"INSAT-3D Historical Thermal IR Asset ({insat_status.asset_status})"
        ),
        ml_inference=ComponentStatus(
            status="not_connected",
            detail="ML Models offline / Awaiting trained inference backend"
        )
    )
