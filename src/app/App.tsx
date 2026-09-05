import React, { useState, useEffect } from "react";
import { 
  Satellite, Bell, User, LogOut, Lock, Wifi, Shield, RefreshCw,
  AlertTriangle, Cpu, LayoutDashboard, Eye, BarChart2, Brain, Download, Settings, Target, Layers, Activity, Database
} from "lucide-react";
import BackgroundControl from "./components/BackgroundControl";
import Globe3D from "./components/Globe3D";

// Modular Screens
import DashboardScreen from "./components/DashboardScreen";
import IdentificationScreen from "./components/IdentificationScreen";
import ClassificationScreen from "./components/ClassificationScreen";
import IntensityScreen from "./components/IntensityScreen";
import PredictionScreen from "./components/PredictionScreen";
import LandfallScreen from "./components/LandfallScreen";
import ViewerScreen from "./components/ViewerScreen";



import SatellitesScreen from "./components/SatellitesScreen";
import MetricsScreen from "./components/MetricsScreen";
import EventsScreen from "./components/EventsScreen";
import XAIScreen from "./components/XAIScreen";
import DownloadsScreen from "./components/DownloadsScreen";
import SettingsScreen from "./components/SettingsScreen";
import SystemStatusDrawer from "./components/SystemStatusDrawer";
import GeoPulseAIAssistant from "./components/GeoPulseAIAssistant";

// Static Data and Layout config
import { NAV_ITEMS, NAV_LABELS, G } from "./data";

// ─── Global CSS Variables & Tweaks (Legacy Compatibility) ──────────────────────
const GLOBAL_CSS = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes spin-rev {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
  input[type=range] { accent-color: #00E5FF; }
  select option { background: #071221; color: #E2E8F0; }

  .tooltip-container {
    position: relative;
  }
  .tooltip-container .tooltip-box {
    visibility: hidden;
    position: absolute;
    top: 100%;
    right: 50%;
    transform: translateX(50%) translateY(8px);
    background: #071221;
    border: 1px solid rgba(0, 229, 255, 0.2);
    color: #E2E8F0;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 9px;
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
    z-index: 120;
    opacity: 0;
    transition: opacity 0.2s, transform 0.2s;
    box-shadow: 0 4px 12px rgba(4,8,17,0.5);
  }
  .tooltip-container:hover .tooltip-box {
    visibility: visible;
    opacity: 1;
    transform: translateX(50%) translateY(4px);
  }

  .tooltip-right-container {
    position: relative;
  }
  .tooltip-right-container .tooltip-right-box {
    visibility: hidden;
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%) translateX(8px);
    background: #071221;
    border: 1px solid rgba(0, 229, 255, 0.2);
    color: #E2E8F0;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 9.5px;
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
    z-index: 150;
    opacity: 0;
    transition: opacity 0.2s, transform 0.2s;
    box-shadow: 0 4px 12px rgba(4,8,17,0.5);
    pointer-events: none;
  }
  .tooltip-right-container:hover .tooltip-right-box {
    visibility: visible;
    opacity: 1;
    transform: translateY(-50%) translateX(4px);
  }

  .hover-item:hover {
    background: rgba(255, 255, 255, 0.02) !important;
    border-color: rgba(255, 255, 255, 0.05) !important;
    color: white !important;
  }
  .hover-item:hover .sidebar-icon {
    color: #00E5FF !important;
    transform: translateX(1.5px);
  }
  .active-item:hover .sidebar-icon {
    transform: none !important;
  }

  /* Heartbeat pulse animation */
  @keyframes heartbeat-pulse {
    0%, 100% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.012); filter: brightness(1.08); }
  }
  .heartbeat-telemetry {
    animation: heartbeat-pulse 5.5s ease-in-out infinite;
  }
