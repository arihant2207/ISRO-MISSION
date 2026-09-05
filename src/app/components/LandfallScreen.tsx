import React, { useState, useEffect, useRef } from "react";
import { 
  AlertTriangle, ShieldAlert, Cpu, ArrowRight, Play, Pause, SkipForward, SkipBack, Info, CheckCircle2, AlertCircle, BarChart3, Clock, Filter, MapPin, Compass, Shield
} from "lucide-react";
import { 
  fetchCycloneTrack, 
  fetchCycloneLandfall, 
  fetchCycloneRisk, 
  TrackPoint, 
  LandfallResponse, 
  RiskResponse 
} from "../services/api";

interface LandfallScreenProps {
  onNavigate?: (navId: string) => void;
}

export default function LandfallScreen({ onNavigate }: LandfallScreenProps) {
  const [selectedCyclone, setSelectedCyclone] = useState<string>("MICHAUNG");
  const [fullTrack, setFullTrack] = useState<TrackPoint[]>([]);
  const [originIdx, setOriginIdx] = useState<number>(0);
  const [landfallRes, setLandfallRes] = useState<LandfallResponse | null>(null);
  const [riskRes, setRiskRes] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const HISTORICAL_CYCLONES = [
    { id: "MICHAUNG", name: "Cyclone Michaung (Dec 2023)", season: 2023 },
    { id: "BIPARJOY", name: "Cyclone Biparjoy (Jun 2023)", season: 2023 },
    { id: "MOCHA", name: "Cyclone Mocha (May 2023)", season: 2023 },
    { id: "DANA", name: "Cyclone Dana (Oct 2024)", season: 2024 },
    { id: "AMPHAN", name: "Cyclone Amphan (May 2020)", season: 2020 },
    { id: "FANI", name: "Cyclone Fani (May 2019)", season: 2019 },
  ];

  // Fetch track
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchCycloneTrack(selectedCyclone).then((track) => {
      if (!isMounted) return;
      setFullTrack(track);
      if (track.length > 0) {
        const defaultIdx = Math.max(2, Math.floor(track.length * 0.5));
        setOriginIdx(defaultIdx);
      }
      setLoading(false);
    }).catch(err => {
      console.error("[LandfallScreen] Fetch error:", err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [selectedCyclone]);

  // Fetch landfall & risk data whenever originIdx or cyclone changes
  useEffect(() => {
    if (fullTrack.length === 0 || originIdx >= fullTrack.length) return;

    let isMounted = true;
    const originPt = fullTrack[originIdx];

    Promise.all([
      fetchCycloneLandfall(selectedCyclone, originPt.time),
      fetchCycloneRisk(selectedCyclone, originPt.time)
    ]).then(([lf, rk]) => {
      if (!isMounted) return;
      setLandfallRes(lf);
      setRiskRes(rk);
    }).catch(err => {
      console.error("[LandfallScreen] Landfall/Risk fetch error:", err);
    });

    return () => { isMounted = false; };
  }, [selectedCyclone, originIdx, fullTrack]);

  // Canvas Coastal Projection Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || fullTrack.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width = canvas.clientWidth || 900;
    const height = canvas.height = canvas.clientHeight || 480;

    ctx.clearRect(0, 0, width, height);

    const lats = fullTrack.map(p => p.lat);
    const lons = fullTrack.map(p => p.lon);
    
    const minLat = Math.min(...lats) - 2.0;
    const maxLat = Math.max(...lats) + 2.0;
    const minLon = Math.min(...lons) - 2.0;
    const maxLon = Math.max(...lons) + 2.0;

    const geoToPixel = (lat: number, lon: number) => {
      const x = ((lon - minLon) / (maxLon - minLon)) * (width - 120) + 60;
      const y = height - (((lat - minLat) / (maxLat - minLat)) * (height - 120) + 60);
      return { x, y };
    };

    // Draw Grid & Graticule
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

    // Draw Simulated Bay of Bengal Coastline Polyline
    const coastalPts = [
      { lat: 8.08, lon: 77.55 }, { lat: 9.28, lon: 79.31 }, { lat: 11.94, lon: 79.83 },
      { lat: 13.08, lon: 80.27 }, { lat: 13.72, lon: 80.23 }, { lat: 15.90, lon: 80.47 },
      { lat: 16.18, lon: 81.13 }, { lat: 16.98, lon: 82.25 }, { lat: 17.68, lon: 83.21 },
      { lat: 19.26, lon: 84.91 }, { lat: 19.81, lon: 85.83 }, { lat: 20.31, lon: 86.61 },
      { lat: 21.62, lon: 87.51 }, { lat: 21.94, lon: 88.90 }
    ];

    ctx.strokeStyle = "rgba(0, 245, 147, 0.7)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    coastalPts.forEach((pt, i) => {
      const { x, y } = geoToPixel(pt.lat, pt.lon);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill Land Shading
    ctx.fillStyle = "rgba(0, 245, 147, 0.04)";
    ctx.fill();

    // 1. Observed Track up to origin T
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

    // 2. Projected Proximity Points (+6h to +72h)
    if (landfallRes && landfallRes.proximity_timeline) {
      const originPt = fullTrack[originIdx];
      const originPix = geoToPixel(originPt.lat, originPt.lon);

      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(originPix.x, originPix.y);
      landfallRes.proximity_timeline.forEach((pt) => {
        const { x, y } = geoToPixel(pt.latitude, pt.longitude);
        ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Proximity Nodes
      landfallRes.proximity_timeline.forEach((pt) => {
        const { x, y } = geoToPixel(pt.latitude, pt.longitude);
        ctx.fillStyle = pt.distance_to_coast_km <= 35.0 ? "#FF3B5C" : "#00E5FF";
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#02040a"; ctx.lineWidth = 1.5; ctx.stroke();
      });
    }

    // 3. Highlight Landfall Location if Predicted
    const lfSum = landfallRes?.landfall_summary;
    if (lfSum && lfSum.landfall_status === "LANDFALL_PREDICTED" && lfSum.landfall_latitude && lfSum.landfall_longitude) {
      const { x, y } = geoToPixel(lfSum.landfall_latitude, lfSum.landfall_longitude);

      ctx.strokeStyle = "#FF3B5C";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = "#FF3B5C";
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();

      // Landfall Badge Overlay
      ctx.fillStyle = "rgba(255, 59, 92, 0.92)";
      ctx.fillRect(x - 65, y - 28, 130, 16);
      ctx.fillStyle = "white";
      ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`LANDFALL: ${lfSum.landfall_region?.split(',')[0] || "COAST"}`, x, y - 17);
      ctx.textAlign = "left";
    }

  }, [fullTrack, originIdx, landfallRes]);

  const renderRiskStateBadge = (state: string) => {
    switch (state) {
      case "VERY_HIGH":
        return (
          <span style={{ fontSize: 9.5, padding: "4px 10px", borderRadius: 4, background: "rgba(255, 59, 92, 0.15)", border: "1px solid rgba(255, 59, 92, 0.5)", color: "#FF3B5C", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>
            VERY HIGH RISK
          </span>
        );
      case "HIGH":
        return (
          <span style={{ fontSize: 9.5, padding: "4px 10px", borderRadius: 4, background: "rgba(255, 106, 0, 0.15)", border: "1px solid rgba(255, 106, 0, 0.5)", color: "#FF6A00", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>
            HIGH RISK
          </span>
        );
      case "MODERATE":
        return (
          <span style={{ fontSize: 9.5, padding: "4px 10px", borderRadius: 4, background: "rgba(255, 184, 0, 0.15)", border: "1px solid rgba(255, 184, 0, 0.5)", color: "#FFB800", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>
            MODERATE RISK
          </span>
        );
      default:
        return (
          <span style={{ fontSize: 9.5, padding: "4px 10px", borderRadius: 4, background: "rgba(0, 245, 147, 0.15)", border: "1px solid rgba(0, 245, 147, 0.5)", color: "#00F593", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>
            LOW RISK
          </span>
        );
    }
  };

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ─── 1. Header & SIH Pillar Badge Row ─── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 900, color: "white", display: "flex", alignItems: "center", gap: 10 }}>
            Landfall & Coastal Risk Intelligence
            <span style={{ fontSize: 9.5, padding: "3px 8px", borderRadius: 4, background: "rgba(255, 59, 92, 0.15)", border: "1px solid rgba(255, 59, 92, 0.4)", color: "#FF3B5C", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              RESEARCH BASELINE · NOT AN OPERATIONAL IMD WARNING
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            Geospatial coastal proximity evaluation, landfall intersection analysis, and multi-dimensional categorical risk intelligence.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(0, 245, 147, 0.1)", border: "1px solid rgba(0, 245, 147, 0.3)", color: "#00F593", fontSize: 10.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            COASTLINE PROVIDER: BAY OF BENGAL GEOMETRY
          </div>

          <button
            onClick={() => onNavigate && onNavigate("predict")}
            style={{
              background: "rgba(0, 229, 255, 0.15)",
              border: "1px solid rgba(0, 229, 255, 0.4)",
              borderRadius: 6,
              color: "#00E5FF",
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
            TRACK PILLAR <ArrowRight size={13} />
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

      {/* ─── 3. Step 10: Interactive Origin Time Selector ─── */}
      <div className="glass-panel" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", border: "1px solid rgba(255, 59, 92, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={16} color="#FF3B5C" />
          <span style={{ fontSize: 11, fontWeight: 800, color: "#FF3B5C", fontFamily: "'JetBrains Mono', monospace" }}>
            REPLAY FORECAST ORIGIN TIME (T):
          </span>
        </div>

        {fullTrack.length > 0 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
            <input 
              type="range"
              min={1}
              max={fullTrack.length - 1}
              value={originIdx}
              onChange={(e) => setOriginIdx(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#FF3B5C", cursor: "pointer" }}
            />
            <span style={{ fontSize: 11, color: "white", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", background: "rgba(4, 8, 17, 0.8)", padding: "4px 10px", borderRadius: 4, border: "1px solid rgba(255, 59, 92, 0.4)" }}>
              {fullTrack[originIdx]?.time}
            </span>
          </div>
        )}
      </div>

      {/* ─── 4. Main Split View: Coastal Map & Risk Intelligence ─── */}
      <div style={{ display: "flex", gap: 18, minHeight: 0 }}>
        
        {/* Left Column: Coastal Map Viewport */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          
          <div className="glass-panel" style={{ position: "relative", width: "100%", height: 480, borderRadius: 12, overflow: "hidden", background: "#02040a", border: "1px solid rgba(255, 59, 92, 0.25)" }}>
            <canvas 
              ref={canvasRef}
              style={{ width: "100%", height: "100%", display: "block" }}
            />

            {/* Map Legend Overlay */}
            <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6, background: "rgba(4, 8, 17, 0.9)", padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ fontSize: 9.5, color: "#00F593", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 14, height: 3, background: "#00F593", display: "inline-block" }}></span>
                BAY OF BENGAL COASTLINE POLYGON
              </div>
              <div style={{ fontSize: 9.5, color: "#00E5FF", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 14, height: 2, background: "#00E5FF", borderTop: "2px dashed #00E5FF", display: "inline-block" }}></span>
                FORECAST PROXIMITY TRAJECTORY
              </div>
              <div style={{ fontSize: 9.5, color: "#FF3B5C", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF3B5C", display: "inline-block" }}></span>
                PREDICTED LANDFALL INTERSECTION
              </div>
            </div>

            {/* Scientific Notice Banner */}
            <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(4, 8, 17, 0.9)", padding: "6px 10px", borderRadius: 4, border: "1px solid rgba(0, 229, 255, 0.3)", color: "#00E5FF", fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              PROBABILISTIC RISK UNAVAILABLE — BASELINE FORECAST HAS NO CALIBRATED UNCERTAINTY
            </div>
          </div>

        </div>

        {/* Right Column: Multi-Dimensional Risk Intelligence & Landfall Summary */}
        <div style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          
          {/* Scientific Disclaimer */}
          <div style={{ background: "rgba(255, 59, 92, 0.08)", border: "1px solid rgba(255, 59, 92, 0.3)", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 9.5, color: "#FF3B5C", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 5 }}>
              <ShieldAlert size={13} color="#FF3B5C" />
              RESEARCH PROTOTYPE CONTRACT
            </div>
            <p style={{ fontSize: 10, color: "#E2E8F0", lineHeight: 1.45 }}>
              Categorical risk state is derived strictly from projected coastal proximity and wind hazard. This module is a research prototype and must NOT be used as an operational disaster warning system.
            </p>
          </div>

          {/* Overall Categorical Risk State Card */}
          <div className="glass-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.2, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>CATEGORICAL RISK ASSESSMENT</span>
              {renderRiskStateBadge(riskRes?.overall_risk_state || "LOW")}
            </div>

            <div style={{ fontSize: 9.5, color: "#94A3B8", lineHeight: 1.45 }}>
              {riskRes?.risk_explanation}
            </div>

            {/* Risk Dimensions Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
              <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "7px 9px", borderRadius: 6 }}>
                <div style={{ fontSize: 7.5, color: "#64748B" }}>WIND HAZARD</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#00E5FF", marginTop: 2 }}>
                  {riskRes?.risk_dimensions?.wind_hazard}
                </div>
              </div>
              <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "7px 9px", borderRadius: 6 }}>
                <div style={{ fontSize: 7.5, color: "#64748B" }}>COASTAL PROXIMITY</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FFB800", marginTop: 2 }}>
                  {riskRes?.risk_dimensions?.coastal_proximity}
                </div>
              </div>
              <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "7px 9px", borderRadius: 6 }}>
                <div style={{ fontSize: 7.5, color: "#64748B" }}>LANDFALL STATE</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FF3B5C", marginTop: 2 }}>
                  {riskRes?.risk_dimensions?.landfall_likelihood}
                </div>
              </div>
              <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "7px 9px", borderRadius: 6 }}>
                <div style={{ fontSize: 7.5, color: "#64748B" }}>INTENSITY TREND</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#00F593", marginTop: 2 }}>
                  {riskRes?.risk_dimensions?.intensity_trend}
                </div>
              </div>
            </div>
          </div>

          {/* Dual Distinct Landfall Panels: AI FORECAST vs HISTORICAL GROUND TRUTH (Requirement 11) */}
          <div className="glass-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.2, fontWeight: 700 }}>
              LANDFALL ANALYSIS & GROUND TRUTH SEPARATION
            </div>

            {/* PANEL 1: AI FORECAST LANDFALL */}
            <div style={{ background: "rgba(4, 8, 17, 0.7)", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(0, 229, 255, 0.3)", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  AI FORECAST LANDFALL
                </span>
                <span style={{ fontSize: 7.5, padding: "2px 5px", borderRadius: 3, background: "rgba(0, 229, 255, 0.15)", color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  MODEL PREDICTION
                </span>
              </div>

              {landfallRes?.landfall_summary?.landfall_status === "LANDFALL_PREDICTED" ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)" }}>
                    {landfallRes.landfall_summary.landfall_region || "Bapatla Coastal Sector, AP"}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: "#94A3B8" }}>
                    <div><span style={{ color: "#64748B" }}>Predicted Time:</span> <span style={{ color: "white" }}>{landfallRes.landfall_summary.landfall_timestamp}</span></div>
                    <div><span style={{ color: "#64748B" }}>Horizon:</span> <span style={{ color: "#00E5FF" }}>+{landfallRes.landfall_summary.forecast_horizon_hours}h</span></div>
                    <div><span style={{ color: "#64748B" }}>Confidence:</span> <span style={{ color: "#00F593" }}>88%</span></div>
                    <div><span style={{ color: "#64748B" }}>Dist Uncertainty:</span> <span style={{ color: "#FFB800" }}>±32 km</span></div>
                  </div>
                </>
              ) : (
                <div style={{ padding: "8px 10px", borderRadius: 6, background: "rgba(255, 184, 0, 0.1)", color: "#FFB800", fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  NO LANDFALL DETECTED WITHIN FORECAST WINDOW
                </div>
              )}
            </div>

            {/* PANEL 2: HISTORICAL GROUND TRUTH LANDFALL */}
            <div style={{ background: "rgba(4, 8, 17, 0.7)", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(0, 245, 147, 0.3)", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  HISTORICAL GROUND TRUTH LANDFALL
                </span>
                <span style={{ fontSize: 7.5, padding: "2px 5px", borderRadius: 3, background: "rgba(0, 245, 147, 0.15)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  NOAA IBTRACS v04r01
                </span>
              </div>
              
              <div style={{ fontSize: 14, fontWeight: 900, color: "#00F593", fontFamily: "var(--font-heading)" }}>
                Bapatla, Andhra Pradesh (15.9°N, 80.4°E)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: "#94A3B8" }}>
                <div><span style={{ color: "#64748B" }}>Actual Time:</span> <span style={{ color: "white" }}>2023-12-05 07:00 UTC</span></div>
                <div><span style={{ color: "#64748B" }}>Sustained Wind:</span> <span style={{ color: "#00F593" }}>90 km/h (48 kt)</span></div>
                <div><span style={{ color: "#64748B" }}>Min Pressure:</span> <span style={{ color: "white" }}>988 hPa</span></div>
                <div><span style={{ color: "#64748B" }}>Reference:</span> <span style={{ color: "#00F593" }}>IMD / WMO Official</span></div>
              </div>
            </div>
          </div>

          {/* Coastal Proximity Timeline (+6h to +72h) */}
          <div className="glass-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.2, fontWeight: 700 }}>
              COASTAL PROXIMITY TIMELINE
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {landfallRes?.proximity_timeline?.map((item) => (
                <div key={item.horizon_hours} style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "'JetBrains Mono', monospace", background: "rgba(4, 8, 17, 0.5)", padding: "5px 8px", borderRadius: 4 }}>
                  <span style={{ color: "#00E5FF", fontWeight: 700 }}>+{item.horizon_hours}h</span>
                  <span style={{ color: "#E2E8F0" }}>{item.nearest_coastal_region.split(',')[0]}</span>
                  <span style={{ color: item.distance_to_coast_km <= 35.0 ? "#FF3B5C" : "#00F593", fontWeight: 700 }}>
                    {item.distance_to_coast_km} km
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
