import numpy as np
from PIL import Image
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.config import settings

class SatelliteFrameService:
    def __init__(self, asset_path: Path = settings.SATELLITE_ASSET_PATH):
        self.asset_path = asset_path
        self._frames_cache: Optional[List[Dict[str, Any]]] = None

    def initialize(self) -> bool:
        if not self.asset_path.exists():
            print(f"[SatelliteFrameService] Asset not found at {self.asset_path}")
            return False

        try:
            img = Image.open(self.asset_path)
            extracted_frames = []
            frame_idx = 0
            
            # Map 48 GIF frames to approximate observation timeline for Michaung (Dec 03 00:00 - Dec 05 18:00)
            # 48 frames at ~1 hour resolution across 48 hours
            base_time = "2023-12-03 00:00:00"

            while True:
                # Convert palette image to RGB grayscale intensity
                frame_img = img.convert("L")
                arr = np.array(frame_img)
                
                # Metadata
                extracted_frames.append({
                    "frame_id": frame_idx,
                    "source_id": "INSAT3D_IR",
                    "platform": "INSAT-3D",
                    "instrument": "Imager",
                    "channel": "IR 10.8 µm",
                    "channel_category": "TIR",
                    "width": img.width,
                    "height": img.height,
                    "timestamp": self._estimate_timestamp(frame_idx),
                    "array": arr,
                    "provenance": "INSAT-3D Thermal IR 10.8 µm Historical Observation (Dec 2023)"
                })
                
                frame_idx += 1
                img.seek(img.tell() + 1)
        except EOFError:
            pass  # Reached end of GIF frames
        except Exception as e:
            print(f"[SatelliteFrameService] Error extracting frames: {e}")

        self._frames_cache = extracted_frames
        print(f"[SatelliteFrameService] Extracted & cached {len(extracted_frames)} frames.")
        return len(extracted_frames) > 0

    def _estimate_timestamp(self, idx: int) -> str:
        # Dec 03 00:00 + idx hours
        from datetime import datetime, timedelta
        start = datetime(2023, 12, 3, 0, 0, 0)
        dt = start + timedelta(hours=idx)
        return dt.strftime("%Y-%m-%d %H:%M:%S")

    def get_frame(self, frame_id: int) -> Optional[Dict[str, Any]]:
        if not self._frames_cache or frame_id < 0 or frame_id >= len(self._frames_cache):
            return None
        return self._frames_cache[frame_id]

    def get_all_frames(self) -> List[Dict[str, Any]]:
        return self._frames_cache or []

    def get_all_frames_metadata(self) -> List[Dict[str, Any]]:
        if not self._frames_cache:
            return []
        return [
            {
                "frame_id": f["frame_id"],
                "source_id": f.get("source_id", "INSAT3D_IR"),
                "platform": f.get("platform", "INSAT-3D"),
                "instrument": f.get("instrument", "Imager"),
                "channel": f.get("channel", "IR 10.8 µm"),
                "channel_category": f.get("channel_category", "TIR"),
                "width": f["width"],
                "height": f["height"],
                "timestamp": f["timestamp"],
                "provenance": f["provenance"]
            }
            for f in self._frames_cache
        ]

frame_service = SatelliteFrameService()

