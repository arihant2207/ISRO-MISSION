import React from "react";
import { Cpu } from "lucide-react";

export default function FutureMLIntegration() {
  const pipelineNodes = [
    { id: 1, title: "SATELLITE SEQUENCE", subtitle: "INSAT-3D IR 10.8 µm", status: "REAL DATA", color: "#00F593" },
    { id: 2, title: "PREPROCESSING", subtitle: "IBTrACS Geo-Ref", status: "REAL DATA", color: "#00F593" },
    { id: 3, title: "MOTION / TEMPORAL", subtitle: "Optical Flow Vector", status: "PROTOTYPE", color: "#00E5FF" },
    { id: 4, title: "TEMPORAL ML MODEL", subtitle: "Motion-Aware VFI", status: "FUTURE ML", color: "#FFB800" },
    { id: 5, title: "INTERMEDIATE FRAME", subtitle: "15m Interpolation Blend", status: "PROTOTYPE", color: "#7B61FF" },
    { id: 6, title: "GROUND-TRUTH EVAL", subtitle: "SSIM / PSNR Check", status: "FUTURE ML", color: "#FFB800" }
  ];

  return (
    <div 
      className="glass-panel"
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        background: "rgba(7, 18, 33, 0.95)",
        borderRadius: 12,
        border: "1px solid rgba(123, 97, 255, 0.2)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(123, 97, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={15} color="#7B61FF" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 900, color: "white", textTransform: "uppercase" }}>
              System Pipeline & Future ML Integration Roadmap
            </div>
            <div style={{ fontSize: 9.5, color: "#94A3B8" }}>
              End-to-End Processing Sequence & Future Trained Model Connection Path
            </div>
          </div>
        </div>

        <span 
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            background: "rgba(123, 97, 255, 0.12)",
            border: "1px solid rgba(123, 97, 255, 0.35)",
            color: "#7B61FF",
            fontSize: 10,
            fontWeight: 800,
            fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          SYSTEM PIPELINE ROADMAP
        </span>
      </div>

      {/* Horizontal Pipeline Node Sequence */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 8,
          alignItems: "stretch"
        }}
      >
        {pipelineNodes.map((node) => (
          <div 
            key={node.id}
            style={{
              background: node.status === "REAL DATA" ? "rgba(0, 245, 147, 0.05)" : "rgba(4, 10, 24, 0.6)",
              border: `1px solid ${node.color}35`,
              borderRadius: 8,
              padding: "10px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              alignItems: "center",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 8.5, color: "#64748B", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              STAGE 0{node.id}
            </div>

            <div style={{ fontSize: 9.5, fontWeight: 900, color: "white", lineHeight: 1.2, fontFamily: "var(--font-heading)" }}>
              {node.title}
            </div>

            <div style={{ fontSize: 8, color: "#94A3B8", margin: "2px 0" }}>
              {node.subtitle}
            </div>

            <div 
              style={{
                marginTop: "auto",
                padding: "2px 6px",
                borderRadius: 4,
                background: `${node.color}18`,
                color: node.color,
                fontSize: 7.5,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                border: `1px solid ${node.color}35`
              }}
            >
              {node.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
