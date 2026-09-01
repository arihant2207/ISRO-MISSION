import React, { useState, useRef } from "react";
import { Download } from "lucide-react";
import { DOWNLOADS_LIST } from "../data";

export default function DownloadsScreen() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startDownload(fmt: string) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDownloading(fmt);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { 
          clearInterval(intervalRef.current!); 
          setDownloading(null); 
          return 0; 
        }
        return p + 10;
      });
    }, 120);
  }

  return (
    <div style={{ padding: 24 }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "white" }}>Download Center</div>
        <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Export scientific array datasets, vector grids, and video sequences</div>
      </div>

      {/* Central Session Telemetry Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: "16px 22px", 
          marginBottom: 20, 
          display: "flex", 
          gap: 32, 
          alignItems: "center", 
          flexWrap: "wrap",
          border: "1px solid rgba(0, 229, 255, 0.15)"
        }}
      >
        {[
          ["Export Session", "INSAT-3D-MICHAUNG-20231203"],
          ["Frames Array", "INSAT-3D IR 10.8 µm Loop"],
          ["Sensor Region", "Bay of Bengal (Cyclone sector)"],
          ["Epoch Duration", "03 Dec 2023 (Historical)"],
          ["Grid Matrix", "NOAA IBTrACS + INSAT-3D"],
        ].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 9.5, color: "#64748B", letterSpacing: 1, marginBottom: 4 }}>{l.toUpperCase()}</div>
            <div style={{ fontSize: 12, color: "white", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Download Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {DOWNLOADS_LIST.map(({ fmt, desc, size, Icon, color }) => (
          <div 
            key={fmt} 
            className="glass-card" 
            style={{ 
              padding: 24, 
              borderTop: `2.5px solid ${color}`,
              display: "flex", 
              flexDirection: "column",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Holographic grid texture inside card */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.005) 1px, transparent 1px)", backgroundSize: "10px 10px", pointerEvents: "none" }} />
            
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, position: "relative", zIndex: 1 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}12`, border: `1px solid ${color}32`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "white" }}>{fmt}</div>
                <div style={{ fontSize: 10.5, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>{size}</div>
              </div>
            </div>
            
            <div style={{ fontSize: 11.5, color: "#94A3B8", marginBottom: 20, lineHeight: 1.5, flex: 1, position: "relative", zIndex: 1 }}>
              {desc}
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              {downloading === fmt ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 10.5, color: "#64748B" }}>EXPORTING_STREAM...</span>
                    <span style={{ fontSize: 10.5, color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{Math.min(progress, 100)}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ width: `${Math.min(progress, 100)}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.12s", boxShadow: `0 0 6px ${color}` }} />
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => startDownload(fmt)} 
                  style={{ 
                    width: "100%", 
                    padding: "9px 0", 
                    background: `${color}12`, 
                    border: `1px solid ${color}28`, 
                    borderRadius: 6, 
                    color, 
                    fontSize: 11, 
                    fontWeight: 700, 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: 6,
                    letterSpacing: 0.5,
                    transition: "all 0.18s"
                  }}
                  className="hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download size={13} /> DOWNLOAD DATASET
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
