from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.schemas.cyclone import (
    SystemEvaluationSummary,
    CapabilityEvaluationSummary,
    ProvenanceMetadata,
    LimitationItem,
    EvaluationReportJSON
)
from app.services.evaluation_service import evaluation_service

router = APIRouter()

@router.get("/evaluation/summary", response_model=SystemEvaluationSummary)
def get_system_evaluation_summary():
    """
    Get aggregated unified scientific evaluation summary across all system capabilities.
    """
    return evaluation_service.get_system_evaluation_summary()

@router.get("/evaluation/provenance", response_model=ProvenanceMetadata)
def get_evaluation_provenance():
    """
    Get centralized dataset and model evaluation provenance metadata.
    """
    return evaluation_service.get_provenance()

@router.get("/evaluation/limitations", response_model=List[LimitationItem])
def get_evaluation_limitations():
    """
    Get structured system limitation registry.
    """
    return evaluation_service.get_limitations()

@router.get("/evaluation/report.json", response_model=EvaluationReportJSON)
def get_evaluation_report_json():
    """
    Get machine-readable scientific evaluation export report in JSON format.
    """
    return evaluation_service.generate_evaluation_report_json()

@router.get("/evaluation/{capability}", response_model=CapabilityEvaluationSummary)
def get_capability_evaluation_summary(capability: str):
    """
    Get isolated scientific evaluation metrics and validation scope for a specific capability.
    Valid capabilities: identification, classification, intensity, track, temporal.
    """
    try:
        return evaluation_service.get_capability_summary(capability)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown capability '{capability}'. Valid capabilities: identification, classification, intensity, track, temporal."
        )
