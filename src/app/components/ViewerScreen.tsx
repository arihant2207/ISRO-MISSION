import React, { useState, useEffect } from "react";
import { 
  Play, Pause, SkipForward, SkipBack, Maximize2, Info
} from "lucide-react";
import SatelliteViewer from "./SatelliteViewer";
import { G } from "../data";

export default function ViewerScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState("original");
  const [comparison, setComparison] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);

  const FRAMES = ["00:00", "07:30", "15:00", "22:30", "30:00"];
  const FTYPES = ["RAW INPUT (30m)", "AI SYNTHESIZED (7.5m)", "RAW INPUT (30m)", "AI SYNTHESIZED (7.5m)", "RAW INPUT (30m)"];
  
  const MODES = [
    { id: "original", label: "Original" },
    { id: "interpolated", label: "AI Generated" },
    { id: "ground_truth", label: "Ground Truth" },
    { id: "difference", label: "Difference" }
  ];

  const WEATHER_DATA = [
    { wind: 162, pressure: 970 },
    { wind: 165, pressure: 968 },
    { wind: 167, pressure: 967 },
    { wind: 169, pressure: 965 },
    { wind: 172, pressure: 962 }
  ];

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

        {/* Holographic Status Chips */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, background: "rgba(0,255,147,0.08)", border: "1px solid rgba(0,255,147,0.22)", color: "#00F593", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>
            AI_CONFIDENCE: 94.2%
          </div>
          <div style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, background: "rgba(0,220,255,0.08)", border: "1px solid rgba(0,220,255,0.22)", color: "#00E5FF", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>
            INSAT-3DS // 30→7.5 MIN
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid: Map display + details ─── */}
      <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
        
        {/* Map Panel Column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
          
          {comparison ? (
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, borderRadius: 12, overflow: "hidden" }}>
              {[
                { mode: "original", label: "ORIGINAL (30 min raw)", border: "rgba(255,255,255,0.08)" },
                { mode: "interpolated", label: "AI SYNTHESIZED (7.5 min frame)", border: "rgba(0, 220, 255, 0.28)" },
                { mode: "difference", label: "DIFFERENCE GAP CONTROLS", border: "rgba(255, 77, 109, 0.25)" },
              ].map(({ mode: m, label, border }) => (
                <div key={m} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: `1px solid ${border}`, background: "#040811" }}>
                  <SatelliteViewer mode={m} isPlaying={isPlaying} frameIdx={frameIdx} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 14px", background: "rgba(8,17,31,0.85)", fontSize: 10, color: "#94A3B8", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    {label}
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
              className="hover:text-cyan-400"
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
              className="hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={14} color="white" /> : <Play size={14} color="white" style={{ marginLeft: 2 }} />}
            </button>
            <button 
              onClick={() => setFrameIdx((frameIdx + 1) % FRAMES.length)} 
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 4 }}
              className="hover:text-cyan-400"
            >
              <SkipForward size={16} />
            </button>

            {/* Custom Interactive Timeline displaying RAW vs. SYNTHESIZED missing frames */}
            <div style={{ flex: 1, padding: "0 8px" }}>
              <div style={{ position: "relative", height: 20 }}>
                {/* Timeline track */}
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, marginTop: -1.5, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                  <div style={{ width: `${(frameIdx / 4) * 100}%`, height: "100%", background: "#00E5FF", borderRadius: 2, transition: "width 0.25s" }} />
                </div>
                {/* Frame points */}
                {FRAMES.map((_, i) => {
                  const isSynthesized = FTYPES[i].includes("AI_SYNTHESIZED") || FTYPES[i].includes("SYNTHESIZED");
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
                        background: i === frameIdx ? "#FFFFFF" : isSynthesized ? "#7B61FF" : "rgba(0, 220, 255, 0.4)", 
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
                  const isSynthesized = FTYPES[i].includes("AI_SYNTHESIZED") || FTYPES[i].includes("SYNTHESIZED");
                  return (
                    <div key={f} style={{ textAlign: "center", fontSize: 9, color: i === frameIdx ? "#00E5FF" : "#64748B", fontFamily: "'JetBrains Mono',monospace" }}>
                      {f}
                      <div style={{ fontSize: 7.5, color: isSynthesized ? "#7B61FF" : "#475569", fontWeight: i === frameIdx ? 700 : 400 }}>
                        {isSynthesized ? "AI_GEN" : "INPUT"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <span style={{ fontSize: 11, color: "#00E5FF", fontFamily: "'JetBrains Mono',monospace", minWidth: 52, fontWeight: 700 }}>{FRAMES[frameIdx]}m</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }} className="hover:text-white"><Maximize2 size={14} /></button>
          </div>
        </div>

        {/* Right Sidebar Details Column */}
        <div style={{ width: 255, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          
          {/* Frame Metadata Panel displaying improved Telemetry items */}
          <div className="glass-panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.5, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Info size={11} color="#00E5FF" /> FRAME_METADATA_HUD
            </div>
            {[
              ["Satellite", "INSAT-3DS"],
              ["Timestamp", `2026-06-26 15:27:${FRAMES[frameIdx]} IST`],
              ["Frame No.", `0${frameIdx + 1} / 05`],
              ["AI Confidence", "94.20%"],
              ["Wind Speed", `${WEATHER_DATA[frameIdx].wind} KM/H`],
              ["Core Pressure", `${WEATHER_DATA[frameIdx].pressure} hPa`],
              ["Interpolation", mode === "difference" ? "DIFFERENCE_CALC" : FTYPES[frameIdx].toUpperCase()],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                <span style={{ fontSize: 11, color: "#64748B" }}>{l}</span>
                <span style={{ fontSize: 11, color: "white", fontFamily: "'JetBrains Mono',monospace", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 145, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Quick Metrics Panel */}
          <div className="glass-panel" style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.5, fontWeight: 700, marginBottom: 12 }}>QUICK_METRICS</div>
            {[
              ["SSIM Accuracy", "0.942", "#00F593"],
              ["PSNR Ratio", "36.1 dB", "#00E5FF"],
              ["LPIPS Distortion", "0.031", "#7B61FF"],
              ["Inference Time", "2.3 sec", "#FFB800"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "#64748B" }}>{l}</span>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Temporal Resolution progress steps */}
          <div className="glass-panel" style={{ padding: 16, border: "1px solid rgba(123,97,255,0.22)" }}>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.5, fontWeight: 700, marginBottom: 14 }}>RESOLUTION_TIER</div>
            {[
              ["30 min", "Raw Input", "#64748B", false],
              ["15 min", "2× Interpolated", "#7B61FF", true],
              ["7.5 min", "4× Synthesized", "#00E5FF", true],
            ].map(([r, lbl, c, glow], i) => (
              <div key={r}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: glow ? `0 0 8px ${c}` : "none" }} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{r}</span>
                  </div>
                  <span style={{ fontSize: 9.5, color: glow ? c : "#64748B", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{lbl.toUpperCase()}</span>
                </div>
                {i < 2 && <div style={{ width: 1, height: 12, background: "rgba(0,220,255,0.18)", marginLeft: 3.5, marginTop: 2, marginBottom: 2 }} />}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
