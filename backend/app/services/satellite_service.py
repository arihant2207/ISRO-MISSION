from pathlib import Path
from typing import List, Dict, Optional, Any
from abc import ABC, abstractmethod
from app.config import settings
from app.schemas.cyclone import (
    SatelliteSource,
    SatelliteAssetStatus,
    SatelliteFrameMeta,
    SourceComparisonResponse,
    FusionPipelineNode,
    FusionStatusResponse
)
from app.services.frame_service import frame_service

class SatelliteDataProvider(ABC):
    """
    Abstract Generic Interface for Satellite Data Providers.
    All connected or future satellite connectors implement this interface.
    """

    @abstractmethod
    def list_sources(self) -> List[SatelliteSource]:
        pass

    @abstractmethod
    def get_metadata(self, source_id: str) -> Optional[SatelliteSource]:
        pass

    @abstractmethod
    def get_frames(self, source_id: str) -> List[SatelliteFrameMeta]:
        pass

    @abstractmethod
    def get_frame(self, source_id: str, frame_id: int) -> Optional[SatelliteFrameMeta]:
        pass

    @abstractmethod
    def get_available_channels(self, source_id: str) -> List[str]:
        pass


class SatelliteSourceRegistry:
    """
    Registry of multi-source satellite assets and platform metadata.
    Only sources backed by genuine local assets or verified connectors return status 'CONNECTED'.
    """

    def __init__(self, asset_path: Path = settings.SATELLITE_ASSET_PATH):
        self.asset_path = asset_path
        self._sources: Dict[str, SatelliteSource] = {}
        self._register_default_sources()

    def _register_default_sources(self):
        insat3d_exists = self.asset_path.exists()
        if insat3d_exists and frame_service._frames_cache is None:
            frame_service.initialize()

        frames_count = len(frame_service.get_all_frames()) if insat3d_exists else 0

        # Source 1: INSAT-3D Imager Thermal IR (CONNECTED if file exists)
        insat3d = SatelliteSource(
            source_id="INSAT3D_IR",
            platform="INSAT-3D",
            instrument="Imager",
            product="Thermal Infrared 10.8 µm",
            channel="IR 10.8 µm",
            channel_category="TIR",
            status="CONNECTED" if insat3d_exists else "UNAVAILABLE",
            asset_path="/IR_Michaung.gif" if insat3d_exists else None,
            temporal_coverage="2023-12-03 00:00 UTC - 2023-12-04 00:00 UTC",
            spatial_coverage="North Indian Ocean / Bay of Bengal (8.0°N-22.0°N, 78.0°E-92.0°E)",
            spatial_resolution_km=4.0,
            temporal_resolution_min=30,
            frame_count=frames_count,
            provenance="ISRO / MOSDAC Historical Observation Stream (Dec 2023)",
            disclaimer="Verified local INSAT-3D thermal IR observation frames."
        )

        # Source 2: INSAT-3DR Sounder / Imager (CONFIGURED - integration ready, dataset pending)
        insat3dr = SatelliteSource(
            source_id="INSAT3DR_TIR",
            platform="INSAT-3DR",
            instrument="Sounder / Imager",
            product="Water Vapour 6.8 µm",
            channel="WV 6.8 µm",
            channel_category="WATER_VAPOUR",
            status="CONFIGURED",
            asset_path=None,
            temporal_coverage="Integration ready — dataset not connected",
            spatial_coverage="North Indian Ocean / Geostationary (74.0°E)",
            spatial_resolution_km=4.0,
            temporal_resolution_min=30,
            frame_count=0,
            provenance="ISRO / MOSDAC Data Format Specification",
            disclaimer="Platform schema configured. Local dataset asset file not present."
        )

        # Source 3: EOS-06 Scatterometer (NOT_CONNECTED)
        eos06 = SatelliteSource(
            source_id="EOS06_SCAT",
            platform="EOS-06 (Oceansat-3)",
            instrument="Scatterometer (Oceansat-3)",
            product="Ocean Surface Wind Vector",
            channel="Ku-Band Scatterometer",
            channel_category="OCEAN_WIND",
            status="NOT_CONNECTED",
            asset_path=None,
            temporal_coverage="Integration ready — dataset not connected",
            spatial_coverage="Global Ocean / Polar Orbiting",
            spatial_resolution_km=12.5,
            temporal_resolution_min=720,
            frame_count=0,
            provenance="ISRO / NRSC Scatterometer Data Standard",
            disclaimer="Scatterometer wind vector interface ready. Dataset file missing."
        )

        # Source 4: Himawari-9 (UNAVAILABLE)
        himawari9 = SatelliteSource(
            source_id="HIMAWARI9_AHI",
            platform="Himawari-9",
            instrument="Advanced Himawari Imager (AHI)",
            product="Clean IR 10.4 µm",
            channel="Band 13 (10.4 µm)",
            channel_category="TIR",
            status="UNAVAILABLE",
            asset_path=None,
            temporal_coverage="External satellite — not in local scope",
            spatial_coverage="Western Pacific / East Asia",
            spatial_resolution_km=2.0,
            temporal_resolution_min=10,
            frame_count=0,
            provenance="JMA (Japan Meteorological Agency)",
            disclaimer="External satellite source. No local data stream active."
        )

        # Source 5: GOES-19 (UNAVAILABLE)
        goes19 = SatelliteSource(
            source_id="GOES19_ABI",
            platform="GOES-19",
            instrument="Advanced Baseline Imager (ABI)",
            product="Clean Longwave Window IR 10.3 µm",
            channel="Band 13 (10.3 µm)",
            channel_category="TIR",
            status="UNAVAILABLE",
            asset_path=None,
            temporal_coverage="External satellite — not in local scope",
            spatial_coverage="Atlantic / East Pacific",
            spatial_resolution_km=2.0,
            temporal_resolution_min=10,
            frame_count=0,
            provenance="NOAA / NESDIS",
            disclaimer="External satellite source. No local data stream active."
        )

        for src in [insat3d, insat3dr, eos06, himawari9, goes19]:
            self._sources[src.source_id] = src

    def _refresh_frame_counts(self):
        if "INSAT3D_IR" in self._sources:
            if frame_service._frames_cache is None and self.asset_path.exists():
                frame_service.initialize()
            self._sources["INSAT3D_IR"].frame_count = len(frame_service.get_all_frames())

    def get_all_sources(self) -> List[SatelliteSource]:
        self._refresh_frame_counts()
        return list(self._sources.values())

    def get_source(self, source_id: str) -> Optional[SatelliteSource]:
        self._refresh_frame_counts()
        return self._sources.get(source_id)

    def register_source(self, source: SatelliteSource):
        self._sources[source.source_id] = source



