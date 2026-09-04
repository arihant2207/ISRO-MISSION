# CYCLONEAI-SAT Backend API Layer

Python FastAPI backend for **CYCLONEAI-SAT** (SIH26070). Parses real NOAA IBTrACS tropical cyclone tracks and provides structured endpoints for satellite intelligence, cyclone identification, pattern classification, intensity estimation, and track prediction contracts.

## Key Features

- **FastAPI Framework**: High performance async REST API.
- **Real Data Integration**: Ingests `ibtracs.NI.list.v04r01.csv` containing North Indian Ocean historical cyclone tracks.
- **Scientific Honesty Contract**: Exposes explicit provenance tags (`REAL OBSERVATION`, `MODEL NOT CONNECTED`, `PROTOTYPE`).
- **Pydantic Validation**: Strictly typed schemas for health, system status, cyclone metadata, track points, and satellite asset status.

## Environment Setup

Create `.env` based on `.env.example`:

```bash
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
IBTRACS_DATA_PATH=../public/ibtracs.NI.list.v04r01.csv
SATELLITE_ASSET_PATH=../public/IR_Michaung.gif
```

## Running Locally

From the repository root:

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run backend dev server
uvicorn backend.app.main:app --port 8000 --reload
```

Interactive API documentation available at `http://localhost:8000/api/docs`.

## Running Pytest Suite

```bash
pytest backend/tests
```
