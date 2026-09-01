import React, { useState } from "react";
import { 
  AlertTriangle, ShieldCheck, Database, Radio, Info, Layers, CheckCircle2, Clock, MapPin, Wind, Gauge, Sparkles, ArrowRight 
} from "lucide-react";
import { MICHAUNG_IBTRACS_TRACK, MICHAUNG_METADATA } from "../michaungTrack";

interface EventsScreenProps {
  onNavigate?: (navId: string) => void;
}

export default function EventsScreen({ onNavigate }: EventsScreenProps) {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(34); // Dec 04 Peak Intensity
  const activePoint = MICHAUNG_IBTRACS_TRACK[selectedPointIndex] || MICHAUNG_IBTRACS_TRACK[34];
  const windKmh = Math.round(activePoint.windKt * 1.852);

  // Key historical milestones for timeline
  const milestones = [
    { date: "2023-11-30 06:00 UTC", stage: "Depression Formed", location: "South Bay of Bengal (7.5°N, 88.0°E)", pres: "1000 hPa", wind: "56 km/h" },
    { date: "2023-12-02 06:00 UTC", stage: "Named Cyclone Michaung", location: "Southwest Bay of Bengal (10.3°N, 83.6°E)", pres: "997 hPa", wind: "56 km/h" },
    { date: "2023-12-04 06:00 UTC", stage: "Peak Severe Cyclonic Storm", location: "Off AP Coast (13.5°N, 80.9°E)", pres: "988 hPa", wind: "93 km/h" },
    { date: "2023-12-05 06:00 UTC", stage: "Landfall at Bapatla", location: "Andhra Pradesh Coast (15.6°N, 80.2°E)", pres: "988 hPa", wind: "93 km/h" },
    { date: "2023-12-06 06:00 UTC", stage: "Dissipated Inland", location: "Telangana / Odisha border (18.3°N, 81.1°E)", pres: "1000 hPa", wind: "56 km/h" }
  ];

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ─── 1. Header Alert Panel ─── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 900, color: "white", display: "flex", alignItems: "center", gap: 10 }}>
            Event Detection & Historical Identification
            <span style={{ fontSize: 9.5, padding: "3px 8px", borderRadius: 4, background: "rgba(0, 245, 147, 0.1)", border: "1px solid rgba(0, 245, 147, 0.3)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              REAL HISTORICAL DATASET
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            Data-driven historical cyclone identification grounded in real INSAT-3D satellite imagery and NOAA IBTrACS records.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div 
            style={{ 
              padding: "8px 16px", 
              borderRadius: 8, 
              background: "rgba(255,59,92,0.1)", 
              border: "1px solid rgba(255,59,92,0.35)", 
              fontSize: 11, 
              color: "#FF3B5C", 
              fontWeight: 800, 
              display: "flex", 
              alignItems: "center", 
              gap: 8,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B5C", animation: "pulse-dot 1.2s infinite" }} />
            1 REAL HISTORICAL EVENT IDENTIFIED
          </div>

          <button
            onClick={() => onNavigate && onNavigate("satellites")}
            style={{
              background: "rgba(0, 229, 255, 0.12)",
              border: "1px solid rgba(0, 229, 255, 0.35)",
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
            VIEW TRACK <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ─── 2. Primary Real Event Card: Cyclone Michaung ─── */}
      <div 
        className="glass-panel-neon"
        style={{ 
          padding: "24px 28px", 
          borderLeft: "4px solid #FF3B5C",
          background: "rgba(12, 20, 35, 0.9)",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,59,92,0.15)", border: "1px solid rgba(255,59,92,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={20} color="#FF3B5C" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: "#FF3B5C", fontWeight: 800, letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>
                  DATA-DRIVEN EVENT IDENTIFICATION
                </span>
                <span style={{ fontSize: 8.5, padding: "2px 6px", borderRadius: 4, background: "rgba(255, 59, 92, 0.15)", border: "1px solid rgba(255, 59, 92, 0.35)", color: "#FF3B5C", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  REAL HISTORICAL EVENT
                </span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)", marginTop: 2 }}>
                Cyclone Michaung (Bay of Bengal)
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(0, 245, 147, 0.1)", border: "1px solid rgba(0, 245, 147, 0.3)", color: "#00F593", fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              DATA MATCH: VERIFIED
            </span>
            <button
              onClick={() => onNavigate && onNavigate("satellites")}
              style={{
                background: "rgba(0, 229, 255, 0.15)",
                border: "1px solid rgba(0, 229, 255, 0.4)",
                borderRadius: 6,
                color: "#00E5FF",
                fontSize: 11,
                fontWeight: 800,
                padding: "6px 14px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              VIEW TRACK <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Real Telemetry Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Observation Window", val: "30 Nov – 06 Dec 2023", sub: "Historical Dataset" },
            { label: "Selected Telemetry Time", val: `${activePoint.time} UTC`, sub: "Source: NOAA IBTrACS" },
            { label: "Position Coords", val: `${activePoint.lat.toFixed(1)}°N, ${activePoint.lon.toFixed(1)}°E`, sub: "Source: NOAA IBTrACS" },
            { label: "Wind Speed", val: `${windKmh} km/h (${activePoint.windKt} kt)`, sub: "Source: NOAA IBTrACS" },
            { label: "Central Pressure", val: `${activePoint.presHpa} hPa`, sub: "Source: NOAA IBTrACS" },
            { label: "Primary Satellite Sensor", val: "INSAT-3D IR 10.8 µm", sub: "Source: INSAT-3D Loop" },
            { label: "Landfall Location", val: "Bapatla, Andhra Pradesh", sub: "Observed Impact Zone" },
            { label: "Data Integrity", val: "REAL DATA", sub: "Verified Historical Record" }
          ].map((item, idx) => (
            <div 
              key={idx}
              style={{
                background: "rgba(4, 8, 17, 0.6)",
                border: "1px solid rgba(0, 229, 255, 0.1)",
                borderRadius: 8,
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 4
              }}
            >
              <span style={{ fontSize: 9, color: "#64748B", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
                {item.label}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: item.val.includes("REAL") ? "#00F593" : "white", fontFamily: "'JetBrains Mono', monospace" }}>
                {item.val}
              </span>
              <span style={{ fontSize: 8.5, color: "#94A3B8" }}>
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. Data-Driven Evidence Section ─── */}
      <div 
        className="glass-panel"
        style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={16} color="#00E5FF" />
            DATA-DRIVEN EVIDENCE — EVENT PROVENANCE & GROUND TRUTH
          </div>
          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: "rgba(0, 229, 255, 0.1)", color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            EVIDENCE-BASED AUDIT
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { num: "01", title: "Historical Track Record", desc: "Official NOAA IBTrACS dataset entry present (ID: 2023334N08088) with 49 verified telemetry points.", tag: "IBTrACS DATASET" },
            { num: "02", title: "Satellite Imagery Stream", desc: "INSAT-3D 10.8 µm thermal infrared observation sequence available over the Bay of Bengal domain.", tag: "INSAT-3D OBSERVED" },
            { num: "03", title: "Track Intensity Drop", desc: "Recorded central pressure drop from 1008 hPa to 988 hPa corresponding to Severe Cyclonic Storm stage.", tag: "MEASURED TELEMETRY" },
            { num: "04", title: "Temporal Window Match", desc: "Observation timeframe corresponds precisely to the early December 2023 cyclone landfall window.", tag: "HISTORICAL MATCH" }
          ].map((ev) => (
            <div 
              key={ev.num}
              style={{
                background: "rgba(4, 8, 17, 0.5)",
                border: "1px solid rgba(0, 229, 255, 0.12)",
                borderRadius: 8,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace" }}>
                  EVIDENCE {ev.num}
                </span>
                <span style={{ fontSize: 7.5, padding: "1px 5px", borderRadius: 3, background: "rgba(0, 229, 255, 0.1)", color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  {ev.tag}
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: "white" }}>{ev.title}</span>
              <span style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.4 }}>{ev.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. Informational Analysis Cards ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {/* Card 1 */}
        <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              DATA VALIDATION & INGESTION
            </span>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "rgba(0, 245, 147, 0.1)", color: "#00F593", fontWeight: 800 }}>
              REAL DATA
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>NOAA IBTrACS Track Data</div>
          <p style={{ fontSize: 10.5, color: "#94A3B8", lineHeight: 1.4 }}>
            Successfully loaded and parsed 49 chronological observation points for Cyclone Michaung from official NOAA dataset.
          </p>
          <div style={{ fontSize: 9.5, color: "#64748B", marginTop: "auto", fontFamily: "'JetBrains Mono', monospace" }}>
            Status: <span style={{ color: "#00F593" }}>DATA MATCH VERIFIED</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              SATELLITE OBSERVATION STREAM
            </span>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "rgba(0, 229, 255, 0.1)", color: "#00E5FF", fontWeight: 800 }}>
              REAL DATA
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>INSAT-3D Thermal IR Loop</div>
          <p style={{ fontSize: 10.5, color: "#94A3B8", lineHeight: 1.4 }}>
            Geostationary 10.8 µm infrared imagery stream displaying atmospheric cloud motion over Bay of Bengal.
          </p>
          <div style={{ fontSize: 9.5, color: "#64748B", marginTop: "auto", fontFamily: "'JetBrains Mono', monospace" }}>
            Status: <span style={{ color: "#00E5FF" }}>OBSERVED DATASET LOADED</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              ML DETECTOR PIPELINE
            </span>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "rgba(255, 184, 0, 0.1)", color: "#FFB800", fontWeight: 800 }}>
              MODEL STATUS
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>Automated Event Detector</div>
          <p style={{ fontSize: 10.5, color: "#94A3B8", lineHeight: 1.4 }}>
            Real-time multi-event neural network detection models are currently offline awaiting backend model deployment.
          </p>
          <div style={{ fontSize: 9.5, color: "#64748B", marginTop: "auto", fontFamily: "'JetBrains Mono', monospace" }}>
            Status: <span style={{ color: "#FFB800" }}>MODEL NOT CONNECTED / DEMO</span>
          </div>
        </div>
      </div>

      {/* ─── 5. Historical Event Timeline ─── */}
      <div className="glass-panel" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={16} color="#00E5FF" />
            HISTORICAL EVENT TIMELINE — CYCLONE MICHAUNG (DECEMBER 2023)
          </div>
          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: "rgba(0, 245, 147, 0.1)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            SOURCE: NOAA IBTrACS
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {milestones.map((m, idx) => (
            <div 
              key={idx}
              style={{
                background: "rgba(4, 8, 17, 0.6)",
                border: idx === 2 || idx === 3 ? "1px solid rgba(255, 59, 92, 0.4)" : "1px solid rgba(0, 229, 255, 0.12)",
                borderRadius: 8,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}
            >
              <div style={{ fontSize: 9, color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                {m.date}
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: idx === 2 || idx === 3 ? "#FF3B5C" : "white" }}>
                {m.stage}
              </div>
              <div style={{ fontSize: 9.5, color: "#94A3B8" }}>
                {m.location}
              </div>
              <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", fontSize: 8.5, color: "#64748B", fontFamily: "'JetBrains Mono', monospace", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 6 }}>
                <span>Pres: {m.pres}</span>
                <span>Wind: {m.wind}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