class ConcreteSatelliteDataProvider(SatelliteDataProvider):
    """
    Concrete implementation of SatelliteDataProvider accessing local satellite registry & frames.
    """

    def __init__(self, registry: SatelliteSourceRegistry):
        self.registry = registry

    def list_sources(self) -> List[SatelliteSource]:
        return self.registry.get_all_sources()

    def get_metadata(self, source_id: str) -> Optional[SatelliteSource]:
        return self.registry.get_source(source_id)

    def get_frames(self, source_id: str) -> List[SatelliteFrameMeta]:
        src = self.registry.get_source(source_id)
        if not src or src.status != "CONNECTED":
            return []
        
        # Currently INSAT3D_IR is connected
        if source_id == "INSAT3D_IR":
            all_raw_frames = frame_service.get_all_frames()
            meta_frames = []
            for f in all_raw_frames:
                meta_frames.append(SatelliteFrameMeta(
                    frame_id=f["frame_id"],
                    source_id="INSAT3D_IR",
                    platform="INSAT-3D",
                    instrument="Imager",
                    channel="IR 10.8 µm",
                    channel_category="TIR",
                    timestamp=f["timestamp"],
                    asset_url=f"/IR_Michaung.gif",
                    provenance="ISRO / MOSDAC Thermal IR Observation"
                ))
            return meta_frames
        return []

    def get_frame(self, source_id: str, frame_id: int) -> Optional[SatelliteFrameMeta]:
        frames = self.get_frames(source_id)
        for f in frames:
            if f.frame_id == frame_id:
                return f
        return None

    def get_available_channels(self, source_id: str) -> List[str]:
        src = self.registry.get_source(source_id)
        if not src:
            return []
        return [src.channel] if src.status == "CONNECTED" else []


