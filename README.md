# CYCLONEAI-SAT — SIH Problem Statement SIH26070

**AI/ML System for Identification, Classification, and Prediction of Tropical-Cyclone Patterns Using Multi-Source Satellite Data**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.3+-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=flat-square&logo=python)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 1. Executive Summary & SIH Requirement Traceability

**CYCLONEAI-SAT** is a research-grade, scientifically transparent tropical cyclone intelligence system developed for Smart India Hackathon (SIH Problem Statement **SIH26070**). 

The system bridges geostationary satellite observation gaps, provides transparent candidate localization, classifies cyclone pattern stages via IR morphology, estimates wind intensity, forecasts trajectory horizons (+6h to +72h), assesses coastal landfall risk, and generates Explainable AI (XAI) feature attributions.

### SIH Requirement Mapping Matrix

| SIH26070 Requirement | Implemented System Capability | Backend Service / Module | Validation Scope |
| :--- | :--- | :--- | :--- |
| **1. Cyclone Identification** | Candidate center localization via thermal IR convection thresholding and morphological blob analysis | `identification_service.py` | `WITHIN_EVENT` (MAE: 24.6 km) |
| **2. Pattern Classification** | Dvorak-derived IR cloud pattern classifier (Curved Band, CDO, Eye Pattern) | `classification_service.py` | `WITHIN_EVENT` (Accuracy: 87.5%) |
| **3. Intensity Estimation** | IR cloud-top brightness temperature wind proxy estimator ($V_{est}$) | `intensity_service.py` | `WITHIN_EVENT` (MAE: 8.42 km/h) |
| **4. Track Prediction** | Spherical great-circle kinematics persistence forecast (+6h, +12h, +24h, +48h, +72h) | `track_service.py` | `MULTI_EVENT_BASELINE` (+24h MAE: 68.2 km) |
| **5. Landfall & Risk** | Coastal distance geometry & risk score breakdown | `landfall_service.py` | `WITHIN_EVENT` |
| **6. Multi-Source Architecture** | Generic multi-satellite source registry & feature-level fusion engine | `satellites_service.py` | `NOT_READY` (Single source connected) |
| **7. Temporal Satellite Interpolation** | 2D Spatial Frame Interpolation CNN (30-min to 15-min synthetic frames) | `temporal_service.py` | `WITHIN_EVENT_HELD_OUT` (SSIM: 0.9215 vs Linear Baseline 0.9221) |
| **8. Explainable AI (XAI)** | Decision path tree, vector kinematics, thermal component decomposition | `xai_service.py` & `evaluation_service.py` | Residual / Difference Diagnostics |

---

## 2. Scientific Claim Audit: Real Data vs. Research Baselines

To maintain strict scientific integrity, CYCLONEAI-SAT explicitly distinguishes real empirical evidence from algorithmic baselines and unfulfilled operational features.

```
                  CYCLONEAI-SAT SCIENTIFIC BOUNDARIES
┌─────────────────────────┬───────────────────────────┬────────────────────────────┐
│      REAL DATASET       │    ALGORITHMIC BASELINES  │    CURRENTLY UNAVAILABLE   │
├─────────────────────────┼───────────────────────────┼────────────────────────────┤
│ • INSAT-3D Thermal IR   │ • Convective Center       │ • Live Satellite Stream    │
│   (10.8 µm, 48 frames)  │   Localization (MAE 24km) │   (MOSDAC / IMD Feed)      │
│ • NOAA IBTrACS v04r01   │ • Dvorak IR Classifier    │ • Operational Multi-Source │
│   (WMO Track & Wind)    │   (Acc 87.5%)             │   Satellite Fusion         │
│                         │ • $V_{est}$ Intensity Proxy│ • Dynamical NWP Steering   │
│                         │ • Spherical Persistence   │   Flow Vector Coupling     │
│                         │   Track Forecast          │ • Operational Disaster     │
│                         │ • 2D Interpolation CNN    │   Warning Issuance         │
└─────────────────────────┴───────────────────────────┴────────────────────────────┘
```

---

## 3. Data Provenance & Validation Quality Taxonomy

### Dataset Provenance
- **Satellite Platform**: INSAT-3D (Geostationary Orbit 82.0°E)
- **Sensor Instrument**: Imager
- **Spectral Channel**: Thermal Infrared 1 (10.8 µm)
- **Spatial Resolution**: 4.0 km at nadir
- **Observation Period**: Dec 03 00:00 UTC – Dec 05 23:30 UTC, 2023 (Cyclone Michaung, 48 frames)
- **Ground-Truth Reference**: NOAA International Best Track Archive for Climate Stewardship (IBTrACS v04r01)

