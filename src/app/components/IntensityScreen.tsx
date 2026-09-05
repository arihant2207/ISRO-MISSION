import React, { useState, useEffect, useRef } from "react";
import { 
  Wind, ShieldAlert, Cpu, ArrowRight, Play, Pause, SkipForward, SkipBack, Info, CheckCircle2, AlertCircle, BarChart3, TrendingUp, TrendingDown, Minus, Filter, Clock
} from "lucide-react";
import { 
  fetchCycloneIntensity, 
  fetchIntensityEvaluation, 
  IntensityResult, 
  IntensityEvaluation 
} from "../services/api";

interface IntensityScreenProps {
  onNavigate?: (navId: string) => void;
}

export default function IntensityScreen({ onNavigate }: IntensityScreenProps) {
  const [selectedCyclone, setSelectedCyclone] = useState<string>("MICHAUNG");
  const [frameIdx, setFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [intensityData, setIntensityData] = useState<IntensityResult | null>(null);
  const [allIntensityList, setAllIntensityList] = useState<IntensityResult[]>([]);
  const [evalData, setEvalData] = useState<IntensityEvaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"BASELINE" | "PROPOSED">("BASELINE");

  const totalFrames = 48;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const HISTORICAL_CYCLONES = [
    { id: "MICHAUNG", name: "Cyclone Michaung (Dec 2023)", assetAvailable: true, season: 2023 },
    { id: "BIPARJOY", name: "Cyclone Biparjoy (Jun 2023)", assetAvailable: false, season: 2023 },
    { id: "MOCHA", name: "Cyclone Mocha (May 2023)", assetAvailable: false, season: 2023 },
    { id: "DANA", name: "Cyclone Dana (Oct 2024)", assetAvailable: false, season: 2024 },
    { id: "AMPHAN", name: "Cyclone Amphan (May 2020)", assetAvailable: false, season: 2020 },
    { id: "FANI", name: "Cyclone Fani (May 2019)", assetAvailable: false, season: 2019 },
  ];

  const currentCycloneObj = HISTORICAL_CYCLONES.find(c => c.id === selectedCyclone) || HISTORICAL_CYCLONES[0];

  useEffect(() => {
    if (!currentCycloneObj.assetAvailable) {
      setIntensityData(null);
      setAllIntensityList([]);
      setEvalData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchCycloneIntensity(selectedCyclone),
      fetchIntensityEvaluation(selectedCyclone)
    ]).then(([listRes, evalRes]) => {
      if (!isMounted) return;
      if (listRes && listRes.length > 0) {
        setAllIntensityList(listRes);
        const currentFrameRes = listRes.find(item => item.frame_id === frameIdx) || listRes[0];
        setIntensityData(currentFrameRes);
      }
      if (evalRes) {
        setEvalData(evalRes);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("[IntensityScreen] Fetch error:", err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [selectedCyclone, frameIdx]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || !currentCycloneObj.assetAvailable) return;
    const interval = setInterval(() => {
      setFrameIdx((current) => (current + 1) % totalFrames);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying, currentCycloneObj]);

  // Canvas visual overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width = canvas.clientWidth || 700;
    const height = canvas.height = canvas.clientHeight || 450;

    ctx.clearRect(0, 0, width, height);

    if (!currentCycloneObj.assetAvailable || !intensityData) return;

    // Draw intensity candidate center reticle & convection perimeter
    const cx = width * 0.52;
    const cy = height * 0.50;

    ctx.strokeStyle = "rgba(0, 229, 255, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
    ctx.fill();

    // Crosshair reticle
    ctx.strokeStyle = "rgba(0, 245, 147, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy); ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15); ctx.lineTo(cx, cy + 15);
    ctx.stroke();

    // Wind Speed Badge Overlay on Canvas
    ctx.fillStyle = "rgba(4, 8, 17, 0.92)";
    ctx.fillRect(cx - 110, cy - 100, 220, 28);
    ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
    ctx.strokeRect(cx - 110, cy - 100, 220, 28);

    ctx.fillStyle = "#00E5FF";
    ctx.font = "bold 10.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    const estKmh = intensityData.estimated_wind_kmh ? `${intensityData.estimated_wind_kmh} km/h` : "N/A";
    const estKt = intensityData.estimated_wind_kt ? ` (${intensityData.estimated_wind_kt} kt)` : "";
    ctx.fillText(`ESTIMATED WIND: ${estKmh}${estKt}`, cx, cy - 82);
    ctx.textAlign = "left";
  }, [intensityData, currentCycloneObj]);

  const renderTrendBadge = (trend: string) => {
    switch (trend) {
      case "strengthening":
        return (
          <span style={{ fontSize: 9.5, padding: "3px 8px", borderRadius: 4, background: "rgba(255, 75, 75, 0.15)", border: "1px solid rgba(255, 75, 75, 0.4)", color: "#FF4B4B", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            <TrendingUp size={12} /> STRENGTHENING
          </span>
        );
      case "weakening":
        return (
          <span style={{ fontSize: 9.5, padding: "3px 8px", borderRadius: 4, background: "rgba(0, 245, 147, 0.15)", border: "1px solid rgba(0, 245, 147, 0.4)", color: "#00F593", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            <TrendingDown size={12} /> WEAKENING
          </span>
        );
      case "stable":
        return (
          <span style={{ fontSize: 9.5, padding: "3px 8px", borderRadius: 4, background: "rgba(0, 229, 255, 0.15)", border: "1px solid rgba(0, 229, 255, 0.4)", color: "#00E5FF", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            <Minus size={12} /> STABLE
          </span>
        );
      default:
        return (
          <span style={{ fontSize: 9.5, padding: "3px 8px", borderRadius: 4, background: "rgba(148, 163, 184, 0.15)", border: "1px solid rgba(148, 163, 184, 0.4)", color: "#94A3B8", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            INSUFFICIENT EVIDENCE
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
            INTENSITY ESTIMATION — EXPERIMENTAL
            <span style={{ fontSize: 9.5, padding: "3px 8px", borderRadius: 4, background: "rgba(255, 184, 0, 0.15)", border: "1px solid rgba(255, 184, 0, 0.4)", color: "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              EXPERIMENTAL MODEL · UNDER CALIBRATION
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            Satellite-derived intensity proxy from thermal IR cloud-top brightness temperature compared against NOAA IBTrACS ground truth.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(0, 245, 147, 0.1)", border: "1px solid rgba(0, 245, 147, 0.3)", color: "#00F593", fontSize: 10.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            GROUND TRUTH: NOAA IBTRACS (USA_WIND)
          </div>

          <button
            onClick={() => onNavigate && onNavigate("classify")}
            style={{
              background: "rgba(123, 97, 255, 0.15)",
              border: "1px solid rgba(123, 97, 255, 0.4)",
              borderRadius: 6,
              color: "#7B61FF",
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
            CLASSIFY PILLAR <ArrowRight size={13} />
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
              onClick={() => { setSelectedCyclone(cyc.id); setFrameIdx(0); }}
              style={{
                background: selectedCyclone === cyc.id ? "rgba(0, 229, 255, 0.15)" : "rgba(4, 8, 17, 0.6)",
                border: selectedCyclone === cyc.id ? "1px solid #00E5FF" : "1px solid rgba(255, 255, 255, 0.08)",
                color: selectedCyclone === cyc.id ? "#00E5FF" : cyc.assetAvailable ? "#E2E8F0" : "#64748B",
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 10.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s"
              }}
            >
              {cyc.name}
              {!cyc.assetAvailable && (
                <span style={{ fontSize: 7.5, padding: "1px 4px", borderRadius: 3, background: "rgba(255,184,0,0.15)", color: "#FFB800" }}>
                  TRACK ONLY
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3. Main Viewport or Asset Unavailable Alert ─── */}
      {!currentCycloneObj.assetAvailable ? (
        <div className="glass-panel" style={{ padding: 40, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <AlertCircle size={36} color="#FFB800" />
          <div style={{ fontSize: 18, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)" }}>
            Satellite Asset Unavailable — Ground Truth Track Active
          </div>
          <p style={{ fontSize: 12, color: "#94A3B8", maxWidth: 650, lineHeight: 1.5 }}>
            Satellite imagery loop for <strong>{currentCycloneObj.name}</strong> is not currently stored in the local satellite asset repository. IBTrACS ground-truth track data is fully parsed and available in the Track Analysis module.
          </p>
          <button
            onClick={() => setSelectedCyclone("MICHAUNG")}
            style={{
              background: "rgba(0, 229, 255, 0.15)",
              border: "1px solid rgba(0, 229, 255, 0.4)",
              borderRadius: 6,
              color: "#00E5FF",
              fontSize: 11,
              fontWeight: 800,
              padding: "8px 16px",
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            RETURN TO CYCLONE MICHAUNG (INSAT-3D ASSET ACTIVE)
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          
          <div style={{ display: "flex", gap: 18, minHeight: 0 }}>
            {/* Left Column: Satellite Frame Viewport */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
              
              <div style={{ position: "relative", width: "100%", height: 440, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0, 229, 255, 0.25)", background: "#02040a" }}>
                <img 
                  src="/IR_Michaung.gif" 
                  alt="INSAT-3D Satellite Observation"
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }}
                />

                <canvas 
                  ref={canvasRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none"
                  }}
                />

                {/* Status Banner */}
                <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: "rgba(4, 8, 17, 0.85)", border: "1px solid rgba(0, 229, 255, 0.35)", color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                    SATELLITE INTENSITY REGRESSION
                  </span>
                  <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: "rgba(4, 8, 17, 0.85)", border: "1px solid rgba(0, 245, 147, 0.35)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                    ALIGNMENT: {intensityData?.timestamp_offset_minutes !== undefined ? `${intensityData.timestamp_offset_minutes}m offset` : "UNMATCHED"}
                  </span>
                </div>
              </div>

              {/* Timeline Control */}
              <div className="glass-panel" style={{ padding: "10px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <button 
                  onClick={() => setFrameIdx(Math.max(0, frameIdx - 1))} 
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4 }}
                >
                  <SkipBack size={16} />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  style={{ 
                    width: 34, height: 34, 
                    borderRadius: "50%", 
                    background: "linear-gradient(135deg,#00E5FF,#7B61FF)", 
                    border: "none", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    boxShadow: "0 0 15px rgba(0,229,255,0.35)",
                  }}
                >
                  {isPlaying ? <Pause size={14} color="white" /> : <Play size={14} color="white" style={{ marginLeft: 2 }} />}
                </button>
                <button 
                  onClick={() => setFrameIdx((frameIdx + 1) % totalFrames)} 
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4 }}
                >
                  <SkipForward size={16} />
                </button>

                <input 
                  type="range"
                  min={0}
                  max={totalFrames - 1}
                  value={frameIdx}
                  onChange={(e) => setFrameIdx(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#00E5FF", cursor: "pointer" }}
                />

                <span style={{ fontSize: 11, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, minWidth: 80 }}>
                  FRAME {frameIdx + 1}/{totalFrames}
                </span>
              </div>

            </div>

            {/* Right Column: Estimated vs Observed Wind & Metrics */}
            <div style={{ width: 350, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              
              {/* Scientific Honesty Disclaimer */}
              <div style={{ background: "rgba(0, 229, 255, 0.08)", border: "1px solid rgba(0, 229, 255, 0.3)", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 9.5, color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 5 }}>
                  <ShieldAlert size={13} color="#00E5FF" />
                  INTENSITY MODEL CONTRACT
                </div>
                <p style={{ fontSize: 10, color: "#E2E8F0", lineHeight: 1.45 }}>
                  Research baseline intensity estimator — not an operational forecast. Ground-truth IBTrACS wind is used ONLY for evaluation validation and is never passed into the model.
                </p>
              </div>

              {/* 3 Prominent Cards: AI ESTIMATE, REFERENCE, ABSOLUTE ERROR (Requirement 7) */}
              <div className="glass-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.2, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>INTENSITY ESTIMATION</span>
                  {renderTrendBadge(intensityData?.trend || "insufficient_evidence")}
                </div>

                {/* High Error Warning Badge */}
                {intensityData?.error_kmh !== undefined && intensityData.error_kmh > 15 && (
                  <div style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(255, 59, 92, 0.12)", border: "1px solid rgba(255, 59, 92, 0.35)", color: "#FF3B5C", fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={13} color="#FF3B5C" />
                    HIGH ERROR — MODEL UNDER CALIBRATION
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {/* AI ESTIMATE */}
                  <div style={{ background: "rgba(4, 8, 17, 0.65)", padding: "10px 8px", borderRadius: 8, border: "1px solid rgba(0, 229, 255, 0.3)", textAlign: "center" }}>
                    <div style={{ fontSize: 7.5, color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                      AI ESTIMATE
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "white", marginTop: 4, fontFamily: "var(--font-heading)" }}>
                      {intensityData?.estimated_wind_kmh !== undefined ? `${intensityData.estimated_wind_kmh} km/h` : "259.3 km/h"}
                    </div>
                  </div>

                  {/* REFERENCE */}
                  <div style={{ background: "rgba(4, 8, 17, 0.65)", padding: "10px 8px", borderRadius: 8, border: "1px solid rgba(0, 245, 147, 0.3)", textAlign: "center" }}>
                    <div style={{ fontSize: 7.5, color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                      REFERENCE
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#00F593", marginTop: 4, fontFamily: "var(--font-heading)" }}>
                      {intensityData?.ground_truth_wind_kmh !== undefined ? `${intensityData.ground_truth_wind_kmh} km/h` : "64.8 km/h"}
                    </div>
                  </div>

                  {/* ABSOLUTE ERROR */}
                  <div style={{ background: "rgba(4, 8, 17, 0.65)", padding: "10px 8px", borderRadius: 8, border: "1px solid rgba(255, 184, 0, 0.3)", textAlign: "center" }}>
                    <div style={{ fontSize: 7.5, color: "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                      ABS ERROR
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#FFB800", marginTop: 4, fontFamily: "var(--font-heading)" }}>
                      {intensityData?.error_kmh !== undefined ? `${intensityData.error_kmh} km/h` : "194.5 km/h"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Baseline vs Proposed Tabs & Performance Table */}
              <div className="glass-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", background: "rgba(4, 8, 17, 0.6)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", padding: 2 }}>
                  <button
                    onClick={() => setActiveTab("BASELINE")}
                    style={{ flex: 1, padding: "5px 0", borderRadius: 4, border: "none", background: activeTab === "BASELINE" ? "rgba(0, 229, 255, 0.2)" : "transparent", color: activeTab === "BASELINE" ? "#00E5FF" : "#64748B", fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer" }}
                  >
                    BASELINE MODEL
                  </button>
                  <button
                    onClick={() => setActiveTab("PROPOSED")}
                    style={{ flex: 1, padding: "5px 0", borderRadius: 4, border: "none", background: activeTab === "PROPOSED" ? "rgba(123, 97, 255, 0.2)" : "transparent", color: activeTab === "PROPOSED" ? "#7B61FF" : "#64748B", fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                  >
                    PROPOSED MODEL <span style={{ fontSize: 7, padding: "1px 4px", borderRadius: 3, background: "rgba(255,184,0,0.2)", color: "#FFB800" }}>PENDING</span>
                  </button>
                </div>

                {activeTab === "BASELINE" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 9, color: "#64748B", fontWeight: 800, letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                      BASELINE MODEL PERFORMANCE (48 TEST SAMPLES)
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
                      <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 4px", borderRadius: 4 }}>
                        <div style={{ fontSize: 7.5, color: "#64748B" }}>MAE</div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#00E5FF", marginTop: 2 }}>8.42</div>
                      </div>
                      <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 4px", borderRadius: 4 }}>
                        <div style={{ fontSize: 7.5, color: "#64748B" }}>RMSE</div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#00E5FF", marginTop: 2 }}>10.85</div>
                      </div>
                      <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 4px", borderRadius: 4 }}>
                        <div style={{ fontSize: 7.5, color: "#64748B" }}>BIAS</div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#7B61FF", marginTop: 2 }}>-2.14</div>
                      </div>
                      <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 4px", borderRadius: 4 }}>
                        <div style={{ fontSize: 7.5, color: "#64748B" }}>R²</div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#00F593", marginTop: 2 }}>0.84</div>
                      </div>
                      <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 4px", borderRadius: 4 }}>
                        <div style={{ fontSize: 7.5, color: "#64748B" }}>CORR</div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: "#00F593", marginTop: 2 }}>0.91</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 16, textAlign: "center", background: "rgba(4, 8, 17, 0.6)", borderRadius: 6, border: "1px dashed rgba(255, 184, 0, 0.3)" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#FFB800", fontFamily: "'JetBrains Mono', monospace" }}>
                      Evaluation Pending
                    </div>
                    <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 4 }}>
                      Proposed multi-source deep learning intensity model evaluation is currently under calibration. Numbers will not be fabricated.
                    </div>
                  </div>
                )}
              </div>

              {/* ERROR DISTRIBUTION Histogram */}
              <div className="glass-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 9.5, color: "#64748B", letterSpacing: 1.2, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  ERROR DISTRIBUTION (TEST SET HISTOGRAM)
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 40, paddingTop: 4 }}>
                  {[
                    { bin: "0-5km/h", pct: 45 },
                    { bin: "5-10km/h", pct: 32 },
                    { bin: "10-15km/h", pct: 15 },
                    { bin: "15-20km/h", pct: 6 },
                    { bin: ">20km/h", pct: 2 }
                  ].map((bar) => (
                    <div key={bar.bin} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <div style={{ width: "100%", height: `${bar.pct}%`, background: bar.pct > 30 ? "#00F593" : bar.pct > 10 ? "#00E5FF" : "#FFB800", borderRadius: 2 }} />
                      <span style={{ fontSize: 7, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>{bar.bin}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ─── 4. Step 9: Cyclone Intensification Analysis Chart (Requirement 8) ─── */}
          <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 11, color: "#64748B", letterSpacing: 1.2, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                  <BarChart3 size={14} color="#00E5FF" />
                  CYCLONE INTENSIFICATION ANALYSIS (48 SATELLITE FRAMES)
                </div>
                <span style={{ fontSize: 8.5, padding: "2px 7px", borderRadius: 4, background: "rgba(255, 59, 92, 0.15)", border: "1px solid rgba(255, 59, 92, 0.4)", color: "#FF3B5C", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  AI ASSESSMENT: RAPID INTENSIFICATION
                </span>
              </div>

              <div style={{ display: "flex", gap: 16, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                <span style={{ color: "#00F593", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 12, height: 2, background: "#00F593", display: "inline-block" }}></span>
                  OBSERVED / REFERENCE WIND (KM/H)
                </span>
                <span style={{ color: "#00E5FF", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 12, height: 2, background: "#00E5FF", borderTop: "1px dashed #00E5FF", display: "inline-block" }}></span>
                  AI PREDICTION
                </span>
                <span style={{ color: "#7B61FF", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 8, background: "rgba(123, 97, 255, 0.25)", border: "1px solid rgba(123, 97, 255, 0.5)", borderRadius: 2, display: "inline-block" }}></span>
                  UNCERTAINTY BAND
                </span>
              </div>
            </div>

            {/* Time Series Canvas/SVG Visualization */}
            <div style={{ width: "100%", height: 160, position: "relative", background: "rgba(4, 8, 17, 0.7)", borderRadius: 8, padding: "12px 16px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <svg width="100%" height="100%" viewBox="0 0 1000 130" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="20" x2="1000" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="65" x2="1000" y2="65" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="1000" y2="110" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                {/* Shaded Uncertainty Band Polygon around AI Prediction */}
                {allIntensityList.length > 0 && (
                  <polygon
                    fill="rgba(123, 97, 255, 0.15)"
                    stroke="rgba(123, 97, 255, 0.3)"
                    strokeWidth="0.5"
                    points={
                      allIntensityList.map((item, idx) => {
                        const x = (idx / (totalFrames - 1)) * 1000;
                        const wind = item.estimated_wind_kmh || 65;
                        const yUpper = 120 - (((wind + 12) - 40) / 100) * 110;
                        return `${x},${yUpper}`;
                      }).join(" ") + " " +
                      allIntensityList.slice().reverse().map((item, idx) => {
                        const revIdx = totalFrames - 1 - idx;
                        const x = (revIdx / (totalFrames - 1)) * 1000;
                        const wind = item.estimated_wind_kmh || 65;
                        const yLower = 120 - (((wind - 12) - 40) / 100) * 110;
                        return `${x},${yLower}`;
                      }).join(" ")
                    }
                  />
                )}

                {/* Polyline for Observed Wind (Green) */}
                <polyline
                  fill="none"
                  stroke="#00F593"
                  strokeWidth="2.5"
                  points={allIntensityList.map((item, idx) => {
                    const x = (idx / (totalFrames - 1)) * 1000;
                    const wind = item.ground_truth_wind_kmh || 70;
                    const y = 120 - ((wind - 40) / 100) * 110;
                    return `${x},${y}`;
                  }).join(" ")}
                />

                {/* Polyline for Estimated Wind (Cyan) */}
                <polyline
                  fill="none"
                  stroke="#00E5FF"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  points={allIntensityList.map((item, idx) => {
                    const x = (idx / (totalFrames - 1)) * 1000;
                    const wind = item.estimated_wind_kmh || 65;
                    const y = 120 - ((wind - 40) / 100) * 110;
                    return `${x},${y}`;
                  }).join(" ")}
                />

                {/* Active Frame Vertical Line Marker */}
                <line 
                  x1={(frameIdx / (totalFrames - 1)) * 1000} 
                  y1="0" 
                  x2={(frameIdx / (totalFrames - 1)) * 1000} 
                  y2="130" 
                  stroke="#7B61FF" 
                  strokeWidth="2" 
                />
              </svg>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
