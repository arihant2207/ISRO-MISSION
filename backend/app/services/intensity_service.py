import numpy as np
import math
from typing import List, Dict, Any, Optional
from app.services.frame_service import frame_service
from app.services.ibtracs_service import ibtracs_service
from app.services.identification_service import identification_detector

class BaselineIntensityEstimator:
    """
    Scientifically Honest Baseline Satellite Intensity Estimator.
    Estimates tropical cyclone maximum sustained wind speed (in knots and km/h) 
    using ONLY satellite thermal IR morphological & convective features.
    
    STRICT RULE: IBTrACS ground-truth wind, pressure, and category values are 
    NEVER used as input features to the estimator. They are used ONLY for validation comparison.
    """
    
    def estimate_frame_intensity(
        self, 
        frame_data: Dict[str, Any], 
        cyclone_id: str = "MICHAUNG",
        prev_estimated_wind_kmh: Optional[float] = None
    ) -> Dict[str, Any]:
        
        timestamp = frame_data["timestamp"]
        frame_id = frame_data["frame_id"]

        # Step 1: Detect cyclone candidate and extract satellite IR features
        det = identification_detector.detect_frame(frame_data, cyclone_id=cyclone_id)
        
        if not det.get("detected") or not det.get("features"):
            return {
                "cyclone_id": cyclone_id,
                "frame_id": frame_id,
                "timestamp": timestamp,
                "estimated_wind_kt": None,
                "estimated_wind_kmh": None,
                "estimated_wind_unit": "km/h",
                "ground_truth_wind_kt": None,
                "ground_truth_wind_kmh": None,
                "ground_truth_unit": "km/h",
                "ground_truth_source": "NOAA IBTrACS v04r01 (USA_WIND)",
                "ground_truth_status": "unavailable",
                "timestamp_offset_minutes": None,
                "error_kmh": None,
                "trend": "insufficient_evidence",
                "input_features": {
                    "convective_area_pixels": 0,
                    "peak_cloud_intensity": 0.0,
                    "compactness_score": 0.0,
                    "thermal_vigor_index": 0.0
                },
                "method": "Baseline Satellite Morphological Intensity Model (Physical IR Heuristic)",
                "confidence": None,
                "validation_status": "Single-event calibrated research baseline — not validated for operational use.",
                "provenance": frame_data["provenance"],
                "disclaimer": "Research baseline intensity estimator — not an operational intensity forecast."
            }

        feats = det["features"]
        area = feats["convective_area_pixels"]
        peak = feats["peak_cloud_intensity"]
        compactness = feats["compactness_score"]
        aspect = feats["aspect_ratio"]
        min_gray = feats.get("min_thermal_intensity", 0)
        
        # Satellite-derived thermal vigor index: peak_intensity * sqrt(area)
        thermal_vigor = round(peak * math.sqrt(area), 1)

        # Step 2: Calculate satellite-derived wind estimation (Physical IR Heuristic)
        # Base tropical disturbance wind = 15.0 kt
        # Convective vigor contribution = thermal_vigor * 0.00105
        # Core organization/compactness contribution = compactness * 14.0
        if area < 1000:
            estimated_wind_kt = None
            estimated_wind_kmh = None
            status_note = "insufficient_evidence"
        else:
            raw_wind_kt = 15.0 + (thermal_vigor * 0.00105) + (compactness * 14.0)
            # Cap at realistic physical limits for baseline (20 kt to 140 kt)
            raw_wind_kt = max(20.0, min(140.0, raw_wind_kt))
            estimated_wind_kt = round(raw_wind_kt, 1)
            estimated_wind_kmh = round(estimated_wind_kt * 1.852, 1)
            status_note = "valid"

        # Step 3: Compute Intensity Trend relative to previous frame
        trend = "insufficient_evidence"
        if status_note == "valid" and estimated_wind_kmh is not None and prev_estimated_wind_kmh is not None:
            delta_wind = estimated_wind_kmh - prev_estimated_wind_kmh
            if delta_wind >= 3.0:
                trend = "strengthening"
            elif delta_wind <= -3.0:
                trend = "weakening"
            else:
                trend = "stable"
        elif status_note == "valid":
            trend = "stable" # Initial reference frame default

        # Step 4: Temporal Ground-Truth Alignment with IBTrACS (For validation only!)
        nearest_tp = ibtracs_service.get_nearest_track_point(cyclone_id, timestamp)
        
        gt_wind_kt = None
        gt_wind_kmh = None
        gt_status = "unavailable"
        ts_offset_min = None
        error_kmh = None

        if nearest_tp:
            import datetime
            try:
                t_frame = datetime.datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
                t_gt = datetime.datetime.fromisoformat(nearest_tp.time.replace("Z", "+00:00"))
                ts_offset_min = round(abs((t_frame - t_gt).total_seconds()) / 60.0, 1)
                
                # Accept ground truth match if within 6 hours (360 mins)
                if ts_offset_min <= 360.0:
                    gt_wind_kt = nearest_tp.wind_kt
                    gt_wind_kmh = nearest_tp.wind_kmh
                    gt_status = "matched"
                    if estimated_wind_kmh is not None and gt_wind_kmh is not None:
                        error_kmh = round(abs(estimated_wind_kmh - gt_wind_kmh), 1)
            except Exception:
                gt_status = "unavailable"

        return {
            "cyclone_id": cyclone_id,
            "frame_id": frame_id,
            "timestamp": timestamp,
            "estimated_wind_kt": estimated_wind_kt,
            "estimated_wind_kmh": estimated_wind_kmh,
            "estimated_wind_unit": "km/h",
            "ground_truth_wind_kt": gt_wind_kt,
            "ground_truth_wind_kmh": gt_wind_kmh,
            "ground_truth_unit": "km/h",
            "ground_truth_source": "NOAA IBTrACS v04r01 (USA_WIND)",
            "ground_truth_status": gt_status,
            "timestamp_offset_minutes": ts_offset_min,
            "error_kmh": error_kmh,
            "trend": trend,
            "input_features": {
                "convective_area_pixels": area,
                "peak_cloud_intensity": peak,
                "compactness_score": compactness,
                "aspect_ratio": aspect,
                "thermal_vigor_index": thermal_vigor,
                "min_thermal_intensity": min_gray
            },
            "method": "Baseline Satellite Morphological Intensity Model (Physical IR Heuristic)",
            "confidence": None, # Strictly no fake confidence
            "validation_status": "Single-event calibrated research baseline — not validated for operational use.",
            "provenance": frame_data["provenance"],
            "disclaimer": "Research baseline intensity estimator — not an operational intensity forecast."
        }

    def evaluate_cyclone(self, cyclone_id: str = "MICHAUNG") -> Dict[str, Any]:
        all_frames_meta = frame_service.get_all_frames_metadata()
        if not all_frames_meta:
            frame_service.initialize()
            all_frames_meta = frame_service.get_all_frames_metadata()

        total_frames = len(all_frames_meta)
        
        errors = []
        signed_errors = []
        prev_wind = None
        matched_count = 0

        for meta in all_frames_meta:
            frame_data = frame_service.get_frame(meta["frame_id"])
            if not frame_data:
                continue
            est = self.estimate_frame_intensity(
                frame_data, 
                cyclone_id=cyclone_id, 
                prev_estimated_wind_kmh=prev_wind
            )
            
            if est["estimated_wind_kmh"] is not None:
                prev_wind = est["estimated_wind_kmh"]
            
            if est["ground_truth_status"] == "matched" and est["error_kmh"] is not None:
                matched_count += 1
                errors.append(est["error_kmh"])
                signed_err = est["estimated_wind_kmh"] - est["ground_truth_wind_kmh"]
                signed_errors.append(signed_err)

        if not errors:
            return {
                "cyclone_id": cyclone_id,
                "total_frames_evaluated": total_frames,
                "matched_frames": 0,
                "mae_kmh": None,
                "rmse_kmh": None,
                "mean_bias_kmh": None,
                "median_abs_error_kmh": None,
                "min_error_kmh": None,
                "max_error_kmh": None,
                "r2_score": None,
                "method": "Baseline Satellite Morphological Intensity Model (Physical IR Heuristic)",
                "ground_truth_source": "NOAA IBTrACS v04r01 (USA_WIND)",
                "validation_status": "insufficient_validation_data",
                "disclaimer": "No matched ground truth observations found for intensity evaluation."
            }

        mae_kmh = round(float(np.mean(errors)), 2)
        rmse_kmh = round(float(np.sqrt(np.mean(np.square(errors)))), 2)
        mean_bias_kmh = round(float(np.mean(signed_errors)), 2)
        median_abs_error_kmh = round(float(np.median(errors)), 2)
        min_error_kmh = round(float(np.min(errors)), 2)
        max_error_kmh = round(float(np.max(errors)), 2)

        return {
            "cyclone_id": cyclone_id,
            "total_frames_evaluated": total_frames,
            "matched_frames": matched_count,
            "mae_kmh": mae_kmh,
            "rmse_kmh": rmse_kmh,
            "mean_bias_kmh": mean_bias_kmh,
            "median_abs_error_kmh": median_abs_error_kmh,
            "min_error_kmh": min_error_kmh,
            "max_error_kmh": max_error_kmh,
            "r2_score": None, # Not reported to avoid misleading interpretation on single-event evaluation
            "method": "Baseline Satellite Morphological Intensity Model (Physical IR Heuristic)",
            "ground_truth_source": "NOAA IBTrACS v04r01 (USA_WIND)",
            "validation_status": "Single-event calibrated research baseline — within-event fit, not validated for operational use.",
            "disclaimer": "Evaluated against historical IBTrACS ground truth observations. No ground truth wind data was used as input to the intensity model."
        }

intensity_estimator = BaselineIntensityEstimator()
intensity_service = intensity_estimator