### Validation Quality Taxonomy
- **`WITHIN_EVENT`**: Single-event historical evaluation on Cyclone Michaung (Dec 2023). Applied to Identification (MAE: 24.6 km), Classification (Acc: 87.5%), and Intensity (MAE: 8.42 km/h).
- **`MULTI_EVENT_BASELINE`**: Benchmark evaluated across 8 independent North Indian Ocean cyclones (Michaung, Biparjoy, Mocha, Sitrang, Asani, Jawad, Gulab, Yaas). Applied to Track Forecasting (+24h MAE: 68.2 km).
- **`WITHIN_EVENT_HELD_OUT`**: Chronological split on 46 generated triplets from 48 INSAT-3D frames.
  - **Total Frames**: 48
  - **Triplets Generated**: 46
  - **Train Triplets**: 32
  - **Test Triplets**: 14
  - **Sample Caveat**: Samples exhibit temporal correlation, and adjacent sliding 3-frame windows share boundary frames.

---

## 4. Limitation Registry

The system formally registers 8 core operational limitations (`/api/evaluation/limitations`):

1. `LIM_SINGLE_SOURCE`: Only INSAT-3D Thermal IR 10.8 µm dataset is locally connected to the filesystem.
2. `LIM_MICHAUNG_ONLY`: Primary satellite frame sequence is restricted to 48 frames of Cyclone Michaung (Dec 03–05, 2023).
3. `LIM_NO_LIVE`: Operating in historical observation replay mode with zero live satellite ingestion stream.
4. `LIM_CLASSICAL_DETECTOR`: Identification uses classical convection thresholding and morphological filtering.
5. `LIM_TRACK_PERSISTENCE`: Track forecasting uses spherical great-circle vector translation extrapolation.
6. `LIM_NO_PROB_UNCERTAINTY`: Track and landfall forecasts report deterministic baseline points without probabilistic cones.
7. `LIM_TEMPORAL_SINGLE_EVENT`: Temporal frame interpolation model was trained/evaluated on chronological triplets of Cyclone Michaung.
8. `LIM_FUSION_NOT_READY`: Multi-source satellite fusion engine remains in `NOT_READY` state due to single connected source.

---

## 5. System Architecture & Component Flow

```
                                CYCLONEAI-SAT ARCHITECTURE
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FASTAPI BACKEND SYSTEM                                 │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┬───────────────┤
│  Identification │  Classification │    Intensity     │ Track Forecast  │ Landfall/Risk │
│  (Localization) │  (Dvorak IR)    │   ($V_{est}$)    │  (Persistence)  │ (Geometry)    │
└────────┬────────┴────────┬────────┴────────┬─────────┴────────┬────────┴───────┬───────┘
         │                 │                 │                  │                │
┌────────┴─────────────────┴─────────────────┴──────────────────┴────────────────┴───────┐
│                           UNIFIED EVALUATION & XAI SERVICES                            │
│  • XAIService (Feature Attributions & Decision Paths)                                 │
│  • EvaluationService (Capability-Isolated Metrics & JSON Report Export)                │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ JSON API
┌──────────────────────────────────────────┴─────────────────────────────────────────────┐
│                              REACT + VITE FRONTEND (TAILWIND v4)                       │
│  Mission Control │ Discovery │ Observation │ Identification │ Classification │ Track      │
│  Landfall Risk  │ Temporal Enhancement │ Scientific Evaluation & XAI Inspector           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. API Reference Overview

The FastAPI backend exposes 15 production endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check |
| `GET` | `/api/system/status` | System operational status & active dataset metadata |
| `GET` | `/api/cyclones` | List tracked tropical cyclones |
| `GET` | `/api/cyclones/{id}` | Get cyclone event details |
| `GET` | `/api/cyclones/{id}/track` | Ground-truth IBTrACS track coordinates |
| `GET` | `/api/satellites/insat3d/michaung` | INSAT-3D 48-frame satellite sequence |
| `GET` | `/api/satellites/sources` | Satellite source registry |
| `GET` | `/api/satellites/comparison` | Cross-satellite platform comparison matrix |
| `GET` | `/api/satellites/fusion/status` | Multi-source fusion engine status (`NOT_READY`) |
| `GET` | `/api/evaluation/summary` | Capability-isolated evaluation summary |
| `GET` | `/api/evaluation/{capability}` | Capability-specific evaluation metrics |
| `GET` | `/api/evaluation/provenance` | Dataset provenance & instrument metadata |
| `GET` | `/api/evaluation/limitations` | 8-item structured limitation registry |
| `GET` | `/api/evaluation/report.json` | Machine-readable evaluation report JSON export |
| `GET` | `/api/xai/{capability}/{id}` | XAI feature attributions & decision paths |

---

## 7. Step-by-Step Reproducibility & Local Setup

### Prerequisites
- **Python**: Version 3.13+ (or 3.10+)
- **Node.js**: Version 18+ & `npm`

### 1. Backend Setup & Test Suite Execution
```bash
# Navigate to project root
cd d:/ISRO-MISSION-main/ISRO-MISSION-main

# Install backend dependencies (if needed)
pip install fastapi uvicorn pandas numpy scipy pytest httpx

# Run the complete Pytest backend test suite (69 tests)
python -m pytest backend/tests
```

### 2. Launch FastAPI Server
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup & Build Verification
```bash
# Install frontend dependencies
npm install

# Run Vite development server
npm run dev

# Verify clean production build
npm run build
```

---

## 8. License

Distributed under the MIT License. Developed for Smart India Hackathon (SIH26070).
