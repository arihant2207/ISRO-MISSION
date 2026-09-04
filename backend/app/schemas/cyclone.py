from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class HealthResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "ok"})
    service: str = Field(..., json_schema_extra={"example": "cycloneai-sat-backend"})
    timestamp: str

class ComponentStatus(BaseModel):
    status: str = Field(..., description="Status string e.g. available, not_connected, error, prototype")
    detail: Optional[str] = None

class SystemStatus(BaseModel):
    backend: ComponentStatus
    ibtracs: ComponentStatus
    insat3d: ComponentStatus
    ml_inference: ComponentStatus

class TrackPoint(BaseModel):
    time: str = Field(..., description="Timestamp in UTC format YYYY-MM-DD HH:MM:SS")
    nature: str = Field(..., description="Storm nature e.g. DS, TS, MX")
    lat: float = Field(..., description="Latitude degrees North")
    lon: float = Field(..., description="Longitude degrees East")
    wind_kt: float = Field(..., description="Maximum sustained wind in knots (raw IBTrACS)")
    wind_kmh: float = Field(..., description="Maximum sustained wind converted to km/h")
    pres_hpa: float = Field(..., description="Minimum central pressure in hPa")
    category: str = Field(..., description="IMD Category classification derived from wind speed")
    source: str = Field(default="NOAA IBTrACS v04r01")

class CycloneSummary(BaseModel):
    id: str = Field(..., description="IBTrACS unique identifier or SID")
    name: str = Field(..., description="Name of the tropical cyclone")
    season: int = Field(..., description="Year/Season")
    basin: str = Field(..., description="Ocean Basin e.g. NI (North Indian)")
    start_time: str = Field(..., description="First observation UTC timestamp")
    end_time: str = Field(..., description="Last observation UTC timestamp")
    observation_count: int = Field(..., description="Total track observation points")
    peak_wind_kt: float = Field(..., description="Peak wind speed in knots")
    peak_wind_kmh: float = Field(..., description="Peak wind speed in km/h")
    min_pressure_hpa: float = Field(..., description="Lowest central pressure in hPa")
    source: str = Field(default="NOAA IBTrACS v04r01")

class CycloneDetail(CycloneSummary):
    landfall_location: Optional[str] = None
    satellite_sensor: str = Field(default="INSAT-3D IR 10.8 µm")
    mode: str = Field(default="historical", description="historical | live")

class SatelliteAssetStatus(BaseModel):
    satellite: str = Field(..., json_schema_extra={"example": "INSAT-3D"})
    event: str = Field(..., json_schema_extra={"example": "Cyclone Michaung"})
    channel: str = Field(..., json_schema_extra={"example": "IR 10.8 µm"})
    observation_type: str = Field(..., json_schema_extra={"example": "historical"})
    asset_status: str = Field(..., json_schema_extra={"example": "available"})
    asset_path: str = Field(..., json_schema_extra={"example": "/IR_Michaung.gif"})
    frame_count: int = Field(default=5)
    provenance: str = Field(default="ISRO / MOSDAC Historical Observation Stream")

class ModelStatusResponse(BaseModel):
    detection: ComponentStatus
    classification: ComponentStatus
    intensity: ComponentStatus
    track_forecast: ComponentStatus
    landfall: ComponentStatus
    temporal_model: ComponentStatus
    explainability: ComponentStatus

class IdentificationResult(BaseModel):
    frame_id: int
    timestamp: str
    detected: bool
    reason: Optional[str] = None
    center_pixel: Optional[List[float]] = None
    candidate_geo: Optional[Dict[str, float]] = None
    bounding_box_pixel: Optional[List[int]] = None
    observed_geo: Optional[Dict[str, float]] = None
    observed_storm_stage: Optional[str] = None
    distance_error_km: Optional[float] = None
    features: Optional[Dict[str, Any]] = None
    detector_name: str
    detector_type: str
    provenance: str
    disclaimer: str

class IdentificationEvaluation(BaseModel):
    cyclone_id: str
    total_frames_evaluated: int
    detected_count: int
    matched_ibtracs_observations: int
    center_error_mae_km: Optional[float] = None
    center_error_median_km: Optional[float] = None
    center_error_min_km: Optional[float] = None
    center_error_max_km: Optional[float] = None
    detector_name: str
    detector_type: str
    provenance: str
    disclaimer: str

class ClassificationResult(BaseModel):
    cyclone_id: str
    frame_id: int
    timestamp: str
    predicted_class: str
    method: str
    input_features: Dict[str, Any]
    ground_truth_class: Optional[str] = None
    ground_truth_source: str
    match_status: str
    evidence_explanation: str
    confidence: Optional[float] = None
    provenance: str
    disclaimer: str

