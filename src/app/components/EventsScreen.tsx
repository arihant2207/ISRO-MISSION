import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { EVENTS } from "../data";

export default function EventsScreen() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div style={{ padding: 24 }}>
      
      {/* Header alert panel */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "white" }}>Event Detection</div>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Anomaly detection models highlighting severe weather cells in real-time streams</div>
        </div>
        <div 
          style={{ 
            padding: "8px 16px", 
            borderRadius: 8, 
            background: "rgba(255,59,92,0.08)", 
            border: "1px solid rgba(255,59,92,0.3)", 
            fontSize: 12, 
            color: "#FF3B5C", 
            fontWeight: 700, 
            display: "flex", 
            alignItems: "center", 
            gap: 8,
            letterSpacing: 0.5
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B5C", animation: "pulse-dot 1.4s infinite" }} />
          5 ACTIVE DETECTIONS
        </div>
      </div>

      {/* Grid of Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {EVENTS.map((ev) => {
          const isSel = selected === ev.id;
          return (
            <div 
              key={ev.id} 
              onClick={() => setSelected(isSel ? null : ev.id)} 
              className="glass-panel" 
              style={{ 
                padding: 20, 
                cursor: "pointer", 
                border: `1px solid ${isSel ? ev.color : "rgba(0, 229, 255, 0.12)"}`, 
                boxShadow: isSel ? `0 0 25px ${ev.color}15` : "none", 
                transition: "all 0.22s ease",
                position: "relative"
              }}
            >
              {/* Active neon highlight corner marker */}
              {isSel && (
                <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, background: ev.color, borderRadius: "0 0 4px 0" }} />
              )}

              {/* Title & Type */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div 
                    style={{ 
                      position: "relative", 
                      width: 38, 
                      height: 38, 
                      borderRadius: 8, 
                      background: `${ev.color}12`, 
                      border: `1px solid ${ev.color}28`, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      flexShrink: 0 
                    }}
                  >
                    <AlertTriangle size={15} style={{ color: ev.color }} />
                    {ev.severity === "critical" && (
                      <div style={{ position: "absolute", inset: -4, borderRadius: 12, border: `1px solid ${ev.color}25`, animation: "pulse-dot 1.5s infinite" }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: ev.color, fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>{ev.type.toUpperCase()}</div>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: "white", fontFamily: "var(--font-heading)" }}>{ev.name}</div>
                  </div>
                </div>
                <span 
                  style={{ 
                    fontSize: 9, 
                    fontWeight: 700, 
                    padding: "3px 9px", 
                    borderRadius: 4, 
                    background: `${ev.color}12`, 
                    color: ev.color, 
                    border: `1px solid ${ev.color}28`, 
                    letterSpacing: 0.5, 
                    flexShrink: 0 
                  }}
                >
                  {ev.severity.toUpperCase()}
                </span>
              </div>

              {/* Coordinates Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14, background: "rgba(0,0,0,0.14)", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.01)" }}>
                {[
                  ["Coverage Area", ev.location],
                  ["Spatial Coords", ev.coords],
                  ["Detection Time", ev.time],
                  ["Sensor Metrics", ev.detail]
                ].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 9.5, color: "#64748B", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 11.5, color: "#94A3B8", fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Confidence Meter */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: "#64748B" }}>AI Detection Confidence</span>
                  <span style={{ fontSize: 11, color: ev.color, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{ev.confidence}%</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                  <div 
                    style={{ 
                      width: `${ev.confidence}%`, 
                      height: "100%", 
                      background: ev.color, 
                      borderRadius: 2, 
                      boxShadow: `0 0 6px ${ev.color}` 
                    }} 
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
