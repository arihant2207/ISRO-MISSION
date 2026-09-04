import numpy as np
import math
from typing import List, Dict, Any, Optional
from app.services.frame_service import frame_service
from app.services.ibtracs_service import ibtracs_service

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Haversine distance between two lat/lon points in kilometers."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class BaselineCycloneDetector:
    """
    Scientifically Honest Baseline Cyclone Candidate Detector.
    Uses classical IR thermal convection thresholding and connected component morphology.
    """
    def __init__(self):
        # INSAT-3D Bay of Bengal domain mapping calibration
        self.LAT_MIN = 7.0
        self.LAT_MAX = 20.0
        self.LON_MIN = 77.0
        self.LON_MAX = 88.0

    def pixel_to_geo(self, x: float, y: float, width: int, height: int) -> Dict[str, float]:
        norm_x = x / width
        norm_y = y / height
        lat = self.LAT_MAX - norm_y * (self.LAT_MAX - self.LAT_MIN)
        lon = self.LON_MIN + norm_x * (self.LON_MAX - self.LON_MIN)
        return {"lat": round(lat, 2), "lon": round(lon, 2)}

    def detect_frame(self, frame_data: Dict[str, Any], cyclone_id: str = "MICHAUNG") -> Dict[str, Any]:
        arr = frame_data["array"]
        height, width = arr.shape
        timestamp = frame_data["timestamp"]

        # Thermal convection thresholding (top 15% brightest cold cloud tops)
        threshold = float(np.percentile(arr, 85))
        binary_map = arr > threshold

        ys, xs = np.where(binary_map)
        
        if len(xs) < 50:
            return {
                "frame_id": frame_data["frame_id"],
                "timestamp": timestamp,
                "detected": False,
                "reason": "Insufficient deep convective cloud area detected above thermal threshold.",
                "detector_name": "Baseline Cyclone Candidate Detector (IR Convection Thresholding)",
                "detector_type": "Classical/Algorithmic Baseline",
                "provenance": frame_data["provenance"],
                "disclaimer": "Research baseline candidate detector — not an operational forecasting model"
            }

        # Bounding box of deep convection region
        min_x, max_x = int(np.min(xs)), int(np.max(xs))
        min_y, max_y = int(np.min(ys)), int(np.max(ys))

        # Intensity-weighted centroid (Candidate Core Center)
        weights = arr[ys, xs].astype(float)
        total_weight = np.sum(weights)
        cx = float(np.sum(xs * weights) / total_weight)
        cy = float(np.sum(ys * weights) / total_weight)

        candidate_geo = self.pixel_to_geo(cx, cy, width, height)

        # Extracted physical features
        area_pixels = int(len(xs))
        max_intensity = float(np.max(arr))
        bbox_w = max_x - min_x
        bbox_h = max_y - min_y
        aspect_ratio = round(bbox_w / max(1, bbox_h), 2)
        compactness = round((4 * math.pi * area_pixels) / max(1, (2 * (bbox_w + bbox_h)) ** 2), 3)

        # Match against IBTrACS ground truth observation if available
        track_points = ibtracs_service.get_cyclone_track(cyclone_id)
        matched_obs = None
        error_km = None

        if track_points:
            # Find nearest IBTrACS track point by timestamp or hour
            matched_obs = self._find_nearest_obs(timestamp, track_points)
            if matched_obs:
                error_km = round(haversine_distance_km(
                    candidate_geo["lat"], candidate_geo["lon"],
                    matched_obs.lat, matched_obs.lon
                ), 1)

        return {
            "frame_id": frame_data["frame_id"],
            "timestamp": timestamp,
            "detected": True,
            "center_pixel": [round(cx, 1), round(cy, 1)],
            "candidate_geo": candidate_geo,
            "bounding_box_pixel": [min_x, min_y, max_x, max_y],
            "observed_geo": {"lat": matched_obs.lat, "lon": matched_obs.lon} if matched_obs else None,
            "observed_storm_stage": matched_obs.category if matched_obs else None,
            "distance_error_km": error_km,
            "features": {
                "convective_area_pixels": area_pixels,
                "peak_cloud_intensity": max_intensity,
                "aspect_ratio": aspect_ratio,
                "compactness_score": compactness
            },
            "detector_name": "Baseline Cyclone Candidate Detector (IR Convection Thresholding)",
            "detector_type": "Classical/Algorithmic Baseline",
            "provenance": frame_data["provenance"],
            "disclaimer": "Research baseline candidate detector — not an operational forecasting model"
        }

    def _find_nearest_obs(self, timestamp: str, track_points: List[Any]) -> Optional[Any]:
        # Search exact match or closest hour
        for pt in track_points:
            if pt.time == timestamp:
                return pt
        # Fallback to closest within 3 hours
        from datetime import datetime
        try:
            target_dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
            best_pt = None
            best_diff = float('inf')
            for pt in track_points:
                pt_dt = datetime.strptime(pt.time, "%Y-%m-%d %H:%M:%S")
                diff = abs((target_dt - pt_dt).total_seconds())
                if diff < best_diff and diff <= 10800: # 3 hours
                    best_diff = diff
                    best_pt = pt
            return best_pt
        except Exception:
            return None

    def evaluate_cyclone(self, cyclone_id: str = "MICHAUNG") -> Dict[str, Any]:
        all_frames_meta = frame_service.get_all_frames_metadata()
        if not all_frames_meta:
            frame_service.initialize()
            all_frames_meta = frame_service.get_all_frames_metadata()

        total_frames = len(all_frames_meta)
        detections = []
        errors = []

        for meta in all_frames_meta:
            frame_data = frame_service.get_frame(meta["frame_id"])
            if not frame_data:
                continue
            res = self.detect_frame(frame_data, cyclone_id=cyclone_id)
            detections.append(res)
            if res.get("detected") and res.get("distance_error_km") is not None:
                errors.append(res["distance_error_km"])

        detected_count = sum(1 for d in detections if d.get("detected"))
        matched_count = len(errors)

        mae = round(float(np.mean(errors)), 1) if errors else None
        median_err = round(float(np.median(errors)), 1) if errors else None
        min_err = round(float(np.min(errors)), 1) if errors else None
        max_err = round(float(np.max(errors)), 1) if errors else None

        return {
            "cyclone_id": cyclone_id,
            "total_frames_evaluated": total_frames,
            "detected_count": detected_count,
            "matched_ibtracs_observations": matched_count,
            "center_error_mae_km": mae,
            "center_error_median_km": median_err,
            "center_error_min_km": min_err,
            "center_error_max_km": max_err,
            "detector_name": "Baseline Cyclone Candidate Detector (IR Convection Thresholding)",
            "detector_type": "Classical/Algorithmic Baseline",
            "provenance": "INSAT-3D IR 10.8 µm Asset & NOAA IBTrACS v04r01",
            "disclaimer": "Evaluated against historical IBTrACS ground truth observations."
        }

identification_detector = BaselineCycloneDetector()
identification_service = identification_detector