class ClassificationEvaluation(BaseModel):
    cyclone_id: str
    total_frames_evaluated: int
    matched_frames: int
    agreed_frames_count: int
    accuracy: Optional[float] = None
    macro_precision: Optional[float] = None
    macro_recall: Optional[float] = None
    macro_f1: Optional[float] = None
    per_class_counts: Dict[str, Dict[str, int]]
    method: str
    ground_truth_source: str
    event_level_validation_status: str
    disclaimer: str

class IntensityResult(BaseModel):
    cyclone_id: str
    frame_id: int
    timestamp: str
    estimated_wind_kt: Optional[float] = None
    estimated_wind_kmh: Optional[float] = None
    estimated_wind_unit: str = "km/h"
    ground_truth_wind_kt: Optional[float] = None
    ground_truth_wind_kmh: Optional[float] = None
    ground_truth_unit: str = "km/h"
    ground_truth_source: str
    ground_truth_status: str
    timestamp_offset_minutes: Optional[float] = None
    error_kmh: Optional[float] = None
    trend: str
    input_features: Dict[str, Any]
    method: str
    confidence: Optional[float] = None
    validation_status: str
    provenance: str
    disclaimer: str

class IntensityEvaluation(BaseModel):
    cyclone_id: str
    total_frames_evaluated: int
    matched_frames: int
    mae_kmh: Optional[float] = None
    rmse_kmh: Optional[float] = None
    mean_bias_kmh: Optional[float] = None
    median_abs_error_kmh: Optional[float] = None
    min_error_kmh: Optional[float] = None
    max_error_kmh: Optional[float] = None
    r2_score: Optional[float] = None
    method: str
    ground_truth_source: str
    validation_status: str
    disclaimer: str

class ForecastPoint(BaseModel):
    horizon_hours: int
    forecast_timestamp: str
    latitude: float
    longitude: float
    ground_truth_latitude: Optional[float] = None
    ground_truth_longitude: Optional[float] = None
    error_km: Optional[float] = None
    method: str
    provenance: str

class TrackForecastResponse(BaseModel):
    cyclone_id: str
    status: str
    forecast_origin_timestamp: Optional[str] = None
    origin_latitude: Optional[float] = None
    origin_longitude: Optional[float] = None
    estimated_speed_kmh: Optional[float] = None
    estimated_heading_deg: Optional[float] = None
    input_window_points: Optional[int] = None
    forecast_points: Optional[List[ForecastPoint]] = None
    uncertainty_status: str = "unavailable"
    uncertainty_disclaimer: str = "Uncertainty cone unavailable — insufficient independent validation data."
    method: str
    provenance: str
    disclaimer: str

class HorizonMetric(BaseModel):
    forecast_count: Optional[int] = None
    sample_count: Optional[int] = None
    mae_km: Optional[float] = None
    median_km: Optional[float] = None
    min_km: Optional[float] = None
    max_km: Optional[float] = None

class TrackEvaluationResponse(BaseModel):
    cyclone_id: Optional[str] = None
    evaluated_origins_count: Optional[int] = None
    evaluated_cyclone_events: int
    evaluated_cyclone_ids: Optional[List[str]] = None
    validation_status: str
    horizon_metrics: Dict[str, HorizonMetric]
    uncertainty_status: str = "unavailable"
    uncertainty_disclaimer: str = "Uncertainty cone unavailable — insufficient independent validation data."
    method: str
    provenance: str
    disclaimer: str

class LandfallSummary(BaseModel):
    landfall_status: str
    landfall_timestamp: Optional[str] = None
    landfall_latitude: Optional[float] = None
    landfall_longitude: Optional[float] = None
    landfall_region: Optional[str] = None
    forecast_horizon_hours: Optional[int] = None
    distance_to_coast_km: Optional[float] = None
    minimum_distance_to_coast_km: Optional[float] = None

class ProximityItem(BaseModel):
    horizon_hours: int
    forecast_timestamp: str
    latitude: float
    longitude: float
    distance_to_coast_km: float
    nearest_coastal_region: str
    ground_truth_latitude: Optional[float] = None
    ground_truth_longitude: Optional[float] = None
    ground_truth_error_km: Optional[float] = None

class LandfallResponse(BaseModel):
    cyclone_id: str
    forecast_origin_timestamp: Optional[str] = None
    origin_distance_to_coast_km: Optional[float] = None
    origin_nearest_region: Optional[str] = None
    landfall_summary: LandfallSummary
    historical_ground_truth_landfall: Optional[Dict[str, Any]] = None
    proximity_timeline: List[ProximityItem]
    method: str
    provenance: str
    disclaimer: str

