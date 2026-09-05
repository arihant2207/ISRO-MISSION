import React from "react";
import { Satellite, Cpu, CheckCircle2, AlertTriangle, X, Shield, Activity, Database } from "lucide-react";

interface SystemStatusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SystemStatusDrawer({ isOpen, onClose }: SystemStatusDrawerProps) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: "fixed",
        top: 60,
        right: 24,
        width: 380,
        maxHeight: "80vh",
        overflowY: "auto",
        zIndex: 1000,
        background: "rgba(7, 18, 33, 0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(0, 229, 255, 0.25)",
        borderRadius: 12,
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 229, 255, 0.15)",
        padding: 18,
        color: "white",
        fontFamily: "var(--font-sans, system-ui, sans-serif)"
      }}
      className="scroll-hide animate-fade-in"
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(0, 229, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(0, 229, 255, 0.3)" }}>
            <Satellite size={16} color="#00E5FF" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.5, color: "#00E5FF" }}>SYSTEM STATUS</div>
            <div style={{ fontSize: 9, color: "#64748B", fontWeight: 600 }}>MoES / IMD Prototype Telemetry • SIH26070</div>
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer", padding: 4 }}
        >
          <X size={16} />
        </button>
      </div>

      {/* 1. DATA SOURCES */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 800, letterSpacing: 1.2, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <Database size={12} color="#00E5FF" />
          DATA SOURCES
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { name: "INSAT-3D Thermal IR", status: "Connected / Demo Data", color: "#00F593", tagBg: "rgba(0,245,147,0.12)" },
            { name: "INSAT-3DR Imager", status: "Configured / Demo Data", color: "#FFB800", tagBg: "rgba(255,184,0,0.12)" },
            { name: "EOS-06 / SCATSAT", status: "Optional / Available Dataset", color: "#00E5FF", tagBg: "rgba(0,229,255,0.12)" },
            { name: "Historical Cyclone Dataset", status: "Available (IBTrACS v04r01)", color: "#00F593", tagBg: "rgba(0,245,147,0.12)" }
          ].map((src) => (
            <div key={src.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(4, 8, 17, 0.5)", padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#CBD5E1" }}>{src.name}</span>
              <span style={{ fontSize: 8.5, padding: "2px 6px", borderRadius: 4, background: src.tagBg, color: src.color, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                {src.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. MODEL STATUS */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 800, letterSpacing: 1.2, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <Cpu size={12} color="#7B61FF" />
          MODEL STATUS
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { name: "Candidate Detection", status: "Ready", color: "#00F593" },
            { name: "Pattern Classification", status: "Ready", color: "#00F593" },
            { name: "Intensity Estimation", status: "Experimental", color: "#FFB800" },
            { name: "Track Forecast", status: "Experimental", color: "#FFB800" },
            { name: "Temporal Enhancement", status: "Research Prototype", color: "#7B61FF" }
          ].map((mod) => (
            <div key={mod.name} style={{ background: "rgba(4, 8, 17, 0.5)", padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 600 }}>{mod.name}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: mod.color, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{mod.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DATA QUALITY */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 800, letterSpacing: 1.2, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <Activity size={12} color="#00E5FF" />
          DATA QUALITY
        </div>
        <div style={{ background: "rgba(4, 8, 17, 0.5)", padding: 10, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748B" }}>Timestamp:</span><span style={{ color: "white" }}>03–05 Dec 2023</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748B" }}>Missing Frames:</span><span style={{ color: "#00F593" }}>0 (48/48 complete)</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748B" }}>Cloud Contam:</span><span style={{ color: "#00E5FF" }}>Low (Convective Core)</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748B" }}>Geospatial:</span><span style={{ color: "#00F593" }}>Valid (Nadir 4.0km)</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ color: "#64748B", fontWeight: 700 }}>Input Quality Score:</span>
            <span style={{ color: "#00E5FF", fontWeight: 900 }}>98.2%</span>
          </div>
        </div>
      </div>

      {/* 4. SYSTEM MODE */}
      <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(123, 97, 255, 0.1)", border: "1px solid rgba(123, 97, 255, 0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9.5, color: "#CBD5E1", fontWeight: 700 }}>SYSTEM MODE</span>
        <span style={{ fontSize: 9, fontWeight: 800, color: "#7B61FF", fontFamily: "'JetBrains Mono', monospace" }}>Research / Prototype Mode</span>
      </div>
    </div>
  );
}
