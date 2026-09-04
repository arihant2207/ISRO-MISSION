import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

# Base directory: backend folder
BASE_DIR = Path(__file__).resolve().parent.parent
# Workspace root directory
PROJECT_ROOT = BASE_DIR.parent

from pydantic import ConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CYCLONEAI-SAT Backend"
    API_V1_STR: str = "/api"
    
    # Pathlib relative resolution
    IBTRACS_DATA_PATH: Path = PROJECT_ROOT / "public" / "ibtracs.NI.list.v04r01.csv"
    SATELLITE_ASSET_PATH: Path = PROJECT_ROOT / "public" / "IR_Michaung.gif"
    
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    
    model_config = ConfigDict(env_file=str(BASE_DIR / ".env"), extra="ignore")

settings = Settings()

