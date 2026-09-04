import math
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.services.ibtracs_service import ibtracs_service
from app.schemas.cyclone import TrackPoint

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Great-Circle Haversine distance in kilometers."""
    R = 6371.0 # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_initial_bearing_deg(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate initial forward bearing/heading in degrees [0, 360)."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dlambda = math.radians(lon2 - lon1)

    y = math.sin(dlambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(dlambda)
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360.0) % 360.0

def extrapolate_destination(lat: float, lon: float, distance_km: float, bearing_deg: float) -> Dict[str, float]:
    """Extrapolate destination (lat, lon) given starting point, distance (km), and bearing (degrees)."""
    R = 6371.0
    d_r = distance_km / R
    theta = math.radians(bearing_deg)
    phi1 = math.radians(lat)
    lambda1 = math.radians(lon)

    phi2 = math.asin(math.sin(phi1) * math.cos(d_r) + math.cos(phi1) * math.sin(d_r) * math.cos(theta))
    lambda2 = lambda1 + math.atan2(
        math.sin(theta) * math.sin(d_r) * math.cos(phi1),
        math.cos(d_r) - math.sin(phi1) * math.sin(phi2)
    )

    return {
        "lat": round(math.degrees(phi2), 2),
        "lon": round(math.degrees(lambda2), 2)
    }

class BaselineTrackPredictor:
    """
    Scientifically Honest Baseline Cyclone Track Predictor.
    Uses physics-based spherical trajectory extrapolation (translational speed vector + bearing).
    
    STRICT ZERO-LEAKAGE RULE:
    Only observations AT OR BEFORE forecast origin T are used as model inputs.
    Future observations (after T) are NEVER accessed during forecast generation.
    """
    
    def generate_forecast(
        self, 
        cyclone_id: str = "MICHAUNG", 
        origin_timestamp: Optional[str] = None
    ) -> Dict[str, Any]:
        
        all_tracks = ibtracs_service.get_cyclone_track(cyclone_id)
        if not all_tracks:
            return {
                "cyclone_id": cyclone_id,
                "status": "unavailable",
                "reason": f"No track data found for cyclone '{cyclone_id}'."
            }

        # Sort tracks chronologically
        sorted_tracks = sorted(all_tracks, key=lambda p: p.time)
        
        # Determine forecast origin point
        origin_pt: Optional[TrackPoint] = None
        if origin_timestamp:
            for pt in sorted_tracks:
                if pt.time == origin_timestamp:
                    origin_pt = pt
                    break
            if not origin_pt:
                # Find closest track point at or before requested timestamp
                for pt in reversed(sorted_tracks):
                    if pt.time <= origin_timestamp:
                        origin_pt = pt
                        break
        
        if not origin_pt:
            # Default to 3rd from last or middle observation to allow evaluating future points
            if len(sorted_tracks) >= 8:
                origin_pt = sorted_tracks[-6]
            else:
                origin_pt = sorted_tracks[-1]

        origin_time_str = origin_pt.time
        
        # Filter STRICTLY observations at or before origin_time (Zero Leakage!)
        historical_obs = [pt for pt in sorted_tracks if pt.time <= origin_time_str]
        
        if len(historical_obs) < 2:
            return {
                "cyclone_id": cyclone_id,
                "status": "insufficient_history",
                "origin_timestamp": origin_time_str,
                "reason": "Insufficient historical trajectory points prior to origin time for motion estimation."
            }

        # Estimate recent translational velocity & bearing from last 2-3 historical points
        last_pt = historical_obs[-1]
        prev_pt = historical_obs[-2]
        
        try:
            dt_last = datetime.strptime(last_pt.time.replace("Z", "").split(".")[0], "%Y-%m-%d %H:%M:%S")
            dt_prev = datetime.strptime(prev_pt.time.replace("Z", "").split(".")[0], "%Y-%m-%d %H:%M:%S")
            delta_hours = max(0.5, (dt_last - dt_prev).total_seconds() / 3600.0)
        except Exception:
            delta_hours = 6.0

        dist_step_km = haversine_distance_km(prev_pt.lat, prev_pt.lon, last_pt.lat, last_pt.lon)
        speed_kmh = dist_step_km / delta_hours
        # Cap speed to realistic tropical cyclone translation (5 to 60 km/h)
        speed_kmh = max(5.0, min(60.0, speed_kmh))

        bearing_deg = calculate_initial_bearing_deg(prev_pt.lat, prev_pt.lon, last_pt.lat, last_pt.lon)

        # Generate forecasts for requested horizons: 6, 12, 24, 48, 72 hours
        horizons_hours = [6, 12, 24, 48, 72]
        forecast_points = []

        for h in horizons_hours:
            f_dist_km = speed_kmh * h
            dest = extrapolate_destination(last_pt.lat, last_pt.lon, f_dist_km, bearing_deg)
            
            f_dt = dt_last + timedelta(hours=h)
            f_time_str = f_dt.strftime("%Y-%m-%d %H:%M:%S")

            # Check if matching ground truth exists ONLY for evaluation display
            gt_pt = None
            gt_error_km = None
            for pt in sorted_tracks:
                if pt.time > origin_time_str:
                    try:
                        p_dt = datetime.strptime(pt.time.replace("Z", "").split(".")[0], "%Y-%m-%d %H:%M:%S")
                        if abs((p_dt - f_dt).total_seconds()) <= 10800: # 3-hour match window
                            gt_pt = pt
                            gt_error_km = round(haversine_distance_km(dest["lat"], dest["lon"], pt.lat, pt.lon), 1)
                            break
                    except Exception:
                        pass

            forecast_points.append({
                "horizon_hours": h,
                "forecast_timestamp": f_time_str,
                "latitude": dest["lat"],
                "longitude": dest["lon"],
                "ground_truth_latitude": gt_pt.lat if gt_pt else None,
                "ground_truth_longitude": gt_pt.lon if gt_pt else None,
                "error_km": gt_error_km,
                "method": "Persistence & Spherical Translation Vector Extrapolation Baseline",
                "provenance": "Calculated from historical IBTrACS trajectory prior to origin"
            })

        return {
            "cyclone_id": cyclone_id,
            "status": "valid",
            "forecast_origin_timestamp": origin_time_str,
            "origin_latitude": last_pt.lat,
            "origin_longitude": last_pt.lon,
            "estimated_speed_kmh": round(speed_kmh, 1),
            "estimated_heading_deg": round(bearing_deg, 1),
            "input_window_points": len(historical_obs),
            "forecast_points": forecast_points,
            "uncertainty_status": "unavailable",
            "uncertainty_disclaimer": "Uncertainty cone unavailable — insufficient independent validation data.",
            "method": "Persistence & Spherical Translation Vector Extrapolation Baseline",
            "provenance": "NOAA IBTrACS v04r01 Trajectory Stream",
            "disclaimer": "Research baseline track predictor — not an operational forecast."
        }

    def evaluate_cyclone_track(self, cyclone_id: str = "MICHAUNG") -> Dict[str, Any]:
        all_tracks = ibtracs_service.get_cyclone_track(cyclone_id)
        if not all_tracks or len(all_tracks) < 6:
            return {
                "cyclone_id": cyclone_id,
                "status": "insufficient_data",
                "reason": "Insufficient track points for evaluation."
            }

        sorted_tracks = sorted(all_tracks, key=lambda p: p.time)
        
        # Evaluate multiple forecast origin points across the cyclone track
        horizon_errors: Dict[int, List[float]] = {6: [], 12: [], 24: [], 48: [], 72: []}
        origin_count = 0

        for i in range(2, len(sorted_tracks) - 1):
            origin_pt = sorted_tracks[i]
            fc = self.generate_forecast(cyclone_id=cyclone_id, origin_timestamp=origin_pt.time)
            if fc.get("status") == "valid" and fc.get("forecast_points"):
                origin_count += 1
                for fp in fc["forecast_points"]:
                    h = fp["horizon_hours"]
                    err = fp.get("error_km")
                    if err is not None:
                        horizon_errors[h].append(err)

        horizon_metrics = {}
        for h, errs in horizon_errors.items():
            if errs:
                horizon_metrics[f"{h}h"] = {
                    "forecast_count": len(errs),
                    "mae_km": round(float(np.mean(errs)), 1),
                    "median_km": round(float(np.median(errs)), 1),
                    "min_km": round(float(np.min(errs)), 1),
                    "max_km": round(float(np.max(errs)), 1)
                }
            else:
                horizon_metrics[f"{h}h"] = {
                    "forecast_count": 0,
                    "mae_km": None,
                    "median_km": None,
                    "min_km": None,
                    "max_km": None
                }

        return {
            "cyclone_id": cyclone_id,
            "evaluated_origins_count": origin_count,
            "evaluated_cyclone_events": 1,
            "validation_status": "Single-event track baseline.",
            "horizon_metrics": horizon_metrics,
            "uncertainty_status": "unavailable",
            "uncertainty_disclaimer": "Uncertainty cone unavailable — insufficient independent validation data.",
            "method": "Persistence & Spherical Translation Vector Extrapolation Baseline",
            "provenance": "NOAA IBTrACS v04r01",
            "disclaimer": "Evaluated against historical IBTrACS ground-truth track points. Zero future observations were used in forecast generation."
        }

    def evaluate_multi_event_tracks(self, cyclone_ids: List[str]) -> Dict[str, Any]:
        """Evaluate baseline track model across multiple independent cyclone events in IBTrACS."""
        event_metrics = []
        all_horizon_errors: Dict[int, List[float]] = {6: [], 12: [], 24: [], 48: [], 72: []}
        
        valid_event_count = 0
        for cid in cyclone_ids:
            res = self.evaluate_cyclone_track(cyclone_id=cid)
            if res.get("evaluated_origins_count", 0) > 0:
                valid_event_count += 1
                hm = res.get("horizon_metrics", {})
                for h in [6, 12, 24, 48, 72]:
                    h_key = f"{h}h"
                    if h_key in hm and hm[h_key]["mae_km"] is not None:
                        # Weight error by forecast count
                        c = hm[h_key]["forecast_count"]
                        mae = hm[h_key]["mae_km"]
                        all_horizon_errors[h].extend([mae] * c)

        multi_metrics = {}
        for h, errs in all_horizon_errors.items():
            if errs:
                multi_metrics[f"{h}h"] = {
                    "sample_count": len(errs),
                    "mae_km": round(float(np.mean(errs)), 1),
                    "median_km": round(float(np.median(errs)), 1),
                    "min_km": round(float(np.min(errs)), 1),
                    "max_km": round(float(np.max(errs)), 1)
                }
            else:
                multi_metrics[f"{h}h"] = {
                    "sample_count": 0,
                    "mae_km": None,
                    "median_km": None,
                    "min_km": None,
                    "max_km": None
                }

        return {
            "evaluated_cyclone_events": valid_event_count,
            "evaluated_cyclone_ids": cyclone_ids[:valid_event_count],
            "validation_status": f"Multi-event validation across {valid_event_count} independent North Indian Ocean cyclones.",
            "horizon_metrics": multi_metrics,
            "uncertainty_status": "unavailable",
            "uncertainty_disclaimer": "Uncertainty cone unavailable — insufficient independent validation data.",
            "method": "Persistence & Spherical Translation Vector Extrapolation Baseline",
            "provenance": "NOAA IBTrACS v04r01 Multi-Event Benchmark",
            "disclaimer": "Evaluated against historical IBTrACS ground-truth track points."
        }

track_predictor = BaselineTrackPredictor()
track_service = track_predictor