class RiskDimensions(BaseModel):
    wind_hazard: str
    coastal_proximity: str
    landfall_likelihood: str
    intensity_trend: str
    track_uncertainty: str = "UNAVAILABLE"

class RiskResponse(BaseModel):
    cyclone_id: str
    forecast_origin_timestamp: Optional[str] = None
    overall_risk_state: str
    risk_dimensions: RiskDimensions
    risk_explanation: str
    minimum_projected_coastal_distance_km: float
    probabilistic_risk_status: str = "unavailable"
    probabilistic_risk_disclaimer: str = "Probabilistic risk unavailable — baseline forecast has no calibrated uncertainty."
    method: str
    provenance: str
    disclaimer: str

class TemporalMetrics(BaseModel):
    mae: Optional[float] = None
    mse: Optional[float] = None
    psnr_db: Optional[float] = None
    ssim: Optional[float] = None

class TemporalResultResponse(BaseModel):
    cyclone_id: str
    status: str
    target_frame_id: Optional[int] = None
    input_frame_ids: Optional[List[int]] = None
    timestamps: Optional[Dict[str, str]] = None
    method: str
    method_code: str
    split_membership: str
    metrics: Optional[TemporalMetrics] = None
    difference_diagnostics: Optional[Dict[str, Any]] = None
    provenance: str
    disclaimer: str

class TemporalEvaluationResponse(BaseModel):
    cyclone_id: str
    evaluated_test_triplets_count: int
    test_split_frame_ids: List[int]
    comparison_results: Dict[str, TemporalMetrics]
    ml_beats_baseline: bool
    training_status: str
    evaluation_status: str
    train_val_split_method: str
    provenance: str
    disclaimer: str

class SatelliteSource(BaseModel):
    source_id: str = Field(..., description="Unique identifier for the satellite data source")
    platform: str = Field(..., description="Satellite platform name e.g. INSAT-3D")
    instrument: str = Field(..., description="Sensor or instrument name e.g. Imager")
    product: str = Field(..., description="Product description e.g. Thermal Infrared")
    channel: str = Field(..., description="Specific spectral channel e.g. IR 10.8 µm")
    channel_category: str = Field(..., description="Normalized category: VIS, SWIR, MWIR, TIR, WATER_VAPOUR, SST, OCEAN_WIND, DERIVED_WIND")
    status: str = Field(..., description="CONNECTED | CONFIGURED | NOT_CONNECTED | UNAVAILABLE")
    asset_path: Optional[str] = Field(None, description="Local file path if status is CONNECTED")
    temporal_coverage: str = Field(..., description="Temporal coverage range string")
    spatial_coverage: str = Field(..., description="Spatial domain coverage description")
    spatial_resolution_km: Optional[float] = Field(None, description="Spatial resolution in km")
    temporal_resolution_min: Optional[int] = Field(None, description="Temporal sampling cadence in minutes")
    frame_count: int = Field(default=0, description="Total locally available frames")
    provenance: str = Field(..., description="Data provider provenance")
    disclaimer: str = Field(default="Scientific observation data metadata — verified against local filesystem assets.")

class SatelliteFrameMeta(BaseModel):
    frame_id: int
    source_id: str
    platform: str
    instrument: str
    channel: str
    channel_category: str
    timestamp: str
    asset_url: str
    provenance: str

class SourceComparisonResponse(BaseModel):
    total_sources: int
    connected_count: int
    configured_count: int
    not_connected_count: int
    unavailable_count: int
    sources: List[SatelliteSource]
    overlapping_time_periods: List[Dict[str, str]]
    common_channels: List[str]
    multi_source_status: str = Field(default="INSUFFICIENT_CONNECTED_SOURCES", description="INSUFFICIENT_CONNECTED_SOURCES | MULTI_SOURCE_AVAILABLE")
    message: str = Field(default="Additional satellite source required for operational multi-source fusion.")
    provenance: str = Field(default="CycloneAI Multi-Source Registry Audit")
    disclaimer: str = Field(default="Research multi-source baseline — only verified local assets are CONNECTED.")

class FusionPipelineNode(BaseModel):
    node_id: str
    node_name: str
    node_type: str = Field(..., description="source | preprocessing | alignment | fusion | downstream")
    status: str = Field(..., description="CONNECTED | NOT_CONNECTED | CONFIGURED | NOT_READY | READY")
    description: str

