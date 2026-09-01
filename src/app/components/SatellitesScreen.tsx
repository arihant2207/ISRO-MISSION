import React from "react";
import { Satellite as SatIcon, Wifi, ArrowRight, Navigation } from "lucide-react";
import { SATELLITES } from "../data";
import CycloneTrackMap from "./CycloneTrackMap";

interface SatellitesScreenProps {
  onNavigate?: (navId: string) => void;
}

export default function SatellitesScreen({ onNavigate }: SatellitesScreenProps) {
  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 1600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 900, color: "white", display: "flex", alignItems: "center", gap: 10 }}>
            Track Analysis & Geospatial Intelligence
            <span style={{ fontSize: 9.5, padding: "3px 8px", borderRadius: 4, background: "rgba(0, 245, 147, 0.1)", border: "1px solid rgba(0, 245, 147, 0.3)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              HISTORICAL TRACK
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            Geospatial storm trajectory tracking, Haversine motion analysis, and satellite payload network telemetry.
          </div>
        </div>

        <button
          onClick={() => onNavigate && onNavigate("viewer")}
          style={{
            background: "rgba(0, 229, 255, 0.15)",
            border: "1px solid rgba(0, 229, 255, 0.4)",
            borderRadius: 8,
            color: "#00E5FF",
            fontSize: 11,
            fontWeight: 800,
            padding: "8px 16px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          OPEN SATELLITE FRAMES <ArrowRight size={14} />
        </button>
      </div>

      {/* ─── 1. Primary Real IBTrACS Cyclone Track Map Component ─── */}
      <CycloneTrackMap />

      {/* ─── 2. Satellite Payload Network ─── */}
      <div>
        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <SatIcon size={14} color="#00E5FF" />
          Observation Satellite Payload Network — Geostationary & LEO Nodes
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {SATELLITES.map((sat) => (
            <div key={sat.id} className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 900, color: "white" }}>{sat.id}</div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{sat.orbit}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 12, background: sat.status === "active" ? "rgba(0,255,136,0.08)" : "rgba(255,184,0,0.08)", border: `1px solid ${sat.status === "active" ? "rgba(0,255,136,0.25)" : "rgba(255,184,0,0.25)"}` }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: sat.status === "active" ? "#00FF88" : "#FFB800", animation: sat.status === "active" ? "pulse-dot 2s infinite" : "none" }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: sat.status === "active" ? "#00FF88" : "#FFB800" }}>{sat.status.toUpperCase()}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Coverage Domain:</span>
                  <span style={{ color: "white", fontWeight: 700 }}>{sat.coverage}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Cloud Cover:</span>
                  <span style={{ color: "#00E5FF", fontWeight: 700 }}>{sat.cloud}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Scan Interval:</span>
                  <span style={{ color: "#00F593", fontWeight: 700 }}>{sat.refresh}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
