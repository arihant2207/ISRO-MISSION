from fastapi import APIRouter
from .health import router as health_router
from .cyclones import router as cyclones_router
from .satellites import router as satellites_router
from .models import router as models_router
from .identification import router as identification_router
from .classification import router as classification_router
from .intensity import router as intensity_router
from .track import router as track_router
from .landfall import router as landfall_router
from .temporal import router as temporal_router
from .evaluation import router as evaluation_router
from .xai import router as xai_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["Health & Status"])
api_router.include_router(cyclones_router, tags=["Cyclones & Tracks"])
api_router.include_router(identification_router, tags=["Cyclone Identification"])
api_router.include_router(classification_router, tags=["Pattern Classification"])
api_router.include_router(intensity_router, tags=["Cyclone Intensity Estimation"])
api_router.include_router(track_router, tags=["Cyclone Track Forecast"])
api_router.include_router(landfall_router, tags=["Landfall & Risk Intelligence"])
api_router.include_router(temporal_router, tags=["Temporal Satellite Enhancement"])
api_router.include_router(satellites_router, tags=["Satellite Intelligence"])
api_router.include_router(evaluation_router, tags=["Unified Scientific Evaluation"])
api_router.include_router(xai_router, tags=["Explainable AI (XAI)"])
api_router.include_router(models_router, tags=["Model Intelligence"])