class FusionStatusResponse(BaseModel):
    fusion_status: str = Field(default="NOT_READY", description="NOT_READY | OPERATIONAL")
    multi_source_status: str = Field(default="INSUFFICIENT_CONNECTED_SOURCES", description="INSUFFICIENT_CONNECTED_SOURCES | MULTI_SOURCE_READY")
    connected_source_count: int = Field(default=1)
    required_minimum_sources: int = Field(default=2)
    fusion_strategies_supported: List[str] = Field(default=["early_fusion", "feature_level_fusion", "late_fusion"])
    current_active_strategy: Optional[str] = Field(None, description="Active fusion strategy if operational")
    alignment_status: Dict[str, str] = Field(default={
        "spatial_alignment": "NOT_READY",
        "temporal_alignment": "NOT_READY",
        "radiometric_normalization": "NOT_READY",
        "channel_normalization": "NOT_READY",
        "quality_control": "NOT_READY"
    })
    pipeline_nodes: List[FusionPipelineNode]
    message: str = Field(default="Multi-source satellite architecture implemented; currently 1 satellite source connected; additional source integration pending.")
    provenance: str = Field(default="CycloneAI Multi-Source Fusion Engine")
class FeatureAttribution(BaseModel):
    feature_name: str = Field(..., description="Name of contributing feature or observable")
    feature_value: Any = Field(..., description="Observed or calculated feature magnitude")
    role: str = Field(..., description="Role in algorithm decision e.g. Threshold Trigger, Additive Component")
    mathematical_description: str = Field(..., description="Transparent mathematical or rule explanation")

class XAIExplanationResponse(BaseModel):
    capability: str = Field(..., description="identification | classification | intensity | track | temporal")
    cyclone_id: str
    frame_id: Optional[int] = None
    method_name: str
    method_type: str = Field(..., description="deterministic_heuristic | feature_attribution | kinematic_extrapolation | difference_residual")
    attributions: List[FeatureAttribution]
    decision_rules: List[str]
    mathematical_breakdown: Optional[Dict[str, float]] = None
    residual_diagnostics: Optional[Dict[str, Any]] = None
    provenance: str
    disclaimer: str = Field(default="XAI explanation reflects transparent feature attribution and decision rules. No fabricated SHAP/Grad-CAM percentages assigned.")

class CapabilityEvaluationSummary(BaseModel):
    capability: str
    primary_metric_name: str
    primary_metric_value: Optional[float] = None
    metric_unit: Optional[str] = None
    sample_count: int
    event_count: int
    validation_scope: str = Field(..., description="WITHIN_EVENT | MULTI_EVENT_BASELINE | WITHIN_EVENT_HELD_OUT | PARTIALLY_VALIDATED | INSUFFICIENT_DATA | NOT_EVALUATED")
    ground_truth_source: str
    detailed_metrics: Dict[str, Any]

class ProvenanceMetadata(BaseModel):
    dataset_name: str = Field(default="INSAT-3D Thermal IR Michaung Sequence & NOAA IBTrACS v04r01")
    satellite_platform: str = Field(default="INSAT-3D")
    sensor_instrument: str = Field(default="Imager")
    spectral_channel: str = Field(default="IR 10.8 µm (Thermal Infrared)")
    temporal_range: str = Field(default="2023-12-03 00:00 UTC - 2023-12-05 18:00 UTC")
    total_samples: int = Field(default=48)
    ground_truth_reference: str = Field(default="NOAA IBTrACS v04r01 WMO/IMD Tropical Cyclone Track & Wind Speed Data")
    validation_methodology: str = Field(default="Isolated capability benchmarks across within-event chronological split and multi-event trajectory evaluation.")
    provenance_notes: str = Field(default="Single-source satellite asset baseline verified against disk files.")

class LimitationItem(BaseModel):
    limitation_id: str
    category: str
    title: str
    description: str
    impact: str
    recommendation: str

class SystemEvaluationSummary(BaseModel):
    system_version: str = Field(default="Phase 9 — CycloneAI Unified Scientific Baseline")
    generated_at: str
    multi_source_status: str = Field(default="INSUFFICIENT_CONNECTED_SOURCES")
    connected_sources_count: int = Field(default=1)
    capabilities: Dict[str, CapabilityEvaluationSummary]
    provenance: ProvenanceMetadata
    limitations: List[LimitationItem]
    disclaimer: str = Field(default="Unified scientific evaluation aggregates isolated capability metrics. Capabilities are NOT averaged into a single accuracy score.")

class EvaluationReportJSON(BaseModel):
    system_version: str = "Phase 9 — CycloneAI Unified Scientific Baseline"
    generated_at: str
    overall_status: str = "RESEARCH_BASELINE_VERIFIED"
    multi_source_fusion_status: str = "NOT_READY"
    capabilities: Dict[str, CapabilityEvaluationSummary]
    provenance: ProvenanceMetadata
    limitations: List[LimitationItem]
    source_registry_summary: Dict[str, Any]
    disclaimer: str = "Machine-readable evaluation export report. Contains verified capability metrics and data provenance."








