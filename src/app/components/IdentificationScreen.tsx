import React, { useState, useEffect, useRef } from "react";
import { 
  Eye, Target, ShieldAlert, Cpu, ArrowRight, Play, Pause, SkipForward, SkipBack, Maximize2, Activity, Info, CheckCircle2, Layers, BarChart3, Database
} from "lucide-react";
import { 
  fetchCycloneIdentification, 
  fetchIdentificationEvaluation, 
  IdentificationResult, 
  IdentificationEvaluation 
} from "../services/api";

interface IdentificationScreenProps {
  onNavigate?: (navId: string) => void;
}

export default function IdentificationScreen({ onNavigate }: IdentificationScreenProps) {
  const [frameIdx, setFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [identData, setIdentData] = useState<IdentificationResult | null>(null);
  const [evalData, setEvalData] = useState<IdentificationEvaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const totalFrames = 48;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load identification data from backend
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchCycloneIdentification("MICHAUNG", frameIdx),
      fetchIdentificationEvaluation("MICHAUNG")
    ]).then(([identList, evalRes]) => {
      if (!isMounted) return;
      if (identList && identList.length > 0) {
        setIdentData(identList[0]);
      }
      if (evalRes) {
        setEvalData(evalRes);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("[IdentificationScreen] Fetch error:", err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [frameIdx]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrameIdx((current) => (current + 1) % totalFrames);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Render Canvas Overlays on top of satellite frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width = canvas.clientWidth || 700;
    const height = canvas.height = canvas.clientHeight || 450;

    ctx.clearRect(0, 0, width, height);

    if (!identData || !identData.detected) {
      return;
    }

    // Draw Candidate Bounding Box
    if (identData.bounding_box_pixel) {
      const [minX, minY, maxX, maxY] = identData.bounding_box_pixel;
      // Map 1260x1418 image coords to canvas coords
      const scaleX = width / 1260;
      const scaleY = height / 1418;

      const bx = minX * scaleX;
      const by = minY * scaleY;
      const bw = (maxX - minX) * scaleX;
      const bh = (maxY - minY) * scaleY;

      ctx.strokeStyle = "rgba(0, 229, 255, 0.75)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(0, 229, 255, 0.15)";
      ctx.fillRect(bx, by, bw, bh);

      // Label Bounding Box
      ctx.fillStyle = "#00E5FF";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("CANDIDATE CONVECTIVE REGION", bx + 6, by + 16);
    }

    // Candidate Center Reticle
    if (identData.candidate_geo && identData.center_pixel) {
      const scaleX = width / 1260;
      const scaleY = height / 1418;
      const cx = identData.center_pixel[0] * scaleX;
      const cy = identData.center_pixel[1] * scaleY;

      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy);
      ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20);
      ctx.stroke();

      ctx.fillStyle = "#00E5FF";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(`CANDIDATE CENTER: ${identData.candidate_geo.lat}°N, ${identData.candidate_geo.lon}°E`, cx + 18, cy - 6);
    }

    // IBTrACS Observed Position Reticle
    if (identData.observed_geo) {
      const obsLat = identData.observed_geo.lat;
      const obsLon = identData.observed_geo.lon;
      
      // Convert geo back to canvas pixel
      const normY = (20.0 - obsLat) / 13.0;
      const normX = (obsLon - 77.0) / 11.0;
      const ox = normX * width;
      const oy = normY * height;

      ctx.strokeStyle = "#00F593";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ox, oy, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#00F593";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(`REAL IBTRACS: ${obsLat}°N, ${obsLon}°E`, ox + 16, oy + 14);

      // Draw Vector line connecting candidate center to IBTrACS observed center
      if (identData.center_pixel) {
        const scaleX = width / 1260;
        const scaleY = height / 1418;
        const cx = identData.center_pixel[0] * scaleX;
        const cy = identData.center_pixel[1] * scaleY;

        ctx.strokeStyle = "rgba(255, 184, 0, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ox, oy);
        ctx.stroke();
        ctx.setLineDash([]);

        if (identData.distance_error_km !== undefined) {
          const midX = (cx + ox) / 2;
          const midY = (cy + oy) / 2;
          ctx.fillStyle = "rgba(4, 8, 17, 0.85)";
          ctx.fillRect(midX - 35, midY - 10, 70, 16);
          ctx.fillStyle = "#FFB800";
          ctx.font = "9px 'JetBrains Mono', monospace";
          ctx.fillText(`ERR: ${identData.distance_error_km} km`, midX - 30, midY + 2);
        }
      }
    }
  }, [identData]);

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ─── 1. Header & SIH Pillar Badge Row ─── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 900, color: "white", display: "flex", alignItems: "center", gap: 10 }}>
            Cyclone Identification
            <span style={{ fontSize: 9.5, padding: "3px 8px", borderRadius: 4, background: "rgba(0, 229, 255, 0.12)", border: "1px solid rgba(0, 229, 255, 0.35)", color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              WITHIN_EVENT · MAE 24.6 KM
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            Satellite-based candidate center localization from thermal IR morphology and spatial validation against IBTrACS ground truth.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(0, 245, 147, 0.1)", border: "1px solid rgba(0, 245, 147, 0.3)", color: "#00F593", fontSize: 10.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            REAL DATA: INSAT-3D + NOAA IBTrACS
          </div>

          <button
            onClick={() => onNavigate && onNavigate("satellites")}
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
            VIEW TRACK <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ─── 2. Main Content Grid: Viewport + Details ─── */}
      <div style={{ display: "flex", gap: 18, minHeight: 0 }}>
        
        {/* Left Column: Satellite Frame Viewport with Overlay */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          
          <div style={{ position: "relative", width: "100%", height: 460, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0, 229, 255, 0.2)", background: "#02040a" }}>
            
            {/* Background Satellite GIF Asset */}
            <img 
              src="/IR_Michaung.gif" 
              alt="INSAT-3D Satellite Observation"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }}
            />

            {/* Interactive Canvas Overlay */}
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

            {/* Top Overlay Legend */}
            <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8 }}>
              <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: "rgba(4, 8, 17, 0.85)", border: "1px solid rgba(0, 229, 255, 0.3)", color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                ◯ CANDIDATE CENTER (BASELINE)
              </span>
              <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: "rgba(4, 8, 17, 0.85)", border: "1px solid rgba(0, 245, 147, 0.3)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                ◯ OBSERVED IBTRACS TRUTH
              </span>
              <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: "rgba(4, 8, 17, 0.85)", border: "1px solid rgba(255, 184, 0, 0.3)", color: "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                --- DISTANCE ERROR (KM)
              </span>
            </div>
          </div>

          {/* ─── Timeline Playback Bar ─── */}
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
                boxShadow: "0 0 15px rgba(0,220,255,0.35)",
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

            {/* Slider */}
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

        {/* Right Column: Detector Metrics & Scientific Provenance */}
        <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          
          {/* Method Disclaimer Banner */}
          <div style={{ background: "rgba(255, 184, 0, 0.08)", border: "1px solid rgba(255, 184, 0, 0.3)", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 9.5, color: "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 5 }}>
              <ShieldAlert size={13} color="#FFB800" />
              SCIENTIFIC METHODOLOGY & DISCLAIMER
            </div>
            <p style={{ fontSize: 10, color: "#E2E8F0", lineHeight: 1.45 }}>
              Baseline Candidate Detector: Uses classical IR thermal convection thresholding and morphological centroid localization. Research baseline — not an operational forecasting model.
            </p>
          </div>

          {/* Active Frame Telemetry Panel */}
          <div className="glass-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.2, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>FRAME TELEMETRY</span>
              <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: "rgba(0, 245, 147, 0.1)", color: "#00F593", fontWeight: 800 }}>
                {identData?.detected ? "CANDIDATE DETECTED" : "NO CANDIDATE"}
              </span>
            </div>

            {[
              ["Timestamp UTC", identData?.timestamp || "N/A"],
              ["Candidate Center Geo", identData?.candidate_geo ? `${identData.candidate_geo.lat}°N, ${identData.candidate_geo.lon}°E` : "N/A"],
              ["Observed IBTrACS Geo", identData?.observed_geo ? `${identData.observed_geo.lat}°N, ${identData.observed_geo.lon}°E` : "N/A"],
              ["Observed Storm Stage", identData?.observed_storm_stage || "N/A"],
              ["Center Error (km)", identData?.distance_error_km !== undefined ? `${identData.distance_error_km} km` : "N/A"],
              ["Convective Area", identData?.features?.convective_area_pixels ? `${identData.features.convective_area_pixels.toLocaleString()} px` : "N/A"],
              ["Peak IR Intensity", identData?.features?.peak_cloud_intensity || "N/A"],
              ["Compactness Score", identData?.features?.compactness_score || "N/A"],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                <span style={{ color: "#64748B" }}>{label}:</span>
                <span style={{ color: label.includes("Error") ? "#FFB800" : label.includes("Observed") ? "#00F593" : label.includes("Candidate") ? "#00E5FF" : "white", fontWeight: 700 }}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Baseline Evaluation Metrics Summary Card */}
          <div className="glass-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.2, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>BASELINE EVALUATION REPORT</span>
              <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: "rgba(0, 229, 255, 0.1)", color: "#00E5FF", fontWeight: 800 }}>
                48 FRAMES
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "8px 10px", borderRadius: 6 }}>
                <div style={{ fontSize: 8.5, color: "#64748B" }}>MAE CENTER ERROR</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#FFB800", marginTop: 2 }}>
                  {evalData?.center_error_mae_km ? `${evalData.center_error_mae_km} km` : "N/A"}
                </div>
              </div>
              <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "8px 10px", borderRadius: 6 }}>
                <div style={{ fontSize: 8.5, color: "#64748B" }}>MEDIAN ERROR</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#00E5FF", marginTop: 2 }}>
                  {evalData?.center_error_median_km ? `${evalData.center_error_median_km} km` : "N/A"}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 9.5, color: "#94A3B8", lineHeight: 1.4 }}>
              Evaluated against 48 chronological INSAT-3D observation frames and ground truth IBTrACS positions.
            </div>
          </div>

          {/* Model Extension Architecture Readiness Card */}
          <div className="glass-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 9.5, color: "#7B61FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 5 }}>
              <Cpu size={13} color="#7B61FF" />
              DEEP LEARNING MODEL EXTENSION POINTS
            </div>
            <div style={{ fontSize: 9, color: "#94A3B8", lineHeight: 1.35 }}>
              Architecture ready for future plug-in inference modules:
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", fontSize: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={{ background: "rgba(123,97,255,0.12)", border: "1px solid rgba(123,97,255,0.3)", padding: "2px 6px", borderRadius: 3, color: "#7B61FF" }}>CNN Segmenter</span>
              <span style={{ background: "rgba(123,97,255,0.12)", border: "1px solid rgba(123,97,255,0.3)", padding: "2px 6px", borderRadius: 3, color: "#7B61FF" }}>YOLO Detector</span>
              <span style={{ background: "rgba(123,97,255,0.12)", border: "1px solid rgba(123,97,255,0.3)", padding: "2px 6px", borderRadius: 3, color: "#7B61FF" }}>Swin Transformer</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