class SatelliteFusionService:
    """
    Defines architecture and readiness status for multi-source satellite fusion.
    Enforces scientific integrity: no synthetic fusion results are output if only 1 source is connected.
    """

    def __init__(self, provider: SatelliteDataProvider, registry: SatelliteSourceRegistry):
        self.provider = provider
        self.registry = registry

    def get_comparison(self) -> SourceComparisonResponse:
        all_srcs = self.registry.get_all_sources()
        connected = [s for s in all_srcs if s.status == "CONNECTED"]
        configured = [s for s in all_srcs if s.status == "CONFIGURED"]
        not_connected = [s for s in all_srcs if s.status == "NOT_CONNECTED"]
        unavailable = [s for s in all_srcs if s.status == "UNAVAILABLE"]

        # Calculate overlapping time periods and common channels among CONNECTED sources only
        overlapping = []
        common_ch = []
        if len(connected) >= 2:
            overlapping = [{"period": "2023-12-03 00:00 UTC - 2023-12-04 00:00 UTC", "sources": ",".join([s.source_id for s in connected])}]
            # Overlap channels
            ch_sets = [set(self.provider.get_available_channels(s.source_id)) for s in connected]
            common_ch = list(set.intersection(*ch_sets)) if ch_sets else []

        multi_status = "MULTI_SOURCE_AVAILABLE" if len(connected) >= 2 else "INSUFFICIENT_CONNECTED_SOURCES"

        return SourceComparisonResponse(
            total_sources=len(all_srcs),
            connected_count=len(connected),
            configured_count=len(configured),
            not_connected_count=len(not_connected),
            unavailable_count=len(unavailable),
            sources=all_srcs,
            overlapping_time_periods=overlapping,
            common_channels=common_ch,
            multi_source_status=multi_status,
            message="Additional satellite source required for operational multi-source fusion." if len(connected) < 2 else "Multi-source satellite data streams available.",
            provenance="CycloneAI Multi-Source Registry Audit",
            disclaimer="Research multi-source baseline — only verified local assets are CONNECTED."
        )

    def get_fusion_status(self) -> FusionStatusResponse:
        all_srcs = self.registry.get_all_sources()
        connected = [s for s in all_srcs if s.status == "CONNECTED"]
        conn_count = len(connected)

        nodes = [
            FusionPipelineNode(
                node_id="SRC_INSAT3D",
                node_name="INSAT-3D Imager (TIR 10.8 µm)",
                node_type="source",
                status="CONNECTED" if conn_count >= 1 else "NOT_CONNECTED",
                description="Verified local INSAT-3D thermal IR observation frames."
            ),
            FusionPipelineNode(
                node_id="SRC_INSAT3DR",
                node_name="INSAT-3DR Imager/Sounder (WV 6.8 µm)",
                node_type="source",
                status="CONFIGURED",
                description="Schema ready. Awaiting local dataset asset connection."
            ),
            FusionPipelineNode(
                node_id="SRC_EOS06",
                node_name="EOS-06 Scatterometer (Ocean Wind)",
                node_type="source",
                status="NOT_CONNECTED",
                description="Wind vector schema ready. Awaiting scatterometer asset connection."
            ),
            FusionPipelineNode(
                node_id="ALIGN_TEMPORAL",
                node_name="Temporal Synchronization Engine",
                node_type="alignment",
                status="NOT_READY",
                description="Aligns observation timestamps across non-synchronous satellite orbits."
            ),
            FusionPipelineNode(
                node_id="ALIGN_SPATIAL",
                node_name="Spatial Resampling & Regrid Engine",
                node_type="alignment",
                status="NOT_READY",
                description="Projects sensor grids onto common lat/lon geographic coordinate grid."
            ),
            FusionPipelineNode(
                node_id="NORM_RADIOMETRIC",
                node_name="Radiometric & Channel Normalizer",
                node_type="alignment",
                status="NOT_READY",
                description="Normalizes brightness temperatures & scatterometer winds across sensors."
            ),
            FusionPipelineNode(
                node_id="FUSION_CORE",
                node_name="Multi-Source Feature Fusion Engine",
                node_type="fusion",
                status="NOT_READY",
                description="Early/Feature/Late fusion architecture for combined multi-sensor representations."
            ),
            FusionPipelineNode(
                node_id="DOWNSTREAM_INFERENCE",
                node_name="Downstream Cyclone ML Models",
                node_type="downstream",
                status="READY",
                description="Identification, Classification, Intensity, Track, and Landfall models (currently running on INSAT-3D single-source baseline)."
            )
        ]

        fusion_ready = conn_count >= 2

        return FusionStatusResponse(
            fusion_status="OPERATIONAL" if fusion_ready else "NOT_READY",
            multi_source_status="MULTI_SOURCE_READY" if fusion_ready else "INSUFFICIENT_CONNECTED_SOURCES",
            connected_source_count=conn_count,
            required_minimum_sources=2,
            fusion_strategies_supported=["early_fusion", "feature_level_fusion", "late_fusion"],
            current_active_strategy=None,
            alignment_status={
                "spatial_alignment": "READY" if fusion_ready else "NOT_READY",
                "temporal_alignment": "READY" if fusion_ready else "NOT_READY",
                "radiometric_normalization": "READY" if fusion_ready else "NOT_READY",
                "channel_normalization": "READY" if fusion_ready else "NOT_READY",
                "quality_control": "READY" if fusion_ready else "NOT_READY"
            },
            pipeline_nodes=nodes,
            message="Multi-source satellite architecture implemented; currently 1 satellite source connected; additional source integration pending.",
            provenance="CycloneAI Multi-Source Fusion Engine",
            disclaimer="Architecture ready for multi-source ingestion. No synthetic fusion outputs generated."
        )


# Instantiate singletons for dependency injection
satellite_registry = SatelliteSourceRegistry()
data_provider = ConcreteSatelliteDataProvider(satellite_registry)
satellite_fusion_service = SatelliteFusionService(data_provider, satellite_registry)

# Legacy Service Wrapper for backward compatibility
class LegacySatelliteService:
    def __init__(self, registry: SatelliteSourceRegistry = satellite_registry):
        self.registry = registry

    def get_insat3d_michaung_status(self) -> SatelliteAssetStatus:
        src = self.registry.get_source("INSAT3D_IR")
        exists = src.status == "CONNECTED" if src else False
        return SatelliteAssetStatus(
            satellite="INSAT-3D",
            event="Cyclone Michaung",
            channel="IR 10.8 µm",
            observation_type="historical",
            asset_status="available" if exists else "unavailable",
            asset_path="/IR_Michaung.gif",
            frame_count=src.frame_count if src else 0,
            provenance="ISRO / MOSDAC Historical Observation Stream (Dec 2023)"
        )

satellite_service = LegacySatelliteService()
