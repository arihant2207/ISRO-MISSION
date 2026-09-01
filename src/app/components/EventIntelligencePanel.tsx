import React from "react";
import { ShieldCheck, Database, Server, Radio, Cpu, Layers, AlertCircle, FileCheck } from "lucide-react";
import { MICHAUNG_METADATA } from "../michaungTrack";

export default function EventIntelligencePanel() {
  return (
    <div 
      className="glass-panel"
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "rgba(7, 18, 33, 0.95)",
        borderRadius: 12,
        border: "1px solid rgba(0, 229, 255, 0.16)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(123, 97, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Radio size={15} color="#7B61FF" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 900, color: "white", textTransform: "uppercase" }}>
              Event Intelligence & System Diagnostics
            </div>
            <div style={{ fontSize: 9.5, color: "#94A3B8" }}>
              Mission Control Telemetry & Data Source Verification
            </div>
          </div>
        </div>

        {/* Historical Event Badge */}
        <span 
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            background: "rgba(255, 59, 92, 0.12)",
            border: "1px solid rgba(255, 59, 92, 0.35)",
            color: "#FF3B5C",
            fontSize: 10,
            fontWeight: 800,
            fontFamily: "'JetBrains Mono', monospace",
            display: "inline-flex",
            alignItems: "center",
            gap: 5
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B5C", animation: "pulse-dot 1.2s infinite" }} />
          HISTORICAL EVENT
        </span>
      </div>

      {/* Grid of Intelligence Metadata */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Target Cyclone", val: MICHAUNG_METADATA.name, color: "#00E5FF", badge: "Bay of Bengal" },
          { label: "Primary Satellite", val: MICHAUNG_METADATA.satellite, color: "#7B61FF", badge: "GEO 82°E" },
          { label: "Observation Channel", val: MICHAUNG_METADATA.channel, color: "#00F593", badge: "Thermal IR" },
          { label: "Event Window", val: "December 2023", color: "#FFB800", badge: "Historical" }
        ].map((item, idx) => (
          <div 
            key={idx}
            style={{
              background: "rgba(4, 8, 17, 0.5)",
              border: "1px solid rgba(0, 229, 255, 0.08)",
              borderRadius: 8,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}
          >
            <div style={{ fontSize: 9, color: "#64748B", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {item.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: item.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {item.val}
            </div>
            <div style={{ fontSize: 8.5, color: "#94A3B8", marginTop: 2 }}>
              {item.badge}
            </div>
          </div>
        ))}
      </div>

      {/* System Status Table */}
      <div 
        style={{
          background: "rgba(4, 8, 17, 0.6)",
          border: "1px solid rgba(0, 229, 255, 0.1)",
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10
        }}
      >
        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
          System Integration Status Matrix
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
          {/* Item 1: IBTrACS Track */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "rgba(0, 245, 147, 0.05)", border: "1px solid rgba(0, 245, 147, 0.2)", borderRadius: 6 }}>
            <span style={{ color: "#94A3B8" }}>Track Dataset:</span>
            <span style={{ color: "#00F593", fontWeight: 800 }}>YES (IBTrACS CSV)</span>
          </div>

          {/* Item 2: Satellite Imagery */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "rgba(0, 229, 255, 0.05)", border: "1px solid rgba(0, 229, 255, 0.2)", borderRadius: 6 }}>
            <span style={{ color: "#94A3B8" }}>Satellite Imagery:</span>
            <span style={{ color: "#00E5FF", fontWeight: 800 }}>YES (INSAT-3D GIF)</span>
          </div>

          {/* Item 3: ML Inference */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "rgba(123, 97, 255, 0.05)", border: "1px solid rgba(123, 97, 255, 0.2)", borderRadius: 6 }}>
            <span style={{ color: "#94A3B8" }}>ML Inference:</span>
            <span style={{ color: "#7B61FF", fontWeight: 800 }}>DEMONSTRATION</span>
          </div>

          {/* Item 4: Backend Integration */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "rgba(255, 184, 0, 0.05)", border: "1px solid rgba(255, 184, 0, 0.2)", borderRadius: 6 }}>
            <span style={{ color: "#94A3B8" }}>Backend ML Link:</span>
            <span style={{ color: "#FFB800", fontWeight: 800 }}>NOT CONNECTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
