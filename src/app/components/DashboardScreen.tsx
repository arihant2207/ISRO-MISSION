import React from "react";
import { 
  Satellite, Activity, Radio, Cpu, Brain, ShieldCheck, AlertTriangle, Sparkles, Layers, Compass, ArrowRight, Clock, Database, Eye, Workflow, CheckCircle2
} from "lucide-react";
import SatelliteAnimationViewer from "./SatelliteAnimationViewer";
import AITemporalEnhancementDemo from "./AITemporalEnhancementDemo";
import CycloneTrackMap from "./CycloneTrackMap";
import EventIntelligencePanel from "./EventIntelligencePanel";
import FutureMLIntegration from "./FutureMLIntegration";
import { MICHAUNG_IBTRACS_TRACK, MICHAUNG_METADATA } from "../michaungTrack";

interface DashboardScreenProps {
  elapsedSeconds?: number;
  onNavigate?: (navId: string) => void;
}

export default function DashboardScreen({ elapsedSeconds = 0, onNavigate }: DashboardScreenProps) {
  // Peak intensity record for dashboard summary
  const activePoint = MICHAUNG_IBTRACS_TRACK[34];
  const windKmh = Math.round(activePoint.windKt * 1.852);

  return (
    <div 
      style={{ 
        padding: "24px 28px", 
        display: "flex", 
        flexDirection: "column", 
        gap: 24,
        maxWidth: 1600,
        margin: "0 auto",
        width: "100%"
      }}
    >
      {/* ─── 1. Primary Dashboard Headline & Mission Status Strip (Requirement 1, 2, 4) ─── */}
      <div 
        className="glass-panel-neon"
        style={{ 
          padding: "20px 26px", 
          display: "flex", 
          flexDirection: "column", 
          gap: 12,
          borderLeft: "4px solid #00E5FF",
          background: "rgba(12, 20, 35, 0.95)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span 
                style={{ 
                  padding: "3px 8px", 
                  borderRadius: 4, 
                  background: "rgba(0, 229, 255, 0.15)", 
                  border: "1px solid rgba(0, 229, 255, 0.4)",
                  color: "#00E5FF", 
                  fontSize: 9.5, 
                  fontWeight: 800, 
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 5
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00E5FF", animation: "pulse-dot 1.2s infinite" }} />
                CYCLONEAI-SAT TROPICAL CYCLONE INTELLIGENCE SYSTEM (SIH26070)
              </span>

              <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(255, 59, 92, 0.12)", border: "1px solid rgba(255, 59, 92, 0.35)", color: "#FF3B5C", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                MoES / IMD PROBLEM OWNER • ISRO DATA NODE
              </span>
            </div>

            <div style={{ fontSize: 20, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)", letterSpacing: 0.2, marginTop: 2 }}>
              Multi-Source Tropical Cyclone Identification, Classification & Prediction
            </div>
            <div style={{ fontSize: 11.5, color: "#94A3B8", fontFamily: "var(--font-sans)", lineHeight: 1.4 }}>
              AI-assisted multi-source satellite intelligence pipeline for geostationary tropical cyclone identification, IMD pattern classification, trajectory forecasting, and temporal enhancement.
            </div>
          </div>

          {/* Compact Mission Status Area */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(0, 245, 147, 0.08)", border: "1px solid rgba(0, 245, 147, 0.25)", color: "#00F593", fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              REAL DATA: INSAT-3D + IBTrACS
            </div>
            <div style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(123, 97, 255, 0.08)", border: "1px solid rgba(123, 97, 255, 0.25)", color: "#7B61FF", fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              DEMONSTRATION: PIPELINE FLOW
            </div>
            <div style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(255, 184, 0, 0.08)", border: "1px solid rgba(255, 184, 0, 0.3)", color: "#FFB800", fontSize: 9.5, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              ML STATUS: NOT CONNECTED / FUTURE
            </div>
          </div>
        </div>

        {/* Compact Solution Pipeline Flow Strip (Requirement 3) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(4, 8, 17, 0.6)", padding: "10px 14px", borderRadius: 8, marginTop: 4, border: "1px solid rgba(0, 229, 255, 0.1)", fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#64748B", fontWeight: 700 }}>SOLUTION FLOW:</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ color: "#00F593", fontWeight: 800 }}>01. SATELLITE OBSERVATION <span style={{ fontSize: 7.5, padding: "1px 4px", borderRadius: 3, background: "rgba(0,245,147,0.15)" }}>REAL DATA</span></span>
            <span style={{ color: "#64748B" }}>→</span>
            <span style={{ color: "#00E5FF", fontWeight: 800 }}>02. MOTION ESTIMATION <span style={{ fontSize: 7.5, padding: "1px 4px", borderRadius: 3, background: "rgba(0,229,255,0.15)" }}>DEMO</span></span>
            <span style={{ color: "#64748B" }}>→</span>
            <span style={{ color: "#7B61FF", fontWeight: 800 }}>03. TEMPORAL INTERPOLATION <span style={{ fontSize: 7.5, padding: "1px 4px", borderRadius: 3, background: "rgba(123,97,255,0.15)" }}>DEMO</span></span>
            <span style={{ color: "#64748B" }}>→</span>
            <span style={{ color: "#FFB800", fontWeight: 800 }}>04. CYCLONE ANALYSIS <span style={{ fontSize: 7.5, padding: "1px 4px", borderRadius: 3, background: "rgba(255,184,0,0.15)" }}>PROPOSED</span></span>
            <span style={{ color: "#64748B" }}>→</span>
            <span style={{ color: "#FFB800", fontWeight: 800 }}>05. PREDICTION <span style={{ fontSize: 7.5, padding: "1px 4px", borderRadius: 3, background: "rgba(255,184,0,0.15)" }}>FUTURE ML</span></span>
          </div>
        </div>
      </div>

      {/* ─── 2. Key Problem Indicator, Value Proposition & Multi-Source Data Row (Requirement 2, 4, 7) ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        
        {/* Card 1: Key Problem Indicator (Temporal Gap) */}
        <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              KEY PROBLEM INDICATOR
            </span>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "rgba(0, 229, 255, 0.12)", color: "#00E5FF", fontWeight: 800 }}>
              OBSERVATION GAP
            </span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)" }}>
            Satellite Observation Temporal Gap
          </div>
          <p style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.4 }}>
            Geostationary satellite scans occur at 30-minute intervals, leaving gaps during rapid cyclone intensification.
          </p>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: "auto", fontFamily: "'JetBrains Mono', monospace" }}>
            <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 8px", borderRadius: 6, flex: 1, textCenter: "center" }}>
              <div style={{ fontSize: 7.5, color: "#64748B" }}>OBSERVED</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#00F593" }}>30 MIN</div>
              <div style={{ fontSize: 7, color: "#00F593", marginTop: 2 }}>REAL SATELLITE</div>
            </div>
            <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 8px", borderRadius: 6, flex: 1, textCenter: "center" }}>
              <div style={{ fontSize: 7.5, color: "#64748B" }}>PROPOSED</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#7B61FF" }}>15 MIN</div>
              <div style={{ fontSize: 7, color: "#7B61FF", marginTop: 2 }}>PROTOTYPE BLEND</div>
            </div>
            <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 8px", borderRadius: 6, flex: 1, textCenter: "center" }}>
              <div style={{ fontSize: 7.5, color: "#64748B" }}>TARGET</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#FFB800" }}>7.5 MIN</div>
              <div style={{ fontSize: 7, color: "#FFB800", marginTop: 2 }}>FUTURE ML MODEL</div>
            </div>
          </div>
        </div>

        {/* Card 2: Hackathon Value Proposition (Requirement 7) */}
        <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#7B61FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              PROPOSED SOLUTION VALUE
            </span>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "rgba(123, 97, 255, 0.12)", color: "#7B61FF", fontWeight: 800 }}>
              AI ADVANTAGE
            </span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)" }}>
            Proposed AI System Benefits
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
            <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 10px", borderRadius: 6 }}>
              <span style={{ color: "#00E5FF", fontWeight: 800 }}>• FASTER TEMPORAL INSIGHT: </span>
              <span style={{ color: "#94A3B8" }}>More frequent reconstructed observations.</span>
            </div>
            <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 10px", borderRadius: 6 }}>
              <span style={{ color: "#00F593", fontWeight: 800 }}>• BETTER STORM MONITORING: </span>
              <span style={{ color: "#94A3B8" }}>Clearer tracking of cloud kinematics.</span>
            </div>
            <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px 10px", borderRadius: 6 }}>
              <span style={{ color: "#FFB800", fontWeight: 800 }}>• DECISION SUPPORT: </span>
              <span style={{ color: "#94A3B8" }}>Future support for nowcasting pipeline.</span>
            </div>
          </div>
        </div>

        {/* Card 3: Real Data Provenance (Requirement 4) */}
        <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              MULTI-SOURCE GROUND TRUTH
            </span>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "rgba(0, 245, 147, 0.12)", color: "#00F593", fontWeight: 800 }}>
              REAL DATA
            </span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)" }}>
            Satellite & Historical Track Feeds
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(4, 8, 17, 0.6)", padding: "5px 10px", borderRadius: 6 }}>
              <span style={{ color: "#64748B" }}>INSAT-3D:</span>
              <span style={{ color: "#00F593", fontWeight: 800 }}>REAL SATELLITE OBSERVATION</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(4, 8, 17, 0.6)", padding: "5px 10px", borderRadius: 6 }}>
              <span style={{ color: "#64748B" }}>NOAA IBTrACS:</span>
              <span style={{ color: "#00E5FF", fontWeight: 800 }}>REAL HISTORICAL TRACK DATA</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(4, 8, 17, 0.6)", padding: "5px 10px", borderRadius: 6 }}>
              <span style={{ color: "#64748B" }}>EVENT:</span>
              <span style={{ color: "#FFB800", fontWeight: 800 }}>CYCLONE MICHAUNG (DEC 2023)</span>
            </div>
          </div>

          <button 
            onClick={() => onNavigate && onNavigate("events")}
            style={{ 
              marginTop: "auto", 
              background: "rgba(0, 245, 147, 0.12)", 
              border: "1px solid rgba(0, 245, 147, 0.35)", 
              borderRadius: 6, 
              color: "#00F593", 
              fontSize: 10, 
              fontWeight: 800, 
              padding: "6px 10px", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            ANALYZE EVENT <ArrowRight size={13} />
          </button>
        </div>

      </div>

      {/* ─── 3. Dominant Hero Visual Observation Deck (Requirement 1, 8) ─── */}
      <div>
        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <Satellite size={14} color="#00E5FF" />
          PRIMARY VISUAL OBSERVATION DECK — CYCLONE MICHAUNG (INSAT-3D IR 10.8 µm)
        </div>
        
        <SatelliteAnimationViewer />
      </div>

      {/* ─── 4. Previews Grid: Temporal Enhancement & Explainability ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        
        {/* Temporal Enhancement Preview Card */}
        <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)" }}>
              Temporal Enhancement Preview
            </div>
            <span style={{ fontSize: 8.5, padding: "2px 6px", borderRadius: 4, background: "rgba(123, 97, 255, 0.12)", color: "#7B61FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              DEMONSTRATION PREVIEW
            </span>
          </div>

          <p style={{ fontSize: 10.5, color: "#94A3B8", lineHeight: 1.45 }}>
            Reconstructing intermediate satellite observations is the proposed AI/ML capability to eliminate temporal gaps in cyclone monitoring.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(4, 8, 17, 0.6)", padding: "10px 14px", borderRadius: 8, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: "#00F593", fontWeight: 700 }}>OBSERVED (t=0m)</span>
            <span style={{ color: "#7B61FF", fontWeight: 800 }}>→ INTERPOLATION (t=15m) →</span>
            <span style={{ color: "#00F593", fontWeight: 700 }}>NEXT (t=30m)</span>
          </div>

          <button 
            onClick={() => onNavigate && onNavigate("viewer")}
            style={{ 
              marginTop: "auto", 
              background: "rgba(123, 97, 255, 0.12)", 
              border: "1px solid rgba(123, 97, 255, 0.35)", 
              borderRadius: 6, 
              color: "#7B61FF", 
              fontSize: 10, 
              fontWeight: 800, 
              padding: "8px 12px", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            OPEN TEMPORAL ANALYSIS <ArrowRight size={14} />
          </button>
        </div>

        {/* Prototype Explainability Preview Card */}
        <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)" }}>
              Prototype Explainability Preview
            </div>
            <span style={{ fontSize: 8.5, padding: "2px 6px", borderRadius: 4, background: "rgba(0, 229, 255, 0.12)", color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              SPATIAL FOCUS
            </span>
          </div>

          <p style={{ fontSize: 10.5, color: "#94A3B8", lineHeight: 1.45 }}>
            Prototype spatial focus emphasizing the cyclone core, eye vortex kinematics, and trailing cloud structure as key inputs for motion modeling.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", textCenter: "center" }}>
            <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px", borderRadius: 6, color: "#FF4D6D", fontWeight: 700 }}>Cyclone Core</div>
            <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px", borderRadius: 6, color: "#FFB800", fontWeight: 700 }}>Vortex Ring</div>
            <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "6px", borderRadius: 6, color: "#00E5FF", fontWeight: 700 }}>Outer Bands</div>
          </div>

          <button 
            onClick={() => onNavigate && onNavigate("xai")}
            style={{ 
              marginTop: "auto", 
              background: "rgba(0, 229, 255, 0.12)", 
              border: "1px solid rgba(0, 229, 255, 0.35)", 
              borderRadius: 6, 
              color: "#00E5FF", 
              fontSize: 10, 
              fontWeight: 800, 
              padding: "8px 12px", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            OPEN EXPLAINABILITY <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* ─── 5. Real IBTrACS Cyclone Track Map Component ─── */}
      <CycloneTrackMap />

      {/* ─── 6. Event Intelligence & System Diagnostics Panel ─── */}
      <EventIntelligencePanel />

      {/* ─── 7. System Pipeline Architecture ─── */}
      <FutureMLIntegration />

    </div>
  );
}
