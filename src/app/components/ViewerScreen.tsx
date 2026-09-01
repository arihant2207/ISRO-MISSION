import React, { useState, useEffect } from "react";
import { 
  Play, Pause, SkipForward, SkipBack, Maximize2, Info, AlertCircle, Database, ShieldCheck, Sparkles, ArrowRight
} from "lucide-react";
import SatelliteViewer from "./SatelliteViewer";
import { MICHAUNG_IBTRACS_TRACK, MICHAUNG_METADATA } from "../michaungTrack";

interface ViewerScreenProps {
  onNavigate?: (navId: string) => void;
}

export default function ViewerScreen({ onNavigate }: ViewerScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState("original");
  const [comparison, setComparison] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);

  const FRAMES = ["00:00", "07:30", "15:00", "22:30", "30:00"];
  const FTYPES = [
    "OBSERVED SATELLITE (30m)", 
    "INTERPOLATED FRAME (15m)", 
    "OBSERVED SATELLITE (30m)", 
    "INTERPOLATED FRAME (15m)", 
    "OBSERVED SATELLITE (30m)"
  ];
  
  const MODES = [
    { id: "original", label: "Original Observed" },
    { id: "interpolated", label: "Interpolated" },
    { id: "ground_truth", label: "Ground Truth" },
    { id: "difference", label: "Image Difference" }
  ];

  // Map 5 viewer frame steps to real IBTrACS track points during Cyclone Michaung (Dec 3, 2023)
  const trackIndices = [34, 36, 38, 40, 42];
  const activeTrackPt = MICHAUNG_IBTRACS_TRACK[trackIndices[frameIdx]] || MICHAUNG_IBTRACS_TRACK[34];
  const windKmh = Math.round(activeTrackPt.windKt * 1.852);

  // Derive storm category deterministically from wind speed (kt)
  const getStormStage = (kt: number) => {
    if (kt >= 48) return "Severe Cyclonic Storm";
    if (kt >= 34) return "Cyclonic Storm";
    if (kt >= 28) return "Deep Depression";
    return "Depression";
  };

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrameIdx((current) => (current + 1) % FRAMES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 20, gap: 14, overflow: "hidden" }}>
      
      {/* ─── Top Control Row ─── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", flexShrink: 0, zIndex: 5 }}>
        
        {/* Custom Segmented Control */}
        <div className="segmented-control">
          {MODES.map((m) => (
            <button 
              key={m.id} 
              onClick={() => setMode(m.id)} 
              className={`segmented-btn ${mode === m.id ? "active" : ""}`}
            >
              {m.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 3-Panel comparison toggle */}
        <button 
          onClick={() => setComparison(!comparison)} 
          style={{ 
            padding: "6px 14px", 
            borderRadius: 8, 
            fontSize: 11, 
            fontWeight: 700, 
            cursor: "pointer", 
            background: comparison ? "rgba(123,97,255,0.18)" : "rgba(255,255,255,0.04)", 
            color: comparison ? "#7B61FF" : "#64748B", 
            border: comparison ? "1px solid rgba(123,97,255,0.4)" : "1px solid rgba(255,255,255,0.08)",
            letterSpacing: 0.5,
            transition: "all 0.2s"
          }}
        >
          ⊞ 3-PANEL COMPARISON
        </button>

        <div style={{ flex: 1 }} />

        {/* Provenance Status Badges & Navigation CTA */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ padding: "5px 12px", borderRadius: 6, fontSize: 10, background: "rgba(255, 184, 0, 0.08)", border: "1px solid rgba(255, 184, 0, 0.3)", color: "#FFB800", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", display: "flex", alignItems: "center", gap: 5 }}>
            <AlertCircle size={12} color="#FFB800" />
            INTERPOLATION DEMONSTRATION · MODEL PENDING
          </div>

          <button
            onClick={() => onNavigate && onNavigate("metrics")}
            style={{
              background: "rgba(123, 97, 255, 0.15)",
              border: "1px solid rgba(123, 97, 255, 0.4)",
              borderRadius: 6,
              color: "#7B61FF",
              fontSize: 10,
              fontWeight: 800,
              padding: "5px 12px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            ANALYZE TEMPORAL GAP <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ─── Main Content Grid: Viewport + Details ─── */}
      <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
        
        {/* Map Viewport Column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
          
          {comparison ? (
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, borderRadius: 12, overflow: "hidden" }}>
              {[
                { mode: "original", label: "OBSERVED (30 min INSAT-3D)", badge: "REAL OBSERVATION", border: "rgba(0, 245, 147, 0.3)" },
                { mode: "interpolated", label: "INTERPOLATED FRAME (15 min)", badge: "DEMONSTRATION", border: "rgba(123, 97, 255, 0.3)" },
                { mode: "difference", label: "IMAGE DIFFERENCE — COMPUTED", badge: "DERIVED CALCULATION", border: "rgba(255, 77, 109, 0.3)" },
              ].map(({ mode: m, label, badge, border }) => (
                <div key={m} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: `1px solid ${border}`, background: "#040811" }}>
                  <SatelliteViewer mode={m} isPlaying={isPlaying} frameIdx={frameIdx} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 14px", background: "rgba(8,17,31,0.9)", fontSize: 9.5, color: "#E2E8F0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{label}</span>
                    <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: "rgba(255,255,255,0.08)", color: "#00E5FF", fontWeight: 800 }}>{badge}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, position: "relative", borderRadius: 12, overflow: "hidden", border: mode === "difference" ? "1px solid rgba(255,77,109,0.3)" : "1px solid rgba(0,220,255,0.18)", boxShadow: "0 0 40px rgba(0,220,255,0.05)" }}>
              <SatelliteViewer mode={mode} isPlaying={isPlaying} frameIdx={frameIdx} />
            </div>
          )}

          {/* ─── Timeline Playback Bar ─── */}
          <div className="glass-panel" style={{ padding: "10px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <button 
              onClick={() => setFrameIdx(Math.max(0, frameIdx - 1))} 
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4 }}
            >
              <SkipBack size={16} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              style={{ 
                width: 36, height: 36, 
                borderRadius: "50%", 
                background: "linear-gradient(135deg,#00E5FF,#7B61FF)", 
                border: "none", 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                boxShadow: "0 0 15px rgba(0,220,255,0.35)",
                transition: "transform 0.1s"
              }}
            >
              {isPlaying ? <Pause size={14} color="white" /> : <Play size={14} color="white" style={{ marginLeft: 2 }} />}
            </button>
            <button 
              onClick={() => setFrameIdx((frameIdx + 1) % FRAMES.length)} 
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4 }}
            >
              <SkipForward size={16} />
            </button>

            {/* Custom Interactive Timeline displaying RAW vs. PROTOTYPE INTERPOLATED frames */}
            <div style={{ flex: 1, padding: "0 8px" }}>
              <div style={{ position: "relative", height: 20 }}>
                {/* Timeline track */}
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, marginTop: -1.5, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                  <div style={{ width: `${(frameIdx / 4) * 100}%`, height: "100%", background: "#00E5FF", borderRadius: 2, transition: "width 0.25s" }} />
                </div>
                {/* Frame points */}
                {FRAMES.map((_, i) => {
                  const isSynthesized = FTYPES[i].includes("INTERPOLATED");
                  return (
                    <button 
                      key={i} 
                      onClick={() => setFrameIdx(i)} 
                      style={{ 
                        position: "absolute", 
                        top: "50%", 
                        left: `${(i / 4) * 100}%`, 
                        transform: "translate(-50%,-50%)", 
                        width: 10, height: 10, 
                        borderRadius: "50%", 
                        background: i === frameIdx ? "#FFFFFF" : isSynthesized ? "#7B61FF" : "#00F593", 
                        border: i === frameIdx ? "3px solid #00E5FF" : "none", 
                        cursor: "pointer", 
                        boxShadow: i === frameIdx ? "0 0 10px #00E5FF" : isSynthesized ? "0 0 6px #7B61FF" : "none",
                        transition: "all 0.2s"
                      }} 
                    />
                  );
                })}
              </div>
              
              {/* Ticks and Labels */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                {FRAMES.map((f, i) => {
                  const isSynthesized = FTYPES[i].includes("INTERPOLATED");
                  return (
                    <div key={f} style={{ textAlign: "center", fontSize: 9, color: i === frameIdx ? "#00E5FF" : "#64748B", fontFamily: "'JetBrains Mono',monospace" }}>
                      {f}
                      <div style={{ fontSize: 7, color: isSynthesized ? "#7B61FF" : "#00F593", fontWeight: 800 }}>
                        {isSynthesized ? "INTERPOLATED" : "OBSERVED"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <span style={{ fontSize: 11, color: "#00E5FF", fontFamily: "'JetBrains Mono',monospace", minWidth: 52, fontWeight: 700 }}>{FRAMES[frameIdx]}m</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}><Maximize2 size={14} /></button>
          </div>
        </div>

        {/* Right Sidebar Details Column */}
        <div style={{ width: 285, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          
          {/* Frame Metadata Panel */}
          <div className="glass-panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.5, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Info size={11} color="#00E5FF" /> FRAME_METADATA</span>
              <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: "rgba(0, 245, 147, 0.1)", color: "#00F593", fontWeight: 800 }}>REAL IBTRACS</span>
            </div>
            
            {[
              ["Satellite", "INSAT-3D (10.8 µm IR)"],
              ["Timestamp", `${activeTrackPt.time} UTC`],
              ["Event", "Cyclone Michaung (Dec 2023)"],
              ["Coordinates", `${activeTrackPt.lat.toFixed(1)}°N, ${activeTrackPt.lon.toFixed(1)}°E`],
              ["Wind Speed", `${windKmh} km/h (${activeTrackPt.windKt} kt)`],
              ["Central Pressure", `${activeTrackPt.presHpa} hPa`],
              ["Storm Stage", getStormStage(activeTrackPt.windKt)],
              ["Data Source", "NOAA IBTrACS"],
              ["Model Status", "MODEL NOT CONNECTED"],
              ["Processing", mode === "difference" ? "IMAGE DIFFERENCE — COMPUTED" : FTYPES[frameIdx]],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, gap: 6 }}>
                <span style={{ fontSize: 10, color: "#64748B" }}>{l}</span>
                <span style={{ fontSize: 10, color: l.includes("Source") || l.includes("Satellite") ? "#00F593" : l.includes("Status") ? "#FFB800" : "white", fontFamily: "'JetBrains Mono',monospace", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 155, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Next Action CTA Card */}
          <div className="glass-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 9.5, color: "#7B61FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              NEXT STEP IN DEMO FLOW
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "white" }}>
              Analyze Temporal Gap
            </div>
            <button
              onClick={() => onNavigate && onNavigate("metrics")}
              style={{
                background: "rgba(123, 97, 255, 0.15)",
                border: "1px solid rgba(123, 97, 255, 0.4)",
                borderRadius: 6,
                color: "#7B61FF",
                fontSize: 10.5,
                fontWeight: 800,
                padding: "7px 12px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              ANALYZE TEMPORAL GAP <ArrowRight size={13} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
