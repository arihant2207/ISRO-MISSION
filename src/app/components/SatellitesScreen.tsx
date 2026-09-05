import React, { useState, useEffect } from "react";
import { Satellite as SatIcon, ArrowRight, Database, Layers, GitMerge, AlertTriangle, CheckCircle2, XCircle, Info, ShieldCheck, Activity } from "lucide-react";
import CycloneTrackMap from "./CycloneTrackMap";
import {
  fetchSatelliteSources,
  fetchSatelliteComparison,
  fetchSatelliteFusionStatus,
  SatelliteSource,
  SourceComparisonResponse,
  FusionStatusResponse
} from "../services/api";

interface SatellitesScreenProps {
  onNavigate?: (navId: string) => void;
}

export default function SatellitesScreen({ onNavigate }: SatellitesScreenProps) {
  const [sources, setSources] = useState<SatelliteSource[]>([]);
  const [comparison, setComparison] = useState<SourceComparisonResponse | null>(null);
  const [fusionStatus, setFusionStatus] = useState<FusionStatusResponse | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("INSAT3D_IR");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [srcs, comp, fusion] = await Promise.all([
          fetchSatelliteSources(),
          fetchSatelliteComparison(),
          fetchSatelliteFusionStatus()
        ]);
        setSources(srcs);
        setComparison(comp);
        setFusionStatus(fusion);
      } catch (err) {
        console.error("Failed to load satellite intelligence data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedSource = sources.find((s) => s.source_id === selectedSourceId) || sources[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return {
          bg: "rgba(0, 255, 136, 0.1)",
          border: "rgba(0, 255, 136, 0.3)",
          color: "#00FF88",
          icon: <CheckCircle2 size={12} color="#00FF88" />,
          label: "CONNECTED"
        };
      case "CONFIGURED":
        return {
          bg: "rgba(255, 184, 0, 0.1)",
          border: "rgba(255, 184, 0, 0.3)",
          color: "#FFB800",
          icon: <AlertTriangle size={12} color="#FFB800" />,
          label: "CONFIGURED"
        };
      case "NOT_CONNECTED":
        return {
          bg: "rgba(148, 163, 184, 0.1)",
          border: "rgba(148, 163, 184, 0.3)",
          color: "#94A3B8",
          icon: <Info size={12} color="#94A3B8" />,
          label: "NOT CONNECTED"
        };
      case "UNAVAILABLE":
      default:
        return {
          bg: "rgba(239, 68, 68, 0.08)",
          border: "rgba(239, 68, 68, 0.25)",
          color: "#F87171",
          icon: <XCircle size={12} color="#F87171" />,
          label: "UNAVAILABLE"
        };
    }
  };

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 1600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 900, color: "white", display: "flex", alignItems: "center", gap: 10 }}>
            Multi-Source Satellite Intelligence Architecture
            <span style={{ fontSize: 9.5, padding: "3px 8px", borderRadius: 4, background: "rgba(0, 229, 255, 0.1)", border: "1px solid rgba(0, 229, 255, 0.3)", color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              PHASE 8 MULTI-SOURCE
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            Multi-satellite source registry, generic data provider interface, normalized spectral channels, and fusion readiness pipeline.
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

      {/* ─── 2. Satellite Source Registry Cards ─── */}
      <div>
        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <SatIcon size={14} color="#00E5FF" />
          Satellite Source Registry — Verified Local Assets & Configuration Nodes
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {sources.map((sat) => {
            const badge = getStatusBadge(sat.status);
            const isSelected = sat.source_id === selectedSourceId;

            return (
              <div
                key={sat.source_id}
                onClick={() => setSelectedSourceId(sat.source_id)}
                className="glass-panel"
                style={{
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  cursor: "pointer",
                  border: isSelected ? "1px solid rgba(0, 229, 255, 0.6)" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isSelected ? "0 0 15px rgba(0, 229, 255, 0.15)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 900, color: "white" }}>{sat.platform}</div>
                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{sat.instrument}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 12, background: badge.bg, border: `1px solid ${badge.border}` }}>
                    {badge.icon}
                    <span style={{ fontSize: 9, fontWeight: 700, color: badge.color }}>{badge.label}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Channel / Product:</span>
                    <span style={{ color: "#00E5FF", fontWeight: 700 }}>{sat.channel}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Category:</span>
                    <span style={{ color: "#00F593", fontWeight: 700 }}>{sat.channel_category}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Spatial Res:</span>
                    <span style={{ color: "white", fontWeight: 700 }}>{sat.spatial_resolution_km ? `${sat.spatial_resolution_km} km` : "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Local Frames:</span>
                    <span style={{ color: sat.frame_count > 0 ? "#00FF88" : "#94A3B8", fontWeight: 700 }}>{sat.frame_count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 3. Source & Channel Detailed Inspector ─── */}
      {selectedSource && (
        <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Database size={18} color="#00E5FF" />
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 800, color: "white" }}>
                  Source Provenance Inspector: {selectedSource.platform} ({selectedSource.source_id})
                </div>
                <div style={{ fontSize: 11, color: "#64748B" }}>
                  Verified channel specs and data provider provenance.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selectedSource.status === "CONNECTED" ? (
                <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 4, background: "rgba(0, 255, 136, 0.12)", border: "1px solid rgba(0, 255, 136, 0.3)", color: "#00FF88", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  OBSERVED ASSET ACTIVE
                </span>
              ) : (
                <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 4, background: "rgba(255, 184, 0, 0.12)", border: "1px solid rgba(255, 184, 0, 0.3)", color: "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  INTEGRATION READY — DATASET NOT CONNECTED
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#64748B" }}>Platform / Satellite:</span>
                <span style={{ color: "white", fontWeight: 700 }}>{selectedSource.platform}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#64748B" }}>Instrument / Sensor:</span>
                <span style={{ color: "white", fontWeight: 700 }}>{selectedSource.instrument}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#64748B" }}>Channel & Band:</span>
                <span style={{ color: "#00E5FF", fontWeight: 700 }}>{selectedSource.channel} ({selectedSource.channel_category})</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#64748B" }}>Spatial Coverage Domain:</span>
                <span style={{ color: "#CBD5E1", fontWeight: 600 }}>{selectedSource.spatial_coverage}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#64748B" }}>Temporal Coverage:</span>
                <span style={{ color: "#CBD5E1", fontWeight: 600 }}>{selectedSource.temporal_coverage}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#64748B" }}>Sampling Cadence:</span>
                <span style={{ color: "white", fontWeight: 700 }}>{selectedSource.temporal_resolution_min ? `${selectedSource.temporal_resolution_min} mins` : "N/A"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#64748B" }}>Data Provider Provenance:</span>
                <span style={{ color: "#00F593", fontWeight: 700 }}>{selectedSource.provenance}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#64748B" }}>Status Disclaimer:</span>
                <span style={{ color: "#94A3B8", fontSize: 10.5 }}>{selectedSource.disclaimer}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. Indian Satellite Observation Panel (Requirement 19) ─── */}
      <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
          <SatIcon size={14} color="#00F593" />
          INDIAN SATELLITE OBSERVATION PANEL (ISRO / IMD DATA NODES)
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            {
              name: "INSAT-3D",
              role: "Geostationary Meteorological Satellite Observation",
              sensor: "Imager (Thermal IR 10.8 µm)",
              time: "Dec 03 00:00 – Dec 05 23:30 UTC",
              inputRole: "Primary Cloud Top Temp & Convective Core Analysis",
              status: "CONNECTED (48 FRAMES)",
              color: "#00F593",
              bg: "rgba(0, 245, 147, 0.1)"
            },
            {
              name: "INSAT-3DR",
              role: "Geostationary Cloud & Thermal Observation",
              sensor: "Imager & Sounder (Thermal IR / Water Vapor)",
              time: "Demonstration Replay Mode",
              inputRole: "Multi-Sensor Cross-Channel Calibration",
              status: "CONFIGURED / DEMO",
              color: "#FFB800",
              bg: "rgba(255, 184, 0, 0.1)"
            },
            {
              name: "EOS-06 / SCATSAT",
              role: "Ocean Surface Wind Scatterometer Information",
              sensor: "Ku-Band Scatterometer",
              time: "Scatterometer Pass Alignment",
              inputRole: "Sea-Surface Ocean Vector Winds ($V_{ocean}$)",
              status: "DATASET / AVAILABLE",
              color: "#00E5FF",
              bg: "rgba(0, 229, 255, 0.1)"
            }
          ].map((sat) => (
            <div key={sat.name} style={{ background: "rgba(4, 8, 17, 0.65)", padding: 14, borderRadius: 8, border: `1px solid ${sat.color}40`, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)" }}>{sat.name}</span>
                <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: sat.bg, color: sat.color, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  {sat.status}
                </span>
              </div>

              <div style={{ fontSize: 10, color: "#94A3B8" }}>{sat.role}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748B" }}>Sensor/Product:</span><span style={{ color: "#CBD5E1" }}>{sat.sensor}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748B" }}>Obs Time:</span><span style={{ color: "#CBD5E1" }}>{sat.time}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748B" }}>Input Role:</span><span style={{ color: sat.color, fontWeight: 700 }}>{sat.inputRole}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 5. Multi-Source Fusion Pipeline Architecture (Requirement 18 & 20) ─── */}
      <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <GitMerge size={18} color="#00F593" />
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 800, color: "white" }}>
                MULTI-SOURCE DATA FUSION PIPELINE ARCHITECTURE
              </div>
              <div style={{ fontSize: 11, color: "#64748B" }}>
                Multi-satellite alignment & feature-level fusion engine readiness.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 4, background: fusionStatus?.fusion_status === "OPERATIONAL" ? "rgba(0, 255, 136, 0.12)" : "rgba(255, 184, 0, 0.12)", border: fusionStatus?.fusion_status === "OPERATIONAL" ? "1px solid rgba(0, 255, 136, 0.3)" : "1px solid rgba(255, 184, 0, 0.3)", color: fusionStatus?.fusion_status === "OPERATIONAL" ? "#00FF88" : "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              FUSION STATUS: {fusionStatus?.fusion_status || "NOT_READY"}
            </span>
          </div>
        </div>

        {/* Multi-Source Fusion Flow Diagram (Requirement 20) */}
        <div style={{ background: "rgba(4, 8, 17, 0.75)", padding: 16, borderRadius: 8, border: "1px solid rgba(0, 229, 255, 0.2)", display: "flex", flexDirection: "column", gap: 12, fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ fontSize: 9, color: "#00E5FF", fontWeight: 800, letterSpacing: 1 }}>FUSION FEATURE EXTRACTION FLOW:</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, textAlign: "center" }}>
            <div style={{ background: "rgba(0, 245, 147, 0.08)", border: "1px solid rgba(0, 245, 147, 0.3)", padding: 8, borderRadius: 6 }}>
              <div style={{ color: "#00F593", fontWeight: 900 }}>INSAT-3D (CONNECTED)</div>
              <div style={{ color: "#CBD5E1", fontSize: 8.5, marginTop: 2 }}>Cloud / Thermal Features</div>
            </div>
            <div style={{ background: "rgba(255, 184, 0, 0.08)", border: "1px solid rgba(255, 184, 0, 0.3)", padding: 8, borderRadius: 6 }}>
              <div style={{ color: "#FFB800", fontWeight: 900 }}>INSAT-3DR (DEMO)</div>
              <div style={{ color: "#CBD5E1", fontSize: 8.5, marginTop: 2 }}>Cloud / Thermal Features</div>
            </div>
            <div style={{ background: "rgba(0, 229, 255, 0.08)", border: "1px solid rgba(0, 229, 255, 0.3)", padding: 8, borderRadius: 6 }}>
              <div style={{ color: "#00E5FF", fontWeight: 900 }}>EOS-06 / SCATSAT (DATASET)</div>
              <div style={{ color: "#CBD5E1", fontSize: 8.5, marginTop: 2 }}>Ocean Wind Features</div>
            </div>
            <div style={{ background: "rgba(123, 97, 255, 0.08)", border: "1px solid rgba(123, 97, 255, 0.3)", padding: 8, borderRadius: 6 }}>
              <div style={{ color: "#7B61FF", fontWeight: 900 }}>HISTORICAL DATA (CONNECTED)</div>
              <div style={{ color: "#CBD5E1", fontSize: 8.5, marginTop: 2 }}>Temporal / Track Features</div>
            </div>
          </div>

          <div style={{ textAlign: "center", color: "#7B61FF", fontWeight: 900 }}>
            ↓ QUALITY CONTROL → TEMPORAL ALIGNMENT → GEO-SPATIAL ALIGNMENT ↓
          </div>

          <div style={{ background: "rgba(123, 97, 255, 0.15)", border: "1px solid #7B61FF", padding: 10, borderRadius: 6, textAlign: "center", color: "white", fontWeight: 900, fontSize: 11 }}>
            MULTI-SOURCE FEATURE FUSION & CYCLONE AI ENGINE
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, textAlign: "center", fontSize: 8.5 }}>
            {["IDENTIFICATION", "CLASSIFICATION", "INTENSITY", "TRACK", "RISK"].map((cap) => (
              <div key={cap} style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 2px", borderRadius: 4, color: "#00E5FF", fontWeight: 800, border: "1px solid rgba(0,229,255,0.15)" }}>
                {cap}
              </div>
            ))}
          </div>
        </div>

        {/* Status Alert Banner */}
        <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(0, 229, 255, 0.05)", border: "1px solid rgba(0, 229, 255, 0.2)", display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
          <ShieldCheck size={20} color="#00E5FF" />
          <div style={{ color: "#CBD5E1" }}>
            <strong style={{ color: "white" }}>Scientific Integrity Safeguard:</strong> Current demonstration uses genuine INSAT-3D historical observations. Additional satellite sources are architecturally registered but are not connected in this prototype.
          </div>
        </div>

        {/* Pipeline Nodes Flow */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 8 }}>
          {fusionStatus?.pipeline_nodes.map((node, i) => {
            const isConn = node.status === "CONNECTED" || node.status === "READY";
            const isConfig = node.status === "CONFIGURED";

            return (
              <div
                key={node.node_id}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: `1px solid ${isConn ? "rgba(0, 255, 136, 0.3)" : isConfig ? "rgba(255, 184, 0, 0.3)" : "rgba(255, 255, 255, 0.08)"}`,
                  borderRadius: 8,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "#64748B", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                    STEP 0{i + 1} • {node.node_type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 8.5, padding: "2px 6px", borderRadius: 4, background: isConn ? "rgba(0, 255, 136, 0.1)" : isConfig ? "rgba(255, 184, 0, 0.1)" : "rgba(148, 163, 184, 0.1)", color: isConn ? "#00FF88" : isConfig ? "#FFB800" : "#94A3B8", fontWeight: 700 }}>
                    {node.status}
                  </span>
                </div>

                <div style={{ fontSize: 12.5, fontWeight: 800, color: "white" }}>
                  {node.node_name}
                </div>

                <div style={{ fontSize: 10.5, color: "#94A3B8", lineHeight: 1.4 }}>
                  {node.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 5. Source Comparison Matrix Panel ─── */}
      <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Layers size={18} color="#00E5FF" />
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 800, color: "white" }}>
                Satellite Source Comparison & Audit Matrix
              </div>
              <div style={{ fontSize: 11, color: "#64748B" }}>
                Cross-platform sensor capabilities, spectral bands, and local connectivity audit.
              </div>
            </div>
          </div>

          <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 4, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#F87171", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            MULTI-SOURCE: {comparison?.multi_source_status || "INSUFFICIENT_CONNECTED_SOURCES"}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", color: "#64748B", textTransform: "uppercase" }}>
                <th style={{ padding: "10px 12px" }}>Platform</th>
                <th style={{ padding: "10px 12px" }}>Instrument</th>
                <th style={{ padding: "10px 12px" }}>Spectral Channel</th>
                <th style={{ padding: "10px 12px" }}>Category</th>
                <th style={{ padding: "10px 12px" }}>Spatial Res</th>
                <th style={{ padding: "10px 12px" }}>Status</th>
                <th style={{ padding: "10px 12px" }}>Local Asset Path</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => {
                const badge = getStatusBadge(s.status);
                return (
                  <tr key={s.source_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", color: "white" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 800 }}>{s.platform}</td>
                    <td style={{ padding: "10px 12px", color: "#CBD5E1" }}>{s.instrument}</td>
                    <td style={{ padding: "10px 12px", color: "#00E5FF" }}>{s.channel}</td>
                    <td style={{ padding: "10px 12px", color: "#00F593" }}>{s.channel_category}</td>
                    <td style={{ padding: "10px 12px" }}>{s.spatial_resolution_km ? `${s.spatial_resolution_km} km` : "N/A"}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontWeight: 700 }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: s.asset_path ? "#00FF88" : "#64748B" }}>
                      {s.asset_path || "None"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