`;

// Twinkling Star Field Stars
const STARS = Array.from({ length: 140 }, (_, i) => ({
  id: i,
  left: `${(i * 137.508 % 100).toFixed(2)}%`,
  top: `${((i * 97.3 + 23) % 100).toFixed(2)}%`,
  size: i % 11 === 0 ? 2.5 : i % 4 === 0 ? 1.5 : 1,
  delay: `${(i * 0.23 % 6).toFixed(2)}s`,
  dur: `${(2 + (i * 0.31 % 4)).toFixed(1)}s`,
}));

// StarBackground Component (Twinkles on top of Nebula layers)
function StarBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {STARS.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "white",
            opacity: 0.55,
            animation: `twinkle ${s.dur} ${s.delay} infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}

// ─── LoginScreen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1800);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", width: "100vw", background: "transparent", position: "relative", overflow: "hidden" }}>
      
      {/* Left panel - 43% width */}
      <div style={{ width: "43%", minWidth: 440, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px", zIndex: 10, position: "relative" }}>
        
        {/* Futuristic Glass Mission Access panel */}
        <div className="glass-panel-neon" style={{ padding: "40px 45px", position: "relative", overflow: "hidden" }}>
          
          {/* Neon corner brackets */}
          <div style={{ position: "absolute", top: 12, left: 12, width: 14, height: 14, borderTop: "2px solid #00E5FF", borderLeft: "2px solid #00E5FF" }} />
          <div style={{ position: "absolute", bottom: 12, right: 12, width: 14, height: 14, borderBottom: "2px solid #00E5FF", borderRight: "2px solid #00E5FF" }} />

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: "linear-gradient(135deg,#00E5FF,#7B61FF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0, 229, 255, 0.4)", flexShrink: 0 }}>
              <Satellite size={24} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 900, color: "white", lineHeight: 1.1, letterSpacing: 0.5 }}>GeoPulse AI</div>
              <div style={{ fontSize: 9.5, color: "#00E5FF", letterSpacing: 2.5, fontWeight: 700 }}>SIH26070 · TROPICAL CYCLONE INTELLIGENCE</div>
            </div>
          </div>

          <div style={{ marginBottom: 30 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 21, fontWeight: 800, color: "white", marginBottom: 6, letterSpacing: -0.5 }}>Mission Access</div>
            <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.5 }}>AI/ML System for Tropical Cyclone Identification, Classification & Prediction · Multi-Source Satellite Intelligence • Explainable AI • Scientific Evaluation</div>
          </div>

          {/* Inputs */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 10, color: "#00E5FF", letterSpacing: 1.8, fontWeight: 700, marginBottom: 8 }}>RESEARCH ANALYST ID</label>
            <input
              defaultValue="analyst@mission.org.in"
              className="cyber-input"
              placeholder="Enter credentials..."
            />
          </div>
          <div style={{ marginBottom: 30 }}>
            <label style={{ display: "block", fontSize: 10, color: "#00E5FF", letterSpacing: 1.8, fontWeight: 700, marginBottom: 8 }}>ACCESS SECURITY CODE</label>
            <input
              type="password"
              defaultValue="••••••••••••"
              className="cyber-input"
              placeholder="Enter security key..."
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: "14px", 
              background: loading ? "rgba(0, 229, 255, 0.2)" : "linear-gradient(135deg,#00E5FF,#7B61FF)", 
              border: "none", 
              borderRadius: 8, 
              color: "white", 
              fontSize: 14, 
              fontWeight: 700, 
              cursor: loading ? "not-allowed" : "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              gap: 10, 
              boxShadow: loading ? "none" : "0 0 25px rgba(0,229,255,0.35)", 
              fontFamily: "var(--font-heading)",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              transition: "all 0.2s"
            }}
          >
            {loading ? (
              <><RefreshCw size={16} style={{ animation: "spin-slow 0.8s linear infinite" }} /> ESTABLISHING ENCRYPTED LINK...</>
            ) : (
              <><Shield size={15} /> INITIALIZE SECURE HANDSHAKE</>
            )}
          </button>

          {/* Status chips inside card */}
          <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 18 }}>
            <div style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 5 }}><Lock size={12} color="#00E5FF" /> AES-256 LINK</div>
            <div style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 5 }}><Wifi size={12} color="#00E5FF" /> TELEMETRY CHANNEL</div>
            <div style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 5 }}><Shield size={12} color="#00E5FF" /> ISO/IEC 27001</div>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "#64748B", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 0.5 }}>
          SMART INDIA HACKATHON 2026 · MISSION SYSTEM
        </div>
      </div>

      {/* Right panel - 57% width, centered Globe3D */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 1, borderLeft: "1px solid rgba(0, 229, 255, 0.05)" }}>
        
        {/* Holographic Conic Radar Sweeper behind Globe */}
        <div style={{ 
          position: "absolute", 
          width: 520, 
          height: 520, 
          borderRadius: "50%", 
          border: "1px solid rgba(0, 229, 255, 0.07)", 
          pointerEvents: "none",
          background: "conic-gradient(from 0deg, rgba(0, 229, 255, 0.04) 5deg, transparent 80deg)",
          animation: "spin-slow 12s linear infinite"
        }} />
        
        <div style={{ position: "relative" }}>
          <Globe3D width={540} height={540} scale={210} themeColor="0, 229, 255" />
          
          {/* Float overlay status metrics */}
          <div style={{ position: "absolute", top: -20, right: -40, padding: "10px 14px" }} className="glass-panel text-left">
            <div style={{ fontSize: 9, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>ORBIT_SCAN:</div>
            <div style={{ fontSize: 11, color: "#00E5FF", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>INSAT-3DS ONLINE</div>
          </div>
          <div style={{ position: "absolute", bottom: -20, left: -40, padding: "10px 14px" }} className="glass-panel text-left">
            <div style={{ fontSize: 9, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>SAT_ALTITUDE:</div>
            <div style={{ fontSize: 11, color: "#7B61FF", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>35,786 KM (GEO)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ 
  nav, 
  setNav, 
  collapsed, 
  setCollapsed,
  onOpenAssistant
}: { 
  nav: string; 
  setNav: (s: string) => void; 
  collapsed: boolean; 
  setCollapsed: (c: boolean) => void;
  onOpenAssistant?: () => void;
}) {
  const sections = [
    {
      title: "MISSION CONTROL",
      items: [
        { id: "dashboard", label: "01 Mission Overview", Icon: LayoutDashboard, live: false }
      ]
    },
    {
      title: "CYCLONE DISCOVERY",
      items: [
        { id: "identify", label: "02 Candidate Identification", Icon: Target, live: true },
        { id: "events", label: "03 Cyclone Discovery & Events", Icon: AlertTriangle, live: true, badge: 1 }
      ]
    },
    {
      title: "CLASSIFICATION",
      items: [
        { id: "classify", label: "04 Pattern Classification & Validation", Icon: Layers, live: true }
      ]
    },
    {
      title: "INTENSITY",
      items: [
        { id: "intensity", label: "05 Intensity Estimation & Trend", Icon: Activity, live: true }
      ]
    },
    {
      title: "PREDICTION",
      items: [
        { id: "predict", label: "06 Track Forecast", Icon: Cpu, live: true },
        { id: "landfall", label: "07 Landfall & Coastal Risk", Icon: Shield, live: false }
      ]
    },
    {
      title: "SATELLITE INTELLIGENCE",
      items: [
        { id: "satellites", label: "08 Satellite Registry & Fusion", Icon: Satellite, live: true },
        { id: "viewer", label: "Satellite Frame Viewer", Icon: Eye, live: false }
      ]
    },
    {
      title: "TEMPORAL INTELLIGENCE",
      items: [
        { id: "metrics", label: "09 AI Temporal Enhancement 30→15→7.5", Icon: BarChart2, live: false }
      ]
    },
    {
      title: "EXPLAINABLE AI & DECISION SUPPORT",
      items: [
        { id: "xai", label: "10 Scientific Evaluation & XAI", Icon: Brain, live: false },
        { id: "ai_assistant", label: "GeoPulse AI Assistant", Icon: Brain, live: true, isAssistant: true }
      ]
    }
  ];

  return (
    <div 
      className="glass-panel" 
      style={{ 
        width: collapsed ? 64 : 236, 
        minWidth: collapsed ? 64 : 236, 
        display: "flex", 
        flexDirection: "column", 
        height: "100%", 
        borderRadius: 0, 
        borderRight: "1px solid rgba(0,229,255,0.14)", 
        borderLeft: "none", 
        borderTop: "none", 
        borderBottom: "none", 
        position: "relative", 
        zIndex: 20,
        transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        background: "linear-gradient(180deg, rgba(7, 18, 33, 0.95), rgba(7, 18, 33, 0.98))"
      }}
    >
      {/* Brand / Logo */}
      <div 
        style={{ 
          padding: collapsed ? "20px 0" : "18px 16px", 
          borderBottom: "1px solid rgba(0,229,255,0.08)",
          display: "flex",
          flexDirection: collapsed ? "column" : "row",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10 }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            background: "linear-gradient(135deg,#00E5FF,#7B61FF)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            boxShadow: "0 0 12px rgba(0,229,255,0.25)", 
            flexShrink: 0 
          }}>
            <Satellite size={15} color="white" />
          </div>
          {!collapsed && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 900, color: "white", lineHeight: 1.1 }}>GeoPulse AI</div>
              <div style={{ fontSize: 8, color: "rgba(0,229,255,0.75)", letterSpacing: 1.5, fontWeight: 700, marginTop: 1 }}>SIH26070</div>
            </div>
          )}
        </div>

        {/* Collapsible toggle chevron */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "transparent",
            border: "none",
            color: "#475569",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            borderRadius: 4,
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#00E5FF"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#475569"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, padding: collapsed ? "14px 6px" : "14px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }} className="scroll-hide">
        {sections.map((section) => (
          <div key={section.title} style={{ display: "flex", flexDirection: "column" }}>
            {/* Section title header */}
            {!collapsed ? (
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1.5, fontWeight: 800, padding: "0 8px 6px", opacity: 0.8, textTransform: "uppercase" }}>
                {section.title}
              </div>
            ) : (
              <div style={{ height: 1, background: "rgba(255,255,255,0.03)", margin: "4px 8px 8px" }} />
            )}

            {/* Section items */}
            {section.items.map((item) => {
              const active = nav === item.id;
              
              return (
                <button 
                  key={item.id} 
                  onClick={() => {
                    if ((item as any).isAssistant) {
                      onOpenAssistant?.();
                    } else {
                      setNav(item.id);
                    }
                  }} 
                  style={{ 
                    width: "100%", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: collapsed ? 0 : 10, 
                    padding: collapsed ? "10px 0" : "8px 12px", 
                    borderRadius: 6, 
                    marginBottom: 3, 
                    background: active ? "rgba(0, 229, 255, 0.04)" : "transparent", 
                    border: active ? "1px solid rgba(0, 229, 255, 0.18)" : "1px solid transparent", 
                    color: active ? "#00E5FF" : "#64748B", 
                    cursor: "pointer", 
                    fontSize: 12, 
                    fontWeight: active ? 700 : 500, 
                    textAlign: collapsed ? "center" : "left", 
                    transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                    position: "relative",
                    justifyContent: collapsed ? "center" : "flex-start",
                    boxShadow: active ? "0 0 12px rgba(0, 229, 255, 0.03)" : "none"
                  }}
                  className={`hover-item ${active ? "active-item" : ""} ${collapsed ? "tooltip-right-container" : ""}`}
                >
                  {/* Left accent bar on active */}
                  {active && (
                    <div style={{ 
                      position: "absolute", 
                      left: 0, 
                      top: "20%", 
                      height: "60%", 
                      width: 2.5, 
                      background: "#00E5FF", 
                      borderRadius: "0 2px 2px 0",
                      boxShadow: "0 0 8px #00E5FF"
                    }} />
                  )}

                  <item.Icon size={14} style={{ flexShrink: 0, color: active ? "#00E5FF" : "#475569", transition: "color 0.2s, transform 0.2s" }} className="sidebar-icon" />
                  
                  {!collapsed && (
                    <span style={{ flex: 1 }}>{item.label}</span>
                  )}

                  {/* Live indicators */}
                  {!collapsed && item.live && (
                    <span style={{ 
                      width: 4, 
                      height: 4, 
                      borderRadius: "50%", 
                      background: "#00F593", 
                      boxShadow: "0 0 6px #00F593",
                      animation: "pulse-dot 1.5s infinite",
                      flexShrink: 0
                    }} />
                  )}

                  {/* Alert badges */}
                  {item.badge && (
                    <span 
                      style={{ 
                        minWidth: 14, 
                        height: 14, 
                        background: "#FF3B5C", 
                        borderRadius: 7, 
                        fontSize: 8.5, 
                        fontWeight: 800, 
                        color: "white", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        position: collapsed ? "absolute" : "static",
                        top: collapsed ? 1 : "auto",
                        right: collapsed ? 4 : "auto",
                        boxShadow: "0 0 6px rgba(255,59,92,0.4)"
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed mode tooltips */}
                  {collapsed && (
                    <div className="tooltip-right-box">
                      {item.label}
                      {item.live && <span style={{ color: "#00F593", marginLeft: 5 }}>● LIVE</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Temporal resolution mini-display telemetry (Hidden when collapsed) */}
      {!collapsed && (
        <div style={{ margin: "0 12px 12px", padding: "12px 14px", background: "rgba(123,97,255,0.04)", border: "1px solid rgba(123,97,255,0.12)", borderRadius: 10 }}>
          <div style={{ fontSize: 9, color: "#7B61FF", letterSpacing: 1.5, fontWeight: 700, marginBottom: 8 }}>TEMPORAL_RESOLUTION</div>
          {[["30 min", "#64748B", false], ["15 min", "#7B61FF", true], ["7.5 min", "#00E5FF", true]].map(([r, color, glow]) => (
            <div key={r as string} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <div style={{ width: 5.5, height: 5.5, borderRadius: "50%", background: color as string, boxShadow: glow ? `0 0 6px ${color}` : "none", flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: color as string, fontFamily: "'JetBrains Mono',monospace" }}>{r as string}</span>
            </div>
          ))}
        </div>
      )}

      {/* User Session Footer */}
      <div style={{ 
        padding: collapsed ? "12px 0" : "12px 14px", 
        borderTop: "1px solid rgba(0,229,255,0.08)",
        display: "flex",
        justifyContent: collapsed ? "center" : "flex-start",
        alignItems: "center"
      }}>
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: collapsed ? 0 : 10,
            width: "100%",
            justifyContent: collapsed ? "center" : "flex-start"
          }}
          className={collapsed ? "tooltip-right-container" : ""}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            {/* Avatar */}
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7B61FF,#00E5FF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={12} color="white" />
            </div>
            {/* Online Status Dot */}
            <div style={{ 
              position: "absolute", 
              bottom: 0, 
              right: 0, 
              width: 7.5, 
              height: 7.5, 
              borderRadius: "50%", 
              background: "#00F593", 
              border: "1.5px solid #071221",
              boxShadow: "0 0 6px #00F593"
            }} />
          </div>
          
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Research Analyst
              </span>
              <span style={{ fontSize: 8.5, color: "#64748B", fontWeight: 500 }}>
                Mission Analyst
              </span>
            </div>
          )}

          {collapsed && (
            <div className="tooltip-right-box">
              Research Analyst (Online)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ 
  navLabel, 
  onLogout,
  onOpenAssistant,
  assistantOpen
}: { 
  navLabel: string; 
  onLogout: () => void;
  onOpenAssistant: () => void;
  assistantOpen: boolean;
}) {
  const [time, setTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => { 
    const t = setInterval(() => setTime(new Date()), 1000); 
    return () => clearInterval(t); 
  }, []);

  const timeIST = time.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const timeUTC = time.toLocaleTimeString("en-GB", { timeZone: "UTC", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = time.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div 
      className="glass-panel" 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        padding: "0 24px", 
        height: 56, 
        gap: 16, 
        borderRadius: 0, 
        borderTop: "none", 
        borderLeft: "none", 
        borderRight: "none", 
        borderBottom: "1px solid rgba(0,229,255,0.14)", 
        flexShrink: 0, 
        position: "relative", 
        zIndex: 100 
      }}
    >
      {/* Brand & Active Screen Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 13.5, fontWeight: 900, color: "white", letterSpacing: "0.2px" }}>
              GeoPulse AI
            </span>
            <span style={{ 
              fontSize: 8, 
              color: "#00E5FF", 
              background: "rgba(0, 229, 255, 0.08)", 
              border: "1px solid rgba(0, 229, 255, 0.25)", 
              padding: "1px 6px", 
              borderRadius: 3, 
              fontWeight: 800, 
              fontFamily: "'JetBrains Mono', monospace",
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }}>
              <span style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "#00E5FF", display: "inline-block", animation: "pulse-dot 1s infinite" }} />
              HISTORICAL DEMO (MICHAUNG)
            </span>
          </div>
          <span style={{ fontSize: 9, color: "rgba(0, 229, 255, 0.8)", letterSpacing: "1px", fontWeight: 700, textTransform: "uppercase" }}>
            EARTH & ATMOSPHERIC INTELLIGENCE <span style={{ color: "#475569", margin: "0 4px" }}>|</span> <span style={{ color: "white" }}>{navLabel}</span>
          </span>
        </div>
      </div>

      {/* Center: Global Search Console */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 280, display: "flex", alignItems: "center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ position: "absolute", left: 10, pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search satellite, region, mission, job ID..."
            style={{
              width: "100%",
              background: "rgba(4, 8, 17, 0.4)",
              border: "1px solid rgba(0, 229, 255, 0.12)",
              borderRadius: 6,
              padding: "6px 64px 6px 28px",
              fontSize: 10,
              color: "white",
              outline: "none",
              fontFamily: "var(--font-sans)",
              transition: "all 0.2s"
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.35)";
              e.currentTarget.style.boxShadow = "0 0 10px rgba(0, 229, 255, 0.05)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.12)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <div style={{ 
            position: "absolute", 
            right: 8, 
            fontSize: 8.5, 
            color: "#64748B", 
            background: "rgba(255,255,255,0.03)", 
            border: "1px solid rgba(255,255,255,0.08)", 
            padding: "2px 5px", 
            borderRadius: 4,
            fontFamily: "'JetBrains Mono', monospace",
            pointerEvents: "none"
          }}>
            Ctrl + K
          </div>
        </div>
      </div>

      {/* Right side operational tools */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        
        {/* Persistent GeoPulse AI Assistant Button */}
        <button
          onClick={onOpenAssistant}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 12px",
            borderRadius: 6,
            background: assistantOpen ? "linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(123, 97, 255, 0.25))" : "rgba(0, 229, 255, 0.08)",
            border: "1px solid rgba(0, 229, 255, 0.35)",
            color: "white",
            cursor: "pointer",
            fontSize: 10.5,
            fontWeight: 800,
            fontFamily: "var(--font-heading)",
            boxShadow: assistantOpen ? "0 0 14px rgba(0, 229, 255, 0.35)" : "0 0 8px rgba(0, 229, 255, 0.1)",
            transition: "all 0.2s"
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00F593", boxShadow: "0 0 6px #00F593", animation: "pulse-dot 1.2s infinite" }} />
          <Brain size={13} color="#00E5FF" />
          <span>AI ASSISTANT</span>
        </button>
        
        {/* Single Compact SYSTEM STATUS Trigger Button (Replaces Tag Pills) */}
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => setStatusOpen(!statusOpen)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 6, 
              padding: "5px 10px", 
              borderRadius: 6, 
              background: statusOpen ? "rgba(0, 229, 255, 0.15)" : "rgba(0, 229, 255, 0.06)", 
              border: "1px solid rgba(0, 229, 255, 0.25)",
              color: "#00E5FF",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.2s"
            }}
          >
            <span style={{ fontSize: 12, lineHeight: 1 }}>◉</span>
            <span>SYSTEM STATUS</span>
          </button>
          <SystemStatusDrawer isOpen={statusOpen} onClose={() => setStatusOpen(false)} />
        </div>

        {/* Dual Clocks IST/UTC */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 10, borderLeft: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "white" }}>
              <span>{timeIST} IST</span>
              <span style={{ color: "#475569" }}>·</span>
              <span style={{ color: "#00E5FF" }}>{timeUTC} UTC</span>
            </div>
            <span style={{ fontSize: 9, color: "#64748B", fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
              {dateStr.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Bell / Notifications */}
        <div className="tooltip-container" style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          <div style={{ position: "relative", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={15} color="#64748B" style={{ transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "white"} onMouseLeave={(e) => e.currentTarget.style.color = "#64748B"} />
            <div style={{ position: "absolute", top: -2, right: -2, width: 12, height: 12, borderRadius: "50%", background: "#FF3B5C", fontSize: 8, fontWeight: 800, color: "white", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse-dot 1.5s infinite" }}>5</div>
          </div>
          <div className="tooltip-box">Recent mission alerts</div>
        </div>

        {/* User Profile Selector Capsule */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              cursor: "pointer", 
              padding: "4px 8px", 
              borderRadius: 6,
              background: "rgba(255,255,255,0.02)",
              border: profileOpen ? "1px solid rgba(0, 229, 255, 0.25)" : "1px solid rgba(255,255,255,0.04)",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.25)";
              e.currentTarget.style.background = "rgba(0, 229, 255, 0.02)";
            }}
            onMouseLeave={(e) => {
              if (!profileOpen) {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }
            }}
          >
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#7B61FF,#00E5FF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={11} color="white" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "white" }}>Research Analyst</span>
              <span style={{ fontSize: 8.5, color: "#64748B" }}>Mission Analyst</span>
            </div>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="3" style={{ transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          {/* Profile options overlay */}
          {profileOpen && (
            <div 
              style={{ 
                position: "absolute", 
                top: "100%", 
                right: 0, 
                marginTop: 8, 
                width: 140, 
                background: "#071221", 
                border: "1px solid rgba(0, 229, 255, 0.2)", 
                borderRadius: 8, 
                padding: "4px", 
                display: "flex", 
                flexDirection: "column", 
                gap: 2, 
                zIndex: 110,
                boxShadow: "0 8px 32px rgba(4,8,17,0.8)" 
              }}
            >
              {[
                { label: "Profile", onClick: () => setProfileOpen(false) },
                { label: "Mission Logs", onClick: () => setProfileOpen(false) },
                { label: "Settings", onClick: () => setProfileOpen(false) },
                { label: "Sign Out", onClick: () => { setProfileOpen(false); onLogout(); }, color: "#FF3B5C" }
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.onClick}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    color: opt.color || "#E2E8F0",
                    padding: "6px 10px",
                    borderRadius: 4,
                    fontSize: 10.5,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    fontWeight: opt.color ? 700 : 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = opt.color ? "rgba(255, 59, 92, 0.08)" : "rgba(0, 229, 255, 0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── GlobalTelemetryStrip ──────────────────────────────────────────────────────
function GlobalTelemetryStrip({ elapsedSeconds }: { elapsedSeconds: number }) {
  const elapsedMin = Math.floor(elapsedSeconds / 60);
  const elapsedSec = elapsedSeconds % 60;
  const elapsedHrs = Math.floor(elapsedMin / 60);
  const elapsedMinDisplay = elapsedMin % 60;
  
  const elapsedStr = `${elapsedHrs.toString().padStart(2, '0')}:${elapsedMinDisplay.toString().padStart(2, '0')}:${elapsedSec.toString().padStart(2, '0')}`;
  
  const fps = 70 + (elapsedSeconds % 3) - (elapsedSeconds % 2);
  
  return (
    <div 
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(7, 18, 33, 0.65)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(0, 229, 255, 0.08)",
        padding: "4px 24px",
        height: 28,
        fontSize: 9.5,
        fontFamily: "'JetBrains Mono', monospace",
        color: "#64748B",
        zIndex: 90,
        flexShrink: 0
      }}
      className="heartbeat-telemetry"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 800, color: "#FF3B5C" }}>
          <span style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: "#FF3B5C", display: "inline-block", animation: "pulse-dot 1s infinite" }} />
          HISTORICAL EVENT
        </span>
        <span style={{ color: "#334155" }}>|</span>
        <span>SAT: <span style={{ color: "#00F593", fontWeight: 700 }}>INSAT-3D</span></span>
        <span style={{ color: "#334155" }}>|</span>
        <span>RES: <span style={{ color: "#00E5FF" }}>30m (OBSERVED) → 15m (INTERPOLATED)</span></span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>TRACK: <span style={{ color: "#00F593", fontWeight: 700 }}>NOAA IBTrACS</span></span>
        <span style={{ color: "#334155" }}>|</span>
        <span>MODEL LINK: <span style={{ color: "#FFB800", fontWeight: 700 }}>NOT CONNECTED / DEMO</span></span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>ENGINE: <span style={{ color: "#00E5FF" }}>{fps} FPS</span></span>
        <span style={{ color: "#334155" }}>|</span>
        <span>EVENT: <span style={{ color: "white", fontWeight: 700 }}>Cyclone Michaung (Dec 2023)</span></span>
      </div>
    </div>
  );
}

// ─── App (default export) ─────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nav, setNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(2538); // 42m 18s

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <BackgroundControl>
      <style>{GLOBAL_CSS}</style>
      <StarBackground />

      {!isLoggedIn ? (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "var(--font-sans)", color: "#E2E8F0" }}>
          
          {/* Main Sidebar */}
          <Sidebar nav={nav} setNav={setNav} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} onOpenAssistant={() => setAssistantOpen(true)} />
          
          {/* Dashboard Viewport Panel */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 10 }}>
            
            {/* Mission Header */}
            <TopBar navLabel={NAV_LABELS[nav] ?? nav} onLogout={() => setIsLoggedIn(false)} onOpenAssistant={() => setAssistantOpen(true)} assistantOpen={assistantOpen} />
            
            {/* Global Telemetry status Strip */}
            <GlobalTelemetryStrip elapsedSeconds={elapsedSeconds} />
            
            {/* Router Page Containers */}
            <div className="scroll-hide" style={{ flex: 1, overflowY: nav === "viewer" ? "hidden" : "auto" }}>
              {nav === "dashboard"  && <DashboardScreen elapsedSeconds={elapsedSeconds} onNavigate={(tab) => setNav(tab)} />}
              {nav === "identify"   && <IdentificationScreen onNavigate={(tab) => setNav(tab)} />}
              {nav === "classify"   && <ClassificationScreen onNavigate={(tab) => setNav(tab)} />}
              {nav === "intensity"  && <IntensityScreen onNavigate={(tab) => setNav(tab)} />}
              {nav === "predict"    && <PredictionScreen onNavigate={(tab) => setNav(tab)} />}
              {nav === "landfall"   && <LandfallScreen onNavigate={(tab) => setNav(tab)} />}
              {nav === "viewer"     && <ViewerScreen onNavigate={(tab) => setNav(tab)} />}



              {nav === "satellites" && <SatellitesScreen onNavigate={(tab) => setNav(tab)} />}
              {nav === "metrics"    && <MetricsScreen onNavigate={(tab) => setNav(tab)} />}
              {nav === "events"     && <EventsScreen onNavigate={(tab) => setNav(tab)} />}
              {nav === "xai"        && <XAIScreen onNavigate={(tab) => setNav(tab)} />}
              {nav === "downloads"  && <DownloadsScreen />}
              {nav === "settings"   && <SettingsScreen />}
            </div>
          </div>

          {/* GeoPulse AI Assistant Slide-Out Panel */}
          <GeoPulseAIAssistant 
            isOpen={assistantOpen} 
            onClose={() => setAssistantOpen(false)} 
            currentNav={nav} 
            onNavigate={(tab) => setNav(tab)} 
          />

        </div>
      )}
    </BackgroundControl>
  );
}
