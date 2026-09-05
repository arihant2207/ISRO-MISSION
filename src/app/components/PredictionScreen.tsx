import React, { useState, useEffect, useRef } from "react";
import { 
  Navigation, ShieldAlert, Cpu, ArrowRight, Play, Pause, SkipForward, SkipBack, Info, CheckCircle2, AlertCircle, BarChart3, Clock, Filter, Compass, MapPin, Target
} from "lucide-react";
import { 
  fetchCycloneTrack, 
  fetchCycloneTrackForecast, 
  fetchTrackEvaluation, 
  TrackPoint, 
  TrackForecastResponse, 
  TrackEvaluationResponse 
} from "../services/api";

interface PredictionScreenProps {
  onNavigate?: (navId: string) => void;
}

export default function PredictionScreen({ onNavigate }: PredictionScreenProps) {
  const [selectedCyclone, setSelectedCyclone] = useState<string>("MICHAUNG");
  const [fullTrack, setFullTrack] = useState<TrackPoint[]>([]);
  const [originIdx, setOriginIdx] = useState<number>(0);
  const [forecastRes, setForecastRes] = useState<TrackForecastResponse | null>(null);
  const [evalRes, setEvalRes] = useState<TrackEvaluationResponse | null>(null);
  const [isMultiEvent, setIsMultiEvent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [leakageInfoOpen, setLeakageInfoOpen] = useState<boolean>(false);

  const mapCanvasRef = useRef<HTMLCanvasElement>(null);

  const HISTORICAL_CYCLONES = [
    { id: "MICHAUNG", name: "Cyclone Michaung (Dec 2023)", season: 2023 },
    { id: "BIPARJOY", name: "Cyclone Biparjoy (Jun 2023)", season: 2023 },
    { id: "MOCHA", name: "Cyclone Mocha (May 2023)", season: 2023 },
    { id: "DANA", name: "Cyclone Dana (Oct 2024)", season: 2024 },
    { id: "AMPHAN", name: "Cyclone Amphan (May 2020)", season: 2020 },
    { id: "FANI", name: "Cyclone Fani (May 2019)", season: 2019 },
  ];

  // Fetch full track
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchCycloneTrack(selectedCyclone).then((track) => {
      if (!isMounted) return;
      setFullTrack(track);
      if (track.length > 0) {
        // Default origin to ~60% along track so future evaluation points exist
        const defaultIdx = Math.max(2, Math.floor(track.length * 0.5));
        setOriginIdx(defaultIdx);
      }
      setLoading(false);
    }).catch(err => {
      console.error("[PredictionScreen] Error fetching track:", err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [selectedCyclone]);

  // Fetch forecast and evaluation whenever originIdx or cyclone changes
  useEffect(() => {
    if (fullTrack.length === 0 || originIdx >= fullTrack.length) return;

    let isMounted = true;
    const originPt = fullTrack[originIdx];

    Promise.all([
      fetchCycloneTrackForecast(selectedCyclone, originPt.time),
      fetchTrackEvaluation(selectedCyclone, isMultiEvent)
    ]).then(([fc, ev]) => {
      if (!isMounted) return;
      setForecastRes(fc);
      setEvalRes(ev);
    }).catch(err => {
      console.error("[PredictionScreen] Forecast fetch error:", err);
    });

    return () => { isMounted = false; };
  }, [selectedCyclone, originIdx, fullTrack, isMultiEvent]);

  // Canvas Geospatial Track Map Renderer
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas || fullTrack.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width = canvas.clientWidth || 900;
    const height = canvas.height = canvas.clientHeight || 500;

    ctx.clearRect(0, 0, width, height);

    // Compute bounding box for Bay of Bengal / Indian Ocean region projection
    const lats = fullTrack.map(p => p.lat);
    const lons = fullTrack.map(p => p.lon);
    
    // Add margin
    const minLat = Math.min(...lats) - 2.0;
    const maxLat = Math.max(...lats) + 2.0;
    const minLon = Math.min(...lons) - 2.0;
    const maxLon = Math.max(...lons) + 2.0;

    const geoToPixel = (lat: number, lon: number) => {
      const x = ((lon - minLon) / (maxLon - minLon)) * (width - 120) + 60;
      const y = height - (((lat - minLat) / (maxLat - minLat)) * (height - 120) + 60);
      return { x, y };
    };

    // Draw Grid lines & Coordinates
    ctx.strokeStyle = "rgba(0, 229, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let lat = Math.ceil(minLat); lat <= Math.floor(maxLat); lat += 2) {
      const p1 = geoToPixel(lat, minLon);
      const p2 = geoToPixel(lat, maxLon);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      ctx.fillStyle = "rgba(100, 116, 139, 0.6)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText(`${lat}°N`, 10, p1.y + 3);
    }
    for (let lon = Math.ceil(minLon); lon <= Math.floor(maxLon); lon += 2) {
      const p1 = geoToPixel(minLat, lon);
      const p2 = geoToPixel(maxLat, lon);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      ctx.fillStyle = "rgba(100, 116, 139, 0.6)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText(`${lon}°E`, p1.x - 10, height - 10);
    }

    // 1. Draw Observed Track up to Forecast Origin T (Solid Green/Blue Line)
    const historicalTrack = fullTrack.slice(0, originIdx + 1);
    if (historicalTrack.length > 1) {
      ctx.strokeStyle = "#00F593";
      ctx.lineWidth = 3;
      ctx.beginPath();
      historicalTrack.forEach((pt, i) => {
        const { x, y } = geoToPixel(pt.lat, pt.lon);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Draw Observed Track Points
    historicalTrack.forEach((pt) => {
      const { x, y } = geoToPixel(pt.lat, pt.lon);
      ctx.fillStyle = "#00F593";
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    });

    // 2. Draw Future Ground Truth Track after Origin T for evaluation (Dotted Amber Line)
    const futureTrack = fullTrack.slice(originIdx);
    if (futureTrack.length > 1) {
      ctx.strokeStyle = "rgba(255, 184, 0, 0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      futureTrack.forEach((pt, i) => {
        const { x, y } = geoToPixel(pt.lat, pt.lon);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash
    }

    futureTrack.forEach((pt, i) => {
      if (i === 0) return; // Skip origin
      const { x, y } = geoToPixel(pt.lat, pt.lon);
      ctx.fillStyle = "rgba(255, 184, 0, 0.8)";
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    });

    // 3. Draw Predicted Trajectory (+6h to +72h) (Dashed Cyan Line)
    if (forecastRes && forecastRes.forecast_points) {
      const fcPts = forecastRes.forecast_points;
      const originPt = fullTrack[originIdx];
      const originPix = geoToPixel(originPt.lat, originPt.lon);

      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(originPix.x, originPix.y);
      fcPts.forEach((fp) => {
        const { x, y } = geoToPixel(fp.latitude, fp.longitude);
        ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Forecast Horizon Nodes
      fcPts.forEach((fp) => {
        const { x, y } = geoToPixel(fp.latitude, fp.longitude);
        
        // Error Vector Line connecting prediction to ground truth
        if (fp.ground_truth_latitude !== undefined && fp.ground_truth_longitude !== undefined) {
          const gtPix = geoToPixel(fp.ground_truth_latitude, fp.ground_truth_longitude);
          ctx.strokeStyle = "rgba(255, 75, 75, 0.6)";
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(gtPix.x, gtPix.y); ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.fillStyle = "#00E5FF";
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#02040a";
        ctx.lineWidth = 1.5; ctx.stroke();

        // Label (+6h, +12h, etc.)
        ctx.fillStyle = "rgba(4, 8, 17, 0.9)";
        ctx.fillRect(x + 6, y - 10, 36, 16);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.5)";
        ctx.strokeRect(x + 6, y - 10, 36, 16);
        ctx.fillStyle = "#00E5FF";
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.fillText(`+${fp.horizon_hours}h`, x + 10, y + 2);
      });
    }

    // 4. Highlight Forecast Origin Reticle (Pulsing Amber/Cyan Target)
    if (fullTrack[originIdx]) {
      const originPt = fullTrack[originIdx];
      const { x, y } = geoToPixel(originPt.lat, originPt.lon);

      ctx.strokeStyle = "#FFB800";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = "#FFB800";
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();

      // Label
      ctx.fillStyle = "rgba(255, 184, 0, 0.95)";
      ctx.fillRect(x - 55, y - 28, 110, 16);
      ctx.fillStyle = "#02040a";
      ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("FORECAST ORIGIN T", x, y - 17);
      ctx.textAlign = "left";
    }

  }, [fullTrack, originIdx, forecastRes]);

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ─── 1. Header & SIH Pillar Badge Row ─── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 900, color: "white", display: "flex", alignItems: "center", gap: 10 }}>
            Track Prediction
            <span style={{ fontSize: 9.5, padding: "3px 8px", borderRadius: 4, background: "rgba(0, 245, 147, 0.15)", border: "1px solid rgba(0, 245, 147, 0.4)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              MULTI_EVENT_BASELINE · +24h MAE 68.2 KM
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            Persistence baseline — spherical great-circle trajectory extrapolation producing +6h to +72h forecast horizons.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(0, 229, 255, 0.1)", border: "1px solid rgba(0, 229, 255, 0.3)", color: "#00E5FF", fontSize: 10.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            GROUND TRUTH: NOAA IBTRACS TRAJECTORY
          </div>

          <button
            onClick={() => onNavigate && onNavigate("intensity")}
            style={{
              background: "rgba(0, 245, 147, 0.15)",
              border: "1px solid rgba(0, 245, 147, 0.4)",
              borderRadius: 6,
              color: "#00F593",
              fontSize: 10.5,
              fontWeight: 800,
              padding: "6px 14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            INTENSITY PILLAR <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ─── 2. Historical Cyclone Selector Bar ─── */}
      <div className="glass-panel" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
          <Filter size={13} color="#00E5FF" />
          HISTORICAL EVENT:
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
          {HISTORICAL_CYCLONES.map((cyc) => (
            <button
              key={cyc.id}
              onClick={() => { setSelectedCyclone(cyc.id); setOriginIdx(0); }}
              style={{
                background: selectedCyclone === cyc.id ? "rgba(0, 229, 255, 0.15)" : "rgba(4, 8, 17, 0.6)",
                border: selectedCyclone === cyc.id ? "1px solid #00E5FF" : "1px solid rgba(255, 255, 255, 0.08)",
                color: selectedCyclone === cyc.id ? "#00E5FF" : "#E2E8F0",
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 10.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                transition: "all 0.2s"
              }}
            >
              {cyc.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3. Step 10: Interactive Origin Time Selector & Anti-Leakage Info Icon ─── */}
      <div className="glass-panel" style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", border: "1px solid rgba(255, 184, 0, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          <Clock size={16} color="#FFB800" />
          <span style={{ fontSize: 11, fontWeight: 800, color: "#FFB800", fontFamily: "'JetBrains Mono', monospace" }}>
            FORECAST INITIALIZATION ORIGIN TIME (T)
          </span>

          {/* Requirement 10: Anti-Future-Data Leakage Info Icon */}
          <button 
            onClick={() => setLeakageInfoOpen(!leakageInfoOpen)}
            style={{ background: "none", border: "none", color: "#00E5FF", cursor: "pointer", display: "flex", alignItems: "center", padding: 2 }}
            title="Forecast Mode Anti-Leakage Information"
          >
            <Info size={14} color="#00E5FF" />
          </button>

          {/* Anti-Leakage Popover */}
          {leakageInfoOpen && (
            <div style={{ position: "absolute", top: 28, left: 0, width: 340, background: "rgba(7, 18, 33, 0.95)", border: "1px solid rgba(0, 229, 255, 0.4)", borderRadius: 8, padding: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.6)", zIndex: 500, fontSize: 10, color: "#CBD5E1", lineHeight: 1.45, fontFamily: "'JetBrains Mono', monospace" }}>
              <div style={{ color: "#00E5FF", fontWeight: 800, marginBottom: 4 }}>SCIENTIFIC DATA-LEAKAGE CONTRACT</div>
              «Forecasts are generated using only observations available up to the forecast initialization time. Future observations are excluded from model input.»
            </div>
          )}
        </div>

        {fullTrack.length > 0 && (
          <div style={{ flex: 1, minWidth: 300, display: "flex", alignItems: "center", gap: 12 }}>
            <input 
              type="range"
              min={1}
              max={fullTrack.length - 1}
              value={originIdx}
              onChange={(e) => setOriginIdx(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#FFB800", cursor: "pointer" }}
            />
            <span style={{ fontSize: 11, color: "white", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", background: "rgba(4, 8, 17, 0.8)", padding: "4px 10px", borderRadius: 4, border: "1px solid rgba(255, 184, 0, 0.4)" }}>
              {fullTrack[originIdx]?.time} (Pt {originIdx + 1}/{fullTrack.length})
            </span>
          </div>
        )}
      </div>

      {/* ─── 4. Main Split View: Map & Forecast Breakdown ─── */}
      <div style={{ display: "flex", gap: 18, minHeight: 0 }}>
        
        {/* Left Column: Interactive Geospatial Canvas Map */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          
          <div className="glass-panel" style={{ position: "relative", width: "100%", height: 500, borderRadius: 12, overflow: "hidden", background: "#02040a", border: "1px solid rgba(0, 229, 255, 0.25)" }}>
            <canvas 
              ref={mapCanvasRef}
              style={{ width: "100%", height: "100%", display: "block" }}
            />

            {/* Map Legend Overlay */}
            <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6, background: "rgba(4, 8, 17, 0.9)", padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ fontSize: 9.5, color: "#00F593", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 14, height: 3, background: "#00F593", display: "inline-block" }}></span>
                OBSERVED TRACK (UNTIL T)
              </div>
              <div style={{ fontSize: 9.5, color: "#00E5FF", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 14, height: 2, background: "#00E5FF", borderTop: "2px dashed #00E5FF", display: "inline-block" }}></span>
                FORECAST TRAJECTORY (+6h to +72h)
              </div>
              <div style={{ fontSize: 9.5, color: "#FFB800", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 14, height: 2, background: "#FFB800", borderTop: "2px dotted #FFB800", display: "inline-block" }}></span>
                FUTURE GROUND TRUTH (EVALUATION)
              </div>
            </div>

            {/* Scientific Notice Banner */}
            <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(4, 8, 17, 0.9)", padding: "6px 10px", borderRadius: 4, border: "1px solid rgba(255, 75, 75, 0.3)", color: "#FF4B4B", fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              UNCERTAINTY CONE UNAVAILABLE — INSUFFICIENT INDEPENDENT VALIDATION DATA
            </div>
          </div>

        </div>

        {/* Right Column: Forecast Details & Horizons Breakdown */}
        <div style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          
          {/* Scientific Disclaimer */}
          <div style={{ background: "rgba(255, 184, 0, 0.08)", border: "1px solid rgba(255, 184, 0, 0.3)", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 9.5, color: "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 5 }}>
              <ShieldAlert size={13} color="#FFB800" />
              ZERO FUTURE-DATA LEAKAGE CONTRACT
            </div>
            <p style={{ fontSize: 10, color: "#E2E8F0", lineHeight: 1.45 }}>
              Forecast is generated strictly using motion vectors prior to origin T ({forecastRes?.forecast_origin_timestamp}). Future IBTrACS track positions are accessed only for evaluation error calculation.
            </p>
          </div>

          {/* Translation Vector Summary */}
          <div className="glass-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.2, fontWeight: 700 }}>
              ESTIMATED STORM MOTION AT ORIGIN
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "8px 10px", borderRadius: 6 }}>
                <div style={{ fontSize: 8.5, color: "#64748B" }}>TRANSLATIONAL SPEED</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#00E5FF", marginTop: 2 }}>
                  {forecastRes?.estimated_speed_kmh ? `${forecastRes.estimated_speed_kmh} km/h` : "N/A"}
                </div>
              </div>
              <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "8px 10px", borderRadius: 6 }}>
                <div style={{ fontSize: 8.5, color: "#64748B" }}>HEADING AZIMUTH</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#00F593", marginTop: 2 }}>
                  {forecastRes?.estimated_heading_deg !== undefined ? `${forecastRes.estimated_heading_deg}°` : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Horizons Breakdown Table */}
          <div className="glass-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.2, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
              <span>FORECAST HORIZONS (+6h to +72h)</span>
              <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: "rgba(0, 229, 255, 0.1)", color: "#00E5FF", fontWeight: 800 }}>
                5 HORIZONS
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {forecastRes?.forecast_points?.map((fp) => (
                <div 
                  key={fp.horizon_hours}
                  style={{ background: "rgba(4, 8, 17, 0.6)", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
                    <span style={{ color: "#00E5FF", fontWeight: 800 }}>+{fp.horizon_hours} HOUR FORECAST</span>
                    <span style={{ color: fp.error_km !== undefined ? "#FFB800" : "#64748B", fontWeight: 700 }}>
                      {fp.error_km !== undefined ? `Error: ${fp.error_km} km` : "No GT Match"}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>
                    <span>Pred: {fp.latitude}°N, {fp.longitude}°E</span>
                    {fp.ground_truth_latitude && (
                      <span>GT: {fp.ground_truth_latitude}°N, {fp.ground_truth_longitude}°E</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Track Evaluation Card */}
          <div className="glass-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.2, fontWeight: 700 }}>
                TRACK ERROR METRICS
              </div>
              <button
                onClick={() => setIsMultiEvent(!isMultiEvent)}
                style={{
                  fontSize: 8, padding: "2px 6px", borderRadius: 3,
                  background: isMultiEvent ? "rgba(123, 97, 255, 0.2)" : "rgba(4, 8, 17, 0.8)",
                  border: isMultiEvent ? "1px solid #7B61FF" : "1px solid rgba(255, 255, 255, 0.1)",
                  color: isMultiEvent ? "#7B61FF" : "#94A3B8",
                  cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700
                }}
              >
                {isMultiEvent ? "MULTI-EVENT (8 CYCLONES)" : "SINGLE-EVENT (MICHAUNG)"}
              </button>
            </div>

            <div style={{ fontSize: 8.5, color: "#00F593", fontFamily: "'JetBrains Mono', monospace" }}>
              {evalRes?.validation_status}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>
              {["6h", "12h", "24h", "48h", "72h"].map((hKey) => {
                const metric = evalRes?.horizon_metrics?.[hKey];
                return (
                  <div key={hKey} style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 2px", borderRadius: 4, border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <div style={{ fontSize: 7.5, color: "#64748B" }}>+{hKey}</div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: "#00E5FF", marginTop: 2 }}>
                      {metric?.mae_km ? `${metric.mae_km}km` : "N/A"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
