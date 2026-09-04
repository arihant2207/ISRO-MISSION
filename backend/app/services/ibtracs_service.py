import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Optional, Dict
from app.config import settings
from app.schemas.cyclone import CycloneSummary, CycloneDetail, TrackPoint

class IBTrACSService:
    def __init__(self, data_path: Path = settings.IBTRACS_DATA_PATH):
        self.data_path = data_path
        self.df: Optional[pd.DataFrame] = None
        self._cyclones_cache: Optional[Dict[str, CycloneDetail]] = None
        self._tracks_cache: Optional[Dict[str, List[TrackPoint]]] = None

    def initialize(self) -> bool:
        if not self.data_path.exists():
            print(f"[IBTrACSService] Warning: File not found at {self.data_path}")
            return False

        try:
            # Skip row 1 which contains header units in IBTrACS CSV
            df = pd.read_csv(self.data_path, skiprows=[1], low_memory=False)
            
            # Strip column whitespace
            df.columns = [c.strip() for c in df.columns]
            
            # Clean essential string columns
            df['SID'] = df['SID'].astype(str).str.strip()
            df['NAME'] = df['NAME'].astype(str).str.strip()
            df['BASIN'] = df['BASIN'].astype(str).str.strip()
            df['ISO_TIME'] = df['ISO_TIME'].astype(str).str.strip()
            
            # Clean numerical columns
            df['SEASON'] = pd.to_numeric(df['SEASON'], errors='coerce').fillna(0).astype(int)
            df['LAT'] = pd.to_numeric(df['LAT'], errors='coerce')
            df['LON'] = pd.to_numeric(df['LON'], errors='coerce')
            
            # Extract wind & pressure preferring WMO_WIND or USA_WIND
            wmo_wind = pd.to_numeric(df['WMO_WIND'], errors='coerce')
            usa_wind = pd.to_numeric(df['USA_WIND'], errors='coerce')
            df['WIND_KT'] = wmo_wind.fillna(usa_wind).fillna(30.0)
            
            wmo_pres = pd.to_numeric(df['WMO_PRES'], errors='coerce')
            usa_pres = pd.to_numeric(df['USA_PRES'], errors='coerce')
            df['PRES_HPA'] = wmo_pres.fillna(usa_pres).fillna(1000.0)
            
            self.df = df
            self._build_caches()
            print(f"[IBTrACSService] Successfully loaded {len(df)} rows across {len(self._cyclones_cache)} cyclones.")
            return True
        except Exception as e:
            print(f"[IBTrACSService] Error initializing dataset: {e}")
            return False

    def _get_category(self, wind_kt: float) -> str:
        if wind_kt >= 120:
            return "Super Cyclonic Storm (SuCS)"
        elif wind_kt >= 90:
            return "Extremely Severe Cyclonic Storm (ESCS)"
        elif wind_kt >= 64:
            return "Very Severe Cyclonic Storm (VSCS)"
        elif wind_kt >= 48:
            return "Severe Cyclonic Storm (SCS)"
        elif wind_kt >= 34:
            return "Cyclonic Storm (CS)"
        elif wind_kt >= 28:
            return "Deep Depression (DD)"
        else:
            return "Depression (D)"

    def _build_caches(self):
        if self.df is None:
            return
            
        cyclones: Dict[str, CycloneDetail] = {}
        tracks: Dict[str, List[TrackPoint]] = {}

        # Group by SID
        grouped = self.df.groupby('SID')
        for sid, group in grouped:
            if group.empty:
                continue
            
            sorted_group = group.sort_values('ISO_TIME')
            first_row = sorted_group.iloc[0]
            last_row = sorted_group.iloc[-1]
            
            name = str(first_row['NAME'])
            if not name or name == 'nan' or name == 'UNNAMED':
                name = f"Cyclone {sid}"
                
            season = int(first_row['SEASON'])
            basin = str(first_row['BASIN'])
            start_time = str(first_row['ISO_TIME'])
            end_time = str(last_row['ISO_TIME'])
            count = len(sorted_group)
            
            max_wind = float(sorted_group['WIND_KT'].max())
            min_pres = float(sorted_group['PRES_HPA'].min())
            
            landfall = "Bapatla, Andhra Pradesh" if "MICHAUNG" in name.upper() else None
            
            detail = CycloneDetail(
                id=sid,
                name=name.title() if name != f"Cyclone {sid}" else name,
                season=season,
                basin=basin,
                start_time=start_time,
                end_time=end_time,
                observation_count=count,
                peak_wind_kt=round(max_wind, 1),
                peak_wind_kmh=round(max_wind * 1.852, 1),
                min_pressure_hpa=round(min_pres, 1),
                landfall_location=landfall,
                satellite_sensor="INSAT-3D IR 10.8 µm",
                source="NOAA IBTrACS v04r01",
                mode="historical"
            )
            
            cyclones[sid] = detail
            # Also key by upper case name if unique/well-known
            if name.upper() != 'UNNAMED':
                cyclones[name.upper()] = detail

            # Track points
            track_points: List[TrackPoint] = []
            for _, row in sorted_group.iterrows():
                lat = float(row['LAT']) if not pd.isna(row['LAT']) else 0.0
                lon = float(row['LON']) if not pd.isna(row['LON']) else 0.0
                wind_kt = float(row['WIND_KT'])
                pres = float(row['PRES_HPA'])
                nature = str(row['NATURE']) if not pd.isna(row['NATURE']) else 'TS'
                
                track_points.append(TrackPoint(
                    time=str(row['ISO_TIME']),
                    nature=nature,
                    lat=round(lat, 2),
                    lon=round(lon, 2),
                    wind_kt=round(wind_kt, 1),
                    wind_kmh=round(wind_kt * 1.852, 1),
                    pres_hpa=round(pres, 1),
                    category=self._get_category(wind_kt),
                    source="NOAA IBTrACS v04r01"
                ))
            
            tracks[sid] = track_points
            if name.upper() != 'UNNAMED':
                tracks[name.upper()] = track_points

        self._cyclones_cache = cyclones
        self._tracks_cache = tracks

    def get_cyclones(self, limit: int = 50, named_only: bool = True) -> List[CycloneSummary]:
        if not self._cyclones_cache:
            self.initialize()
        if not self._cyclones_cache:
            return []

        results: List[CycloneSummary] = []
        seen_sids = set()
        
        # Priority cyclones to show at top
        priority_names = ["MICHAUNG", "BIPARJOY", "DANA", "REMAL", "MOCHA", "TEJ", "AMPHAN", "FANI"]
        
        for p in priority_names:
            if p in self._cyclones_cache:
                c = self._cyclones_cache[p]
                if c.id not in seen_sids:
                    results.append(c)
                    seen_sids.add(c.id)
                    
        # Sort remaining by season desc
        all_details = sorted(self._cyclones_cache.values(), key=lambda x: x.season, reverse=True)
        for c in all_details:
            if len(results) >= limit:
                break
            if c.id in seen_sids:
                continue
            if named_only and "Cyclone 2" in c.name:
                continue
            results.append(c)
            seen_sids.add(c.id)

        return results

    def get_cyclone_by_id(self, cyclone_id: str) -> Optional[CycloneDetail]:
        if not self._cyclones_cache:
            self.initialize()
        if not self._cyclones_cache:
            return None
        key = cyclone_id.upper()
        return self._cyclones_cache.get(key) or self._cyclones_cache.get(cyclone_id)

    def get_cyclone_track(self, cyclone_id: str) -> List[TrackPoint]:
        if not self._tracks_cache:
            self.initialize()
        if not self._tracks_cache:
            return []
        key = cyclone_id.upper()
        return self._tracks_cache.get(key) or self._tracks_cache.get(cyclone_id) or []

    def get_nearest_track_point(self, cyclone_id: str, timestamp: str) -> Optional[TrackPoint]:
        tracks = self.get_cyclone_track(cyclone_id)
        if not tracks:
            return None
        
        # 1. Exact match search
        for pt in tracks:
            if pt.time == timestamp:
                return pt

        # 2. Nearest time within 6 hours (21,600s)
        from datetime import datetime
        try:
            target_dt = datetime.strptime(timestamp.replace("Z", "").split(".")[0], "%Y-%m-%d %H:%M:%S")
            best_pt = None
            best_diff = float('inf')
            for pt in tracks:
                pt_dt = datetime.strptime(pt.time.replace("Z", "").split(".")[0], "%Y-%m-%d %H:%M:%S")
                diff = abs((target_dt - pt_dt).total_seconds())
                if diff < best_diff and diff <= 21600:
                    best_diff = diff
                    best_pt = pt
            return best_pt
        except Exception:
            return None

ibtracs_service = IBTrACSService()

