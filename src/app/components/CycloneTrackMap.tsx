import React, { useState } from "react";
import { Navigation, MapPin, Wind, Gauge, Calendar, ShieldCheck, ChevronRight, Activity, Compass, Layers, AlertCircle, Database } from "lucide-react";
import { MICHAUNG_IBTRACS_TRACK, MICHAUNG_METADATA, TrackPoint } from "../michaungTrack";

// Deterministic Haversine Distance Calculation (km)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Deterministic Compass Bearing Calculation
function getBearingDeg(lat1: number, lon1: number, lat2: number, lon2: number) {
  const φ1 = lat1 * (Math.PI / 180);
  const φ2 = lat2 * (Math.PI / 180);
  const Δλ = (lon2 - lon1) * (Math.PI / 180);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const deg = (θ * (180 / Math.PI) + 360) % 360;
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const val = Math.floor((deg / 22.5) + 0.5);
  return { deg: Math.round(deg), dir: dirs[val % 16] };
}

export default function CycloneTrackMap() {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(34); // Dec 04 Peak Intensity

  // Defensive fallback if IBTrACS data array is unavailable
  if (!MICHAUNG_IBTRACS_TRACK || MICHAUNG_IBTRACS_TRACK.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: 24, textAlign: "center", color: "#FFB800" }}>
        <AlertCircle size={24} style={{ margin: "0 auto 8px auto" }} />
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 800 }}>IBTrACS Track Data Unavailable</div>
        <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>Historical cyclone track dataset could not be rendered.</div>
      </div>
    );
  }

  const recordCount = MICHAUNG_IBTRACS_TRACK.length;
  const safeIndex = Math.min(Math.max(0, selectedPointIndex), recordCount - 1);
  const activePoint: TrackPoint = MICHAUNG_IBTRACS_TRACK[safeIndex];
  const prevPoint: TrackPoint = MICHAUNG_IBTRACS_TRACK[Math.max(0, safeIndex - 1)];

  // Derive deterministic motion metrics between consecutive observations
  const displacementKm = getDistanceKm(prevPoint.lat, prevPoint.lon, activePoint.lat, activePoint.lon);
  const bearing = getBearingDeg(prevPoint.lat, prevPoint.lon, activePoint.lat, activePoint.lon);
  const approxTranslationSpeedKmh = safeIndex > 0 ? (displacementKm / 3).toFixed(1) : "0.0";

  // Map projection bounds for Bay of Bengal (Lat 5°N to 22°N, Lon 78°E to 92°E)
  const minLat = 5;
  const maxLat = 22;
  const minLon = 78;
  const maxLon = 92;

  // Convert Lat/Lon coordinates to relative SVG percentage coordinates (0% to 100%)
  const getMapCoords = (lat: number, lon: number) => {
    const xPct = ((lon - minLon) / (maxLon - minLon)) * 100;
    const yPct = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    return { x: xPct, y: yPct };
  };

  // Build SVG path string for the historical track line
  const trackPathSvg = MICHAUNG_IBTRACS_TRACK.map((pt, idx) => {
    const { x, y } = getMapCoords(pt.lat, pt.lon);
    return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  // Map intensity category deterministically from wind speed (knots)
  const getCategoryBadge = (windKt: number) => {
    if (windKt >= 48) return { label: "Severe Cyclonic Storm", color: "#FF3B5C" };
    if (windKt >= 34) return { label: "Cyclonic Storm", color: "#FFB800" };
    if (windKt >= 28) return { label: "Deep Depression", color: "#7B61FF" };
    return { label: "Depression", color: "#00E5FF" };
  };

  const cat = getCategoryBadge(activePoint.windKt);
  const windKmhDerived = activePoint.windKt > 0 ? Math.round(activePoint.windKt * 1.852) : null;

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
      {/* ─── Header ─── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(0, 229, 255, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Navigation size={15} color="#00E5FF" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 900, color: "white", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
              Cyclone Track Visualization — Historical IBTrACS Dataset
              <span style={{ fontSize: 8.5, padding: "2px 6px", borderRadius: 4, background: "rgba(0, 245, 147, 0.1)", border: "1px solid rgba(0, 245, 147, 0.3)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                REAL IBTRACS DATA
              </span>
            </div>
            <div style={{ fontSize: 9.5, color: "#94A3B8" }}>
              NOAA IBTrACS ID: {MICHAUNG_METADATA.ibtracsId} · Cyclone Michaung (30 Nov – 06 Dec 2023)
            </div>
          </div>
        </div>

        <span 
          style={{
            padding: "4px 10px",
            borderRadius: 4,
            background: "rgba(0, 245, 147, 0.1)",
            border: "1px solid rgba(0, 245, 147, 0.3)",
            color: "#00F593",
            fontSize: 9.5,
            fontWeight: 800,
            fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          ✓ REAL CSV TRACK LOADED ({recordCount} RECORDS)
        </span>
      </div>

      {/* ─── Main Grid: Geospatial Map Canvas (Left) + Details HUD & Motion Analysis (Right) ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, minHeight: 380 }}>
        
        {/* Geospatial Map Canvas */}
        <div 
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: 380,
            background: "#030712",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid rgba(0, 229, 255, 0.12)"
          }}
        >
          {/* Map Grid Coordinates & Regional Labels */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
            {[10, 15, 20].map(lat => (
              <div key={lat} style={{ position: "absolute", top: `${(1 - (lat - minLat)/(maxLat - minLat)) * 100}%`, left: 8, fontSize: 8, color: "rgba(0,229,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
                {lat}°N
              </div>
            ))}
            {[80, 85, 90].map(lon => (
              <div key={lon} style={{ position: "absolute", left: `${((lon - minLon)/(maxLon - minLon)) * 100}%`, bottom: 6, fontSize: 8, color: "rgba(0,229,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
                {lon}°E
              </div>
            ))}

            {/* Geographic Regional Context Labels */}
            <div style={{ position: "absolute", top: "25%", left: "12%", color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 800, fontFamily: "var(--font-heading)", letterSpacing: 1 }}>INDIA</div>
            <div style={{ position: "absolute", top: "55%", left: "50%", color: "rgba(0,229,255,0.2)", fontSize: 12, fontWeight: 900, fontFamily: "var(--font-heading)", letterSpacing: 2 }}>BAY OF BENGAL</div>
            <div style={{ position: "absolute", top: "82%", left: "22%", color: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 800, fontFamily: "var(--font-heading)" }}>SRI LANKA</div>
            <div style={{ position: "absolute", top: "12%", left: "55%", color: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 800, fontFamily: "var(--font-heading)" }}>BANGLADESH</div>
            <div style={{ position: "absolute", top: "28%", left: "82%", color: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 800, fontFamily: "var(--font-heading)" }}>MYANMAR</div>
          </div>

          {/* SVG Trajectory Layer */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 5 }}>
            {/* Coastline visual approximation */}
            <path
              d="M 12 10 Q 18 35 22 55 T 28 85 T 38 98"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            
            {/* Historical Observed Track Line */}
            <path
              d={trackPathSvg}
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px rgba(0,229,255,0.6))" }}
            />

            {/* Render Track Points */}
            {MICHAUNG_IBTRACS_TRACK.map((pt, idx) => {
              const { x, y } = getMapCoords(pt.lat, pt.lon);
              const isSelected = idx === safeIndex;
              const ptCat = getCategoryBadge(pt.windKt);

              return (
                <g key={idx} onClick={() => setSelectedPointIndex(idx)} style={{ cursor: "pointer" }}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r={isSelected ? 6 : 3.5}
                    fill={ptCat.color}
                    stroke={isSelected ? "#FFFFFF" : "rgba(3,7,18,0.8)"}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  {isSelected && (
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r={12}
                      fill="none"
                      stroke={ptCat.color}
                      strokeWidth="1.5"
                      style={{ animation: "pulse-dot 1.2s infinite" }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Map Overlay Badges */}
          <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, display: "flex", gap: 6 }}>
            <span style={{ background: "rgba(4, 10, 24, 0.85)", border: "1px solid rgba(0, 229, 255, 0.2)", borderRadius: 6, padding: "4px 8px", fontSize: 8.5, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace" }}>
              HISTORICAL OBSERVED TRACK (REAL IBTRACS DATA)
            </span>
            <span style={{ background: "rgba(255, 184, 0, 0.08)", border: "1px solid rgba(255, 184, 0, 0.3)", borderRadius: 6, padding: "4px 8px", fontSize: 8.5, color: "#FFB800", fontFamily: "'JetBrains Mono', monospace" }}>
              PROPOSED FORECAST MODEL — NOT CONNECTED
            </span>
          </div>
        </div>

        {/* ─── Track Point Details & Motion Analysis (Right HUD) ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          
          {/* Selected Point Telemetry HUD */}
          <div 
            style={{
              background: "rgba(4, 8, 17, 0.6)",
              border: "1px solid rgba(0, 229, 255, 0.12)",
              borderRadius: 8,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 6 }}>
              <span style={{ fontSize: 10.5, color: "#64748B", fontWeight: 800 }}>RECORD TELEMETRY</span>
              <span style={{ fontSize: 9.5, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                Record {safeIndex + 1} / {recordCount}
              </span>
            </div>

            {/* Intensity Badge & Derived Label */}
            <div style={{ padding: "6px 10px", borderRadius: 6, background: `${cat.color}15`, border: `1px solid ${cat.color}40`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10.5, fontWeight: 900, color: cat.color }}>{cat.label}</span>
              <span style={{ fontSize: 8, color: cat.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                DERIVED CLASSIFICATION
              </span>
            </div>

            {/* Attributes Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Timestamp:</span>
                <span style={{ color: "white", fontWeight: 700 }}>{activePoint.time} UTC</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Coordinates:</span>
                <span style={{ color: "#00E5FF", fontWeight: 700 }}>{activePoint.lat.toFixed(1)}°N, {activePoint.lon.toFixed(1)}°E</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Wind Speed (knots):</span>
                <span style={{ color: "#FFB800", fontWeight: 700 }}>{activePoint.windKt > 0 ? `${activePoint.windKt} kt` : "Data unavailable"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Derived Wind (km/h):</span>
                <span style={{ color: "#00F593", fontWeight: 700 }}>{windKmhDerived ? `${windKmhDerived} km/h` : "N/A"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Central Pressure:</span>
                <span style={{ color: "#FF3B5C", fontWeight: 700 }}>{activePoint.presHpa > 0 ? `${activePoint.presHpa} hPa` : "Data unavailable"}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Storm Nature:</span>
                <span style={{ color: "#94A3B8", fontWeight: 700 }}>{activePoint.nature || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Motion Analysis Panel */}
          <div 
            style={{
              background: "rgba(4, 8, 17, 0.6)",
              border: "1px solid rgba(0, 245, 147, 0.15)",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 6
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 4 }}>
                <Compass size={12} color="#00F593" />
                MOTION ANALYSIS
              </span>
              <span style={{ fontSize: 7.5, padding: "1px 5px", borderRadius: 3, background: "rgba(0, 245, 147, 0.1)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                DERIVED FROM TRACK
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
              <div style={{ background: "rgba(2, 6, 16, 0.6)", padding: "6px 8px", borderRadius: 4 }}>
                <div style={{ color: "#64748B", fontSize: 8 }}>Displacement:</div>
                <div style={{ color: "white", fontWeight: 700 }}>{displacementKm.toFixed(1)} km</div>
              </div>
              <div style={{ background: "rgba(2, 6, 16, 0.6)", padding: "6px 8px", borderRadius: 4 }}>
                <div style={{ color: "#64748B", fontSize: 8 }}>Bearing:</div>
                <div style={{ color: "#00E5FF", fontWeight: 700 }}>{bearing.deg}° ({bearing.dir})</div>
              </div>
              <div style={{ background: "rgba(2, 6, 16, 0.6)", padding: "6px 8px", borderRadius: 4, gridColumn: "span 2" }}>
                <div style={{ color: "#64748B", fontSize: 8 }}>Translation Velocity:</div>
                <div style={{ color: "#FFB800", fontWeight: 700 }}>{approxTranslationSpeedKmh} km/h (inter-point speed)</div>
              </div>
            </div>
          </div>

          {/* Factual Data Provenance Strip */}
          <div 
            style={{
              background: "rgba(4, 8, 17, 0.5)",
              border: "1px solid rgba(0, 229, 255, 0.1)",
              borderRadius: 8,
              padding: "8px 10px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 8.5,
              color: "#94A3B8",
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            <Database size={13} color="#00E5FF" style={{ flexShrink: 0 }} />
            <span>SOURCE: NOAA IBTrACS Dataset (ID: {MICHAUNG_METADATA.ibtracsId})</span>
          </div>

          {/* Interactive Slider */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>
              <span>Nov 30</span>
              <span>Scrub IBTrACS Record Timeline ({safeIndex + 1}/{recordCount})</span>
              <span>Dec 06</span>
            </div>
            <input
              type="range"
              min="0"
              max={recordCount - 1}
              value={safeIndex}
              onChange={(e) => setSelectedPointIndex(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#00E5FF", cursor: "pointer" }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
