import React, { useEffect, useRef, useState } from "react";
import { 
  Satellite, Activity, TrendingUp, AlertTriangle, ArrowRight,
  Radio, Cpu, Brain, Shield, CheckCircle, Clock, Zap, Cpu as GpuIcon,
  Database, Wifi, Layers
} from "lucide-react";
import { JOBS, SATELLITES, G } from "../data";

// ─── Centerpiece: Premium Animated Orbital Visualization ───
// ─── Centerpiece: Satellite Frame Scan Visual Console ───
function SatelliteFrameScan({ type }: { type: "original" | "interpolated" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let frameId: number;
    let t = 0;
    
    function draw() {
      t += 0.015;
      
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      
      const w = canvas.width;
      const h = canvas.height;
      
      ctx.clearRect(0, 0, w, h);
      
      const cX = w / 2;
      const cY = h / 2;
      const r = Math.min(w, h) * 0.44;
      
      // Draw telemetry coordinate grid
      ctx.strokeStyle = "rgba(0, 220, 255, 0.03)";
      ctx.lineWidth = 0.8;
      
      // Concentric circles
      ctx.beginPath(); ctx.arc(cX, cY, r * 0.35, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cX, cY, r * 0.7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cX, cY, r, 0, Math.PI * 2); ctx.stroke();
      
      // Radial axes
      ctx.beginPath(); ctx.moveTo(cX - r, cY); ctx.lineTo(cX + r, cY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cX, cY - r); ctx.lineTo(cX, cY + r); ctx.stroke();
      
      // Draw simulated cloud blobs / cyclone structures
      ctx.fillStyle = type === "original" ? "rgba(226, 232, 240, 0.22)" : "rgba(0, 229, 255, 0.28)";
      ctx.shadowBlur = 10;
      ctx.shadowColor = type === "original" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 229, 255, 0.35)";
      
      // Offset center coordinates to simulate wind displacement over time
      const shiftX = type === "original" ? -5 : 5;
      const shiftY = type === "original" ? -3 : 3;
      
      // Core center density
      ctx.beginPath();
      ctx.arc(cX + shiftX, cY + shiftY, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      
      // Swirling arms of the storm
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        const armX = cX + shiftX + Math.cos(angle + t * 0.1) * r * 0.38;
        const armY = cY + shiftY + Math.sin(angle + t * 0.1) * r * 0.38;
        ctx.beginPath();
        ctx.arc(armX, armY, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.shadowBlur = 0; // reset shadows
      
      // Sonar radar sweep line
      const sweepAngle = t * 0.7;
      ctx.strokeStyle = type === "original" ? "rgba(226, 232, 240, 0.14)" : "rgba(0, 229, 255, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cX, cY);
      ctx.lineTo(cX + Math.cos(sweepAngle) * r, cY + Math.sin(sweepAngle) * r);
      ctx.stroke();
      
      // Scanning line raster effect
      const scanY = (t * 14) % h;
      ctx.strokeStyle = type === "original" ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 229, 255, 0.08)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();
      
      frameId = requestAnimationFrame(draw);
    }
    
    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [type]);
  
  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}

// ─── Centerpiece: Animated Neural Connection and Particle Flow ───
function NeuralProcessingFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let frameId: number;
    let t = 0;
    
    const particles: Array<{ x: number; y: number; speed: number; yOffset: number; size: number; color: string }> = [];
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * 100,
        y: 0,
        speed: 0.6 + Math.random() * 0.7,
        yOffset: (Math.random() - 0.5) * 26,
        size: 1 + Math.random() * 1.5,
        color: Math.random() > 0.45 ? "#00E5FF" : "#7B61FF"
      });
    }
    
    function draw() {
      t += 0.015;
      
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      
      const w = canvas.width;
      const h = canvas.height;
      
      ctx.clearRect(0, 0, w, h);
      
      const cY = h / 2;
      
      // Floating flow guide paths
      ctx.strokeStyle = "rgba(0, 220, 255, 0.05)";
      ctx.lineWidth = 0.8;
      
      const paths = [
        { yStart: cY - 15, yEnd: cY - 15, ctrl1Y: cY - 35, ctrl2Y: cY + 5 },
        { yStart: cY, yEnd: cY, ctrl1Y: cY - 10, ctrl2Y: cY + 10 },
        { yStart: cY + 15, yEnd: cY + 15, ctrl1Y: cY + 35, ctrl2Y: cY - 5 }
      ];
      
      paths.forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(0, p.yStart);
        ctx.bezierCurveTo(w * 0.35, p.ctrl1Y, w * 0.65, p.ctrl2Y, w, p.yEnd);
        ctx.stroke();
      });
      
      // Update and draw traversing particles
      particles.forEach((p) => {
        p.x += p.speed;
        if (p.x > 100) {
          p.x = 0;
          p.yOffset = (Math.random() - 0.5) * 30;
        }
        
        const posX = (p.x / 100) * w;
        const posY = cY + p.yOffset + Math.sin((p.x / 100) * Math.PI) * 12 * Math.sin(t * 1.5);
        
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(posX, posY, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add tiny flow trails
        ctx.fillStyle = p.color === "#00E5FF" ? "rgba(0, 229, 255, 0.12)" : "rgba(123, 97, 255, 0.12)";
        ctx.beginPath();
        ctx.arc(posX - p.speed * 1.4, posY, p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw neural connectivity layout node clusters
      const nodes = [
        { x: w * 0.3, y: cY - 20, size: 3.5, glow: "#7B61FF" },
        { x: w * 0.5, y: cY - 5, size: 5.5, glow: "#00E5FF" },
        { x: w * 0.7, y: cY + 15, size: 3.5, glow: "#7B61FF" },
        { x: w * 0.35, y: cY + 15, size: 3, glow: "#00E5FF" },
        { x: w * 0.65, y: cY - 15, size: 3, glow: "#00F593" }
      ];
      
      ctx.strokeStyle = "rgba(0, 229, 255, 0.1)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[1].x, nodes[1].y);
      ctx.lineTo(nodes[2].x, nodes[2].y);
      ctx.moveTo(nodes[3].x, nodes[3].y);
      ctx.lineTo(nodes[1].x, nodes[1].y);
      ctx.lineTo(nodes[4].x, nodes[4].y);
      ctx.stroke();
      
      nodes.forEach((n) => {
        const pulse = 1 + Math.sin(t * 2.5 + n.x) * 0.22;
        ctx.shadowBlur = 5 * pulse;
        ctx.shadowColor = n.glow;
        ctx.fillStyle = n.glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * pulse, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      
      frameId = requestAnimationFrame(draw);
    }
    
    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, []);
  
  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}

// Count-up helper for stats dashboard counters
function DashboardCounter({ baseValue, precision, unit = "", driftRange = 0, suffix = "" }: { baseValue: number; precision: number; unit?: string; driftRange?: number; suffix?: string }) {
  const [val, setVal] = useState(baseValue * 0.7);

  useEffect(() => {
    let start = baseValue * 0.7;
    if (baseValue < 0.1) start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const anim = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress);
      setVal(start + (baseValue - start) * ease);

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        if (driftRange > 0) {
          const interval = setInterval(() => {
            setVal((prev) => {
              const drift = (Math.random() - 0.5) * 2 * driftRange;
              return Math.min(baseValue + driftRange, Math.max(baseValue - driftRange, baseValue + drift));
            });
          }, 1500 + Math.random() * 500);
          return () => clearInterval(interval);
        }
      }
    };
    requestAnimationFrame(anim);
  }, [baseValue, driftRange]);

  return (
    <span>
      {val.toFixed(precision)}{unit}{suffix}
    </span>
  );
}

// Fading Live Telemetry Message Ticker
function TelemetryMessageTicker() {
  const messages = [
    "Receiving INSAT-3DS raw frames (30-minute intervals)...",
    "Cloud motion vector fields estimated via optical flow...",
    "Temporal interpolation task complete (15-minute generation)...",
    "Estimated optical flow fields generated and stored...",
    "SSIM and PSNR validation gates checked: PASS",
    "Cyclone intensity index increasing in Bay of Bengal...",
    "Ground truth observation frames prepared for validation...",
    "TemporalNet AI inference latency optimized..."
  ];
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="glass-panel"
      style={{ 
        display: "flex", 
        alignItems: "center", 
        padding: "8px 24px", 
        borderRadius: 8, 
        border: "1px solid rgba(0, 220, 255, 0.08)",
        background: "rgba(4, 8, 17, 0.35)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10.5,
        height: 36
      }}
    >
      <span style={{ color: "#00E5FF", marginRight: 8, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: "#00E5FF", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />
        ▸ LIVE_TELEMETRY_STREAM:
      </span>
      <span style={{ 
        color: "#94A3B8", 
        opacity: fade ? 1 : 0, 
        transition: "opacity 0.3s ease" 
      }}>
        {messages[idx].toUpperCase()}
      </span>
    </div>
  );
}

export default function DashboardScreen({ elapsedSeconds }: { elapsedSeconds: number }) {
  const [progressVal, setProgressVal] = useState(0);
  const [activeIndicator, setActiveIndicator] = useState(0);
  const [jobFilter, setJobFilter] = useState("All");
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const now = new Date();
  const currentTime = now.toISOString().slice(11, 19) + " UTC";

  useEffect(() => {
    const timer = setTimeout(() => setProgressVal(78), 100);
    return () => clearTimeout(timer);
  }, []);

  const enrichedJobs = [
    {
      id: "JOB-2847",
      sat: "INSAT-3DS",
      satType: "Geostationary",
      region: "Bay of Bengal",
      coords: "13.2°N, 82.4°E",
      timestamp: "12:04:12",
      progress: 78,
      frames: "12 / 16",
      confidence: "94.2%",
      confidenceLevel: "High Confidence",
      ssim: "0.942",
      psnr: "36.1 dB",
      qualityBadge: "PASS",
      status: "running",
      duration: "2.3 sec"
    },
    {
      id: "JOB-2846",
      sat: "GOES-19",
      satType: "Geostationary",
      region: "Gulf of Mexico",
      coords: "25.3°N, 90.1°W",
      timestamp: "11:58:30",
      progress: 100,
      frames: "16 / 16",
      confidence: "88.5%",
      confidenceLevel: "Nominal",
      ssim: "0.938",
      psnr: "35.4 dB",
      qualityBadge: "PASS",
      status: "complete",
      duration: "2.1 sec"
    },
    {
      id: "JOB-2845",
      sat: "Himawari-8",
      satType: "Geostationary",
      region: "West Pacific",
      coords: "12.5°N, 135.2°E",
      timestamp: "11:45:15",
      progress: 100,
      frames: "16 / 16",
      confidence: "96.1%",
      confidenceLevel: "High Confidence",
      ssim: "0.961",
      psnr: "38.2 dB",
      qualityBadge: "PASS",
      status: "complete",
      duration: "2.1 sec"
    },
    {
      id: "JOB-2844",
      sat: "INSAT-3DS",
      satType: "Geostationary",
      region: "Arabian Sea",
      coords: "10.0°N, 65.4°E",
      timestamp: "11:32:00",
      progress: 100,
      frames: "16 / 16",
      confidence: "92.4%",
      confidenceLevel: "Nominal",
      ssim: "0.924",
      psnr: "34.8 dB",
      qualityBadge: "PASS",
      status: "complete",
      duration: "2.4 sec"
    },
    {
      id: "JOB-2843",
      sat: "Sentinel-3A",
      satType: "Polar Orbiting",
      region: "North India",
      coords: "30.1°N, 79.2°E",
      timestamp: "11:15:45",
      progress: 0,
      frames: "0 / 16",
      confidence: "—",
      confidenceLevel: "—",
      ssim: "—",
      psnr: "—",
      qualityBadge: "—",
      status: "queued",
      duration: "—"
    }
  ];

  const filteredJobs = enrichedJobs.filter((job) => {
    if (jobFilter === "All") return true;
    if (jobFilter === "Running") return job.status === "running";
    if (jobFilter === "Completed") return job.status === "complete";
    if (jobFilter === "Queued") return job.status === "queued";
    if (jobFilter === "Today") return true;
    return true;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndicator((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);



  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const telStr = [
    "INSAT-3DS · GEO 82°E · Signal: 98% · Temp: 287K",
    "Cyclone Michaung · 13.2°N 82.4°E · Cat-3 · 165 km/h",
    "JOB-2847 Complete · SSIM: 0.942 · Infer: 2.3s",
    "GOES-19 · GEO 75°W · Signal: 96% · Cloud: 52%",
    "Himawari-8 · GEO 140.7°E · Signal: 99%",
    "Heavy Rain Alert · Western Ghats · 180 mm/hr",
    "30min → 15min → 7.5min interpolation ACTIVE",
  ].join("  ·  ");

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 28 }}>
      
      {/* ─── Top Mission Banner: AI Status Indicator ─── */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: "12px 24px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          borderLeft: "4px solid #00E5FF",
          background: "rgba(12,20,35,0.85)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00E5FF", animation: "pulse-dot 2s infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, color: "#E2E8F0" }}>
            MISSION STATUS: <span style={{ color: "#00E5FF", fontFamily: "var(--font-heading)" }}>ACTIVE INTERPOLATION IN PROGRESS</span>
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, letterSpacing: 0.5 }}>
          This AI system is currently generating missing satellite frames.
        </div>
      </div>

      {/* ─── Redesigned Split Hero Section ─── */}
      <div 
        className="hero-grid"
        style={{ 
          gap: 24,
          alignItems: "stretch"
        }}
      >
        {/* Mission Overview Details Card */}
        <div 
          className="glass-panel-neon animate-glow" 
          style={{ 
            padding: "20px 24px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "14px",
            justifyContent: "space-between",
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease",
            cursor: "default"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {/* Style block for animations */}
          <style>{`
            @keyframes progress-gradient-slide {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes slow-pulse-badge {
              0%, 100% { 
                opacity: 0.85; 
                box-shadow: 0 0 4px rgba(0, 229, 255, 0.05); 
                border-color: rgba(0, 229, 255, 0.08);
              }
              50% { 
                opacity: 1; 
                box-shadow: 0 0 12px rgba(0, 229, 255, 0.25); 
                border-color: rgba(0, 229, 255, 0.3);
              }
            }
            @keyframes log-fade-in {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .stage-highlight {
              color: #00E5FF !important;
              font-weight: 700 !important;
              text-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
            }
            .progress-milestone {
              position: absolute;
              top: 50%;
              transform: translate(-50%, -50%);
              width: 4px;
              height: 4px;
              border-radius: 50%;
              z-index: 10;
              transition: background 0.3s ease;
            }
          `}</style>

          {/* 1. HEADER */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ 
                  fontFamily: "var(--font-heading)", 
                  fontSize: 15, 
                  fontWeight: 800, 
                  color: "white", 
                  letterSpacing: "0.5px",
                  textTransform: "uppercase" 
                }}>
                  Mission Overview
                </span>
                <span style={{
                  fontSize: 9,
                  color: "#00F593",
                  background: "rgba(0, 245, 147, 0.08)",
                  border: "1px solid rgba(0, 245, 147, 0.2)",
                  padding: "1.5px 6px",
                  borderRadius: 4,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: 0.5
                }}>
                  Live Processing
                </span>
              </div>
              <span style={{ fontSize: 9, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>
                SYS_LOC: IST
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, lineHeight: 1.4 }}>
              AI-powered temporal enhancement of geostationary weather satellite observations.
            </p>
          </div>

          {/* 2. MISSION SUMMARY (Two-Column Layout) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5.5 }}>
              {/* Mission */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Mission</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#E2E8F0", textAlign: "right" }} title="INSAT-3DS Temporal Resolution Enhancement">INSAT-3DS Temporal Resolution Enhancement</span>
              </div>
              {/* Region */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Region</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#E2E8F0" }}>Bay of Bengal</span>
              </div>
              {/* Current Job */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Current Job</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace" }}>JOB-2847</span>
              </div>
              {/* Status */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Status</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#00F593", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00F593", display: "inline-block", animation: "pulse-dot 2s infinite" }} />
                  Live Processing
                </span>
              </div>
              {/* Current Stage */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Current Stage</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#E2E8F0" }}>Temporal Frame Synthesis</span>
              </div>
              {/* Generated Frames */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Generated Frames</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#E2E8F0", fontFamily: "'JetBrains Mono', monospace" }}>
                  <DashboardCounter baseValue={12} precision={0} suffix=" / 16" />
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5.5 }}>
              {/* Progress */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Progress</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace" }}>
                  <DashboardCounter baseValue={78} precision={0} suffix="%" />
                </span>
              </div>
              {/* Temporal Resolution */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Temporal Resolution</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: "#7B61FF", fontFamily: "'JetBrains Mono', monospace" }}>30 min → 15 min → 7.5 min</span>
              </div>
              {/* Current Model */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Current Model</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#E2E8F0" }}>TemporalNet v2.1</span>
              </div>
              {/* Inference Time */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Inference Time</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#FFB800", fontFamily: "'JetBrains Mono', monospace" }}>
                  <DashboardCounter baseValue={2.3} precision={1} suffix=" sec" />
                </span>
              </div>
              {/* AI Confidence */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>AI Confidence</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#00F593", fontFamily: "'JetBrains Mono', monospace" }}>
                  <DashboardCounter baseValue={94.2} precision={1} unit="%" driftRange={0.05} />
                </span>
              </div>
              {/* Estimated Completion */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Estimated Completion</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace" }}>
                  <DashboardCounter baseValue={18} precision={0} suffix=" sec" />
                </span>
              </div>
            </div>
          </div>

          {/* 3. PROGRESS SECTION */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 9.5, color: "#64748B", fontWeight: 700, letterSpacing: 1 }}>PIPELINE PROGRESS</span>
              <span style={{ fontSize: 11, color: "#00E5FF", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                78%
              </span>
            </div>
            
            {/* Thick progress track */}
            <div style={{ 
              height: 10, 
              background: "rgba(255,255,255,0.04)", 
              borderRadius: 5, 
              position: "relative",
              border: "1px solid rgba(255,255,255,0.05)",
              overflow: "visible"
            }}>
              {/* Milestone Markers on Track */}
              <div className="progress-milestone" style={{ left: "0%", background: "#7B61FF" }} />
              <div className="progress-milestone" style={{ left: "25%", background: "#7B61FF" }} />
              <div className="progress-milestone" style={{ left: "50%", background: "#7B61FF" }} />
              <div className="progress-milestone" style={{ left: "75%", background: "#7B61FF" }} />
              <div className="progress-milestone" style={{ left: "100%", background: "rgba(255,255,255,0.2)" }} />

              {/* Animated Progress Fill */}
              <div 
                style={{ 
                  width: `${progressVal}%`, 
                  height: "100%", 
                  background: "linear-gradient(90deg, #7B61FF, #00E5FF, #7B61FF)", 
                  backgroundSize: "200% auto",
                  borderRadius: 5,
                  transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  animation: "progress-gradient-slide 4s linear infinite",
                  position: "absolute",
                  top: 0,
                  left: 0
                }} 
              />
            </div>

            {/* Stages List */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 8.5, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>CURRENT STAGE</div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                fontSize: 9, 
                color: "#64748B",
                fontFamily: "'JetBrains Mono', monospace",
                background: "rgba(4, 8, 17, 0.4)",
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.02)"
              }}>
                <span style={{ color: "#E2E8F0" }}>Input</span>
                <span>→</span>
                <span style={{ color: "#E2E8F0" }}>Optical Flow</span>
                <span>→</span>
                <span style={{ color: "#E2E8F0" }}>Feature Extraction</span>
                <span>→</span>
                <span className="stage-highlight" style={{
                  color: "#00E5FF",
                  fontWeight: 700,
                  textShadow: "0 0 8px rgba(0, 229, 255, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 3
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#00E5FF", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />
                  TemporalNet
                </span>
                <span>→</span>
                <span>Validation</span>
                <span>→</span>
                <span>Output</span>
              </div>
            </div>
          </div>

          {/* 4. MISSION HEALTH */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {[
              { label: "GPU", val: "82%", color: "#00E5FF", Icon: Cpu },
              { label: "VRAM", val: "11.2 GB", color: "#7B61FF", Icon: Database },
              { label: "Signal", val: "98%", color: "#FFB800", Icon: Wifi },
              { label: "Quality Gate", val: "PASS", color: "#00F593", Icon: Shield }
            ].map((b, i) => {
              const Icon = b.Icon;
              return (
                <div 
                  key={i} 
                  style={{
                    background: "rgba(12, 20, 35, 0.45)",
                    border: "1px solid rgba(0, 220, 255, 0.08)",
                    borderRadius: 8,
                    padding: "6px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    animation: "slow-pulse-badge 3s infinite ease-in-out",
                    animationDelay: `${i * 0.4}s`
                  }}
                >
                  <Icon size={12} color={b.color} style={{ flexShrink: 0 }} />
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontSize: 7.5, color: "#64748B", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.label}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: "#E2E8F0", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.val}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. LIVE ACTIVITY FEED */}
          <div style={{
            background: "rgba(4, 8, 17, 0.5)",
            border: "1px solid rgba(0, 220, 255, 0.05)",
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            height: 90,
            overflowY: "auto"
          }} className="scroll-hide">
            {[
              { time: "12:04:12", text: "Receiving INSAT-3DS observation...", type: "info" },
              { time: "12:04:15", text: "Optical Flow estimated.", type: "success" },
              { time: "12:04:18", text: "Synthesizing intermediate frame...", type: "process" },
              { time: "12:04:22", text: "Validation completed.", type: "success" },
              { time: "12:04:23", text: "SSIM threshold passed.", type: "success" },
              { time: "12:04:25", text: "Latest frame exported.", type: "success" }
            ].map((act, idx) => (
              <div 
                key={idx}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8,
                  fontSize: 10,
                  lineHeight: 1.2,
                  animation: `log-fade-in 0.5s ease-out forwards`,
                  animationDelay: `${idx * 0.15}s`,
                  opacity: 0
                }}
              >
                <span style={{ color: "#64748B", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                  [{act.time}]
                </span>
                <span style={{ 
                  width: 5, 
                  height: 5, 
                  borderRadius: "50%", 
                  background: act.type === "success" ? "#00F593" : act.type === "process" ? "#00E5FF" : "#7B61FF",
                  flexShrink: 0
                }} />
                <span style={{ color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {act.text}
                </span>
              </div>
            ))}
          </div>

          {/* 6. FOOTER */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
            paddingTop: 8,
            fontSize: 9,
            color: "#64748B",
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={10} color="#64748B" />
              MISSION TIME: <span style={{ color: "#94A3B8" }}>{currentTime || "12:04:08 UTC"}</span>
            </span>
            <span>
              ELAPSED: <span style={{ color: "#94A3B8" }}>{formatElapsed(elapsedSeconds)}</span>
            </span>
            <span>
              LAST UPDATE: <span style={{ color: "#00E5FF" }}>{((elapsedSeconds % 3) + 1).toFixed(1)}s AGO</span>
            </span>
          </div>
        </div>

        {/* Live AI Processing Preview centerpiece panel */}
        <div 
          className="glass-panel-neon animate-glow" 
          style={{ 
            height: 380, 
            position: "relative", 
            overflow: "hidden", 
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease",
            cursor: "default"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ 
                  fontFamily: "var(--font-heading)", 
                  fontSize: 15, 
                  fontWeight: 800, 
                  color: "white", 
                  letterSpacing: "0.5px",
                  textTransform: "uppercase" 
                }}>
                  Live AI Frame Synthesis
                </span>
                <span style={{
                  fontSize: 9,
                  color: "#FF4D6D",
                  background: "rgba(255, 77, 109, 0.08)",
                  border: "1px solid rgba(255, 77, 109, 0.2)",
                  padding: "1.5px 6px",
                  borderRadius: 4,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  animation: "pulse-dot 2s infinite"
                }}>
                  Live
                </span>
              </div>
              <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, lineHeight: 1.4 }}>
                Real-time temporal interpolation of INSAT-3DS observations.
              </p>
            </div>
            
            {/* Interpolation Indicator */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 5, 
              fontSize: 9, 
              fontFamily: "'JetBrains Mono', monospace", 
              background: "rgba(4, 8, 17, 0.4)",
              padding: "3px 8px",
              borderRadius: 6,
              border: "1px solid rgba(255, 255, 255, 0.02)"
            }}>
              <span style={{ color: activeIndicator === 0 ? "#00E5FF" : "#64748B", fontWeight: activeIndicator === 0 ? 700 : 400, transition: "color 0.4s", textShadow: activeIndicator === 0 ? "0 0 6px #00E5FF" : "none" }}>30 min</span>
              <span style={{ color: "#64748B" }}>→</span>
              <span style={{ color: activeIndicator === 1 ? "#00E5FF" : "#64748B", fontWeight: activeIndicator === 1 ? 700 : 400, transition: "color 0.4s", textShadow: activeIndicator === 1 ? "0 0 6px #00E5FF" : "none" }}>15 min</span>
              <span style={{ color: "#64748B" }}>→</span>
              <span style={{ color: activeIndicator === 2 ? "#00E5FF" : "#64748B", fontWeight: activeIndicator === 2 ? 700 : 400, transition: "color 0.4s", textShadow: activeIndicator === 2 ? "0 0 6px #00E5FF" : "none" }}>7.5 min</span>
            </div>
          </div>

          {/* Main Visualization Split Layout */}
          <div style={{ display: "flex", alignItems: "stretch", height: 160, gap: 10, margin: "6px 0" }}>
            {/* Left Box: Original Satellite Frame */}
            <div style={{ 
              flex: "1 1 31%", 
              border: "1px solid rgba(255, 255, 255, 0.04)", 
              background: "rgba(4, 8, 17, 0.35)", 
              borderRadius: "8px", 
              display: "flex", 
              flexDirection: "column", 
              padding: "6px", 
              position: "relative", 
              overflow: "hidden" 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7.5, color: "#64748B", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                <span>ORIGINAL (t = 0m)</span>
                <span>30-MIN CAPTURE</span>
              </div>
              <div style={{ flex: 1, position: "relative", borderRadius: 4, overflow: "hidden" }}>
                <SatelliteFrameScan type="original" />
              </div>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: "#94A3B8", marginTop: 4, textAlign: "center", fontFamily: "var(--font-heading)" }}>
                INPUT RESOLUTION
              </div>
            </div>

            {/* Center Box: Animated AI Processing */}
            <div style={{ 
              flex: "1 1 38%", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "center", 
              position: "relative",
              borderRadius: "8px",
              overflow: "hidden"
            }}>
              <div style={{ flex: 1, position: "relative" }}>
                <NeuralProcessingFlow />
                <div style={{ 
                  position: "absolute", 
                  top: "50%", 
                  left: "50%", 
                  transform: "translate(-50%, -50%)", 
                  background: "rgba(4, 8, 17, 0.8)", 
                  border: "1px solid rgba(0, 229, 255, 0.2)", 
                  padding: "4px 8px", 
                  borderRadius: 4,
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#00E5FF",
                  fontFamily: "'JetBrains Mono', monospace",
                  pointerEvents: "none",
                  boxShadow: "0 0 10px rgba(0, 229, 255, 0.15)",
                  letterSpacing: 0.5
                }}>
                  SYNTHESIS_CORE
                </div>
              </div>
            </div>

            {/* Right Box: Generated Intermediate Frame */}
            <div style={{ 
              flex: "1 1 31%", 
              border: "1px solid rgba(0, 229, 255, 0.18)", 
              background: "rgba(4, 8, 17, 0.35)", 
              borderRadius: "8px", 
              display: "flex", 
              flexDirection: "column", 
              padding: "6px", 
              position: "relative", 
              overflow: "hidden",
              boxShadow: "0 0 12px rgba(0, 229, 255, 0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7.5, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                <span>GENERATED (t = +15m)</span>
                <span>15-MIN INTERP</span>
              </div>
              <div style={{ flex: 1, position: "relative", borderRadius: 4, overflow: "hidden" }}>
                <SatelliteFrameScan type="interpolated" />
              </div>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: "#00E5FF", marginTop: 4, textAlign: "center", fontFamily: "var(--font-heading)" }}>
                INTERPOLATED OUTPUT
              </div>
            </div>
          </div>

          {/* Processing Status stages */}
          <div>
            <div style={{ fontSize: 8.5, color: "#64748B", fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>ACTIVE PROCESSING PIPELINE</div>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              fontSize: 8.5, 
              color: "#64748B",
              fontFamily: "'JetBrains Mono', monospace",
              background: "rgba(4, 8, 17, 0.4)",
              padding: "5px 8px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.02)"
            }}>
              {[
                "Optical Flow", "Estimated Motion", "Cloud Vector Extraction", "TemporalNet", "Frame Synthesis", "Validation"
              ].map((stage, idx) => {
                const isActive = stage === "Frame Synthesis";
                return (
                  <React.Fragment key={stage}>
                    {idx > 0 && <span>→</span>}
                    <span 
                      style={{ 
                        color: isActive ? "#00E5FF" : "#64748B",
                        fontWeight: isActive ? 700 : 400,
                        textShadow: isActive ? "0 0 8px rgba(0, 229, 255, 0.4)" : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5
                      }}
                    >
                      {isActive && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#00E5FF", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />}
                      {stage}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Quality Validation cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {[
              { label: "SSIM Accuracy", val: "0.942", color: "#00F593" },
              { label: "Peak PSNR", val: "36.1 dB", color: "#7B61FF" },
              { label: "MSE Rate", val: "0.0024", color: "#FFB800" },
              { label: "Confidence", val: "94.2%", color: "#00E5FF" }
            ].map((q, i) => (
              <div 
                key={i} 
                className="glass-card" 
                style={{
                  padding: "6px 8px",
                  borderRadius: 6,
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid rgba(0, 220, 255, 0.05)",
                  background: "rgba(12, 20, 35, 0.3)"
                }}
              >
                <span style={{ fontSize: 7.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: q.color, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{q.val}</span>
              </div>
            ))}
          </div>

          {/* Footer Badge status */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            fontSize: 9,
            color: "#64748B",
            fontFamily: "'JetBrains Mono', monospace",
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
            paddingTop: 8
          }}>
            <span style={{ color: "#94A3B8" }}>
              STATE: Generating Intermediate Frame...
            </span>
            <span>
              EST. REMAINING: <span style={{ color: "#00E5FF", fontWeight: 700 }}>{((elapsedSeconds % 18) + 1).toString().padStart(2, '0')}s</span>
            </span>
          </div>

        </div>

      </div>

      {/* ─── Telemetry strip ─── */}
      <TelemetryMessageTicker />

      {/* ─── Main Grid: Jobs Table & Satellites ─── */}
      <div className="dashboard-main-grid" style={{ gap: 24 }}>
        
        {/* Left Column: Recent Jobs Panel & Pipeline Flow */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Mission Activity Log Panel */}
          <div 
            className="glass-panel-neon animate-glow" 
            style={{ 
              overflow: "hidden", 
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease",
              cursor: "default"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(0,220,255,0.06)", paddingBottom: 12, gap: 12 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 800, color: "white", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Mission Activity Log
                </h3>
                <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                  Recent AI interpolation missions processed by TemporalNet.
                </p>
              </div>

              {/* Status Chips */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <span style={{
                  fontSize: 9,
                  color: "#00F593",
                  background: "rgba(0, 245, 147, 0.06)",
                  border: "1px solid rgba(0, 245, 147, 0.2)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: 3.5
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#00F593", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />
                  LIVE CHANNEL
                </span>
                <span style={{ fontSize: 9, color: "#94A3B8", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  TODAY: 5
                </span>
                <span style={{ fontSize: 9, color: "#00F593", background: "rgba(0, 245, 147, 0.04)", border: "1px solid rgba(0, 245, 147, 0.1)", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  COMPLETED: 3
                </span>
                <span style={{ fontSize: 9, color: "#00E5FF", background: "rgba(0, 229, 255, 0.04)", border: "1px solid rgba(0, 229, 255, 0.1)", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  RUNNING: 1
                </span>
                <span style={{ fontSize: 9, color: "#FFB800", background: "rgba(255, 184, 0, 0.04)", border: "1px solid rgba(255, 184, 0, 0.1)", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  QUEUED: 1
                </span>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {["All", "Running", "Completed", "Queued", "Today"].map((f) => {
                const isAct = jobFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setJobFilter(f)}
                    style={{
                      background: isAct ? "rgba(0, 229, 255, 0.08)" : "transparent",
                      border: isAct ? "1px solid rgba(0, 229, 255, 0.25)" : "1px solid rgba(255,255,255,0.04)",
                      color: isAct ? "#00E5FF" : "#64748B",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (!isAct) e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      if (!isAct) e.currentTarget.style.color = "#64748B";
                    }}
                  >
                    {f.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Table Container */}
            <div style={{ overflowX: "auto" }} className="scroll-hide">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(0, 220, 255, 0.08)" }}>
                    {[
                      "Mission ID", "Satellite", "Region", "Frame Conversion", 
                      "Progress", "AI Confidence", "Quality", "Status", "Duration"
                    ].map((col) => (
                      <th 
                        key={col} 
                        style={{ 
                          padding: "10px 14px", 
                          fontSize: 9.5, 
                          color: "#64748B", 
                          fontWeight: 700, 
                          letterSpacing: 0.5, 
                          textTransform: "uppercase" 
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((j, i) => {
                    const sc = j.status === "complete" ? "#00F593" : j.status === "running" ? "#00E5FF" : "#FFB800";
                    
                    return (
                      <tr 
                        key={j.id} 
                        style={{ 
                          borderBottom: i < filteredJobs.length - 1 ? "1px solid rgba(255,255,255,0.02)" : "none", 
                          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)" 
                        }}
                        className="hover-row"
                      >
                        {/* 1. Mission ID */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace" }}>
                              {j.id}
                            </span>
                            <span style={{ fontSize: 8.5, color: "#64748B", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                              {j.timestamp}
                            </span>
                          </div>
                        </td>

                        {/* 2. Satellite */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Satellite size={11} color="#64748B" style={{ flexShrink: 0 }} />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>
                                {j.sat}
                              </span>
                              <span style={{ fontSize: 8.5, color: "#64748B" }}>
                                {j.satType}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Region */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>
                              {j.region}
                            </span>
                            <span style={{ fontSize: 8.5, color: "#64748B", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                              {j.coords}
                            </span>
                          </div>
                        </td>

                        {/* 4. Frame Conversion */}
                        <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                          <div style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            alignItems: "center", 
                            gap: 1.5, 
                            fontSize: 8.5, 
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#64748B",
                            width: "fit-content"
                          }}>
                            <span>30 min</span>
                            <span style={{ fontSize: 7, color: "#7B61FF", lineHeight: 1 }}>↓</span>
                            <span>15 min</span>
                            <span style={{ fontSize: 7, color: "#00E5FF", lineHeight: 1 }}>↓</span>
                            <span style={{ color: "#E2E8F0" }}>7.5 min</span>
                          </div>
                        </td>

                        {/* 5. Progress */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3.5, width: 85 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
                              <span style={{ color: "#E2E8F0", fontWeight: 700 }}>{j.progress}%</span>
                              <span style={{ color: "#64748B" }}>{j.frames}</span>
                            </div>
                            <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                              <div 
                                style={{ 
                                  width: `${j.progress}%`, 
                                  height: "100%", 
                                  background: j.status === "complete" ? "#00F593" : "linear-gradient(90deg, #7B61FF, #00E5FF)", 
                                  borderRadius: 2,
                                  transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)" 
                                }} 
                              />
                            </div>
                          </div>
                        </td>

                        {/* 6. AI Confidence */}
                        <td style={{ padding: "12px 14px" }}>
                          {j.confidence !== "—" ? (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: j.status === "complete" ? "#00F593" : "#00E5FF", fontFamily: "'JetBrains Mono', monospace" }}>
                                {j.confidence}
                              </span>
                              <span style={{ fontSize: 8.5, color: "#64748B", marginTop: 2 }}>
                                {j.confidenceLevel}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>—</span>
                          )}
                        </td>

                        {/* 7. Quality */}
                        <td style={{ padding: "12px 14px" }}>
                          {j.ssim !== "—" ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: 9.5, fontWeight: 700, color: "#00F593", fontFamily: "'JetBrains Mono', monospace" }}>
                                  SSIM {j.ssim}
                                </span>
                                <span style={{ fontSize: 8.5, color: "#64748B", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                                  PSNR {j.psnr}
                                </span>
                              </div>
                              <span style={{ 
                                fontSize: 8, 
                                fontWeight: 800, 
                                padding: "1.5px 4px", 
                                borderRadius: 3, 
                                background: "rgba(0, 245, 147, 0.08)", 
                                color: "#00F593", 
                                border: "1px solid rgba(0, 245, 147, 0.2)",
                                fontFamily: "'JetBrains Mono', monospace" 
                              }}>
                                {j.qualityBadge}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>—</span>
                          )}
                        </td>

                        {/* 8. Status */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ 
                            fontSize: 8.5, 
                            fontWeight: 800, 
                            padding: "2.5px 8px", 
                            borderRadius: 10, 
                            background: j.status === "complete" ? "rgba(0, 245, 147, 0.08)" : j.status === "running" ? "rgba(0, 229, 255, 0.08)" : "rgba(255, 184, 0, 0.08)", 
                            color: sc, 
                            border: `1px solid ${sc}22`, 
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                            fontFamily: "'JetBrains Mono', monospace",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3.5
                          }}>
                            {j.status === "running" ? (
                              <span style={{ width: 4.5, height: 4.5, borderRadius: "50%", background: "#00E5FF", display: "inline-block", animation: "pulse-dot 1.5s infinite" }} />
                            ) : null}
                            {j.status === "running" ? "PROCESSING" : j.status === "complete" ? "COMPLETE" : j.status.toUpperCase()}
                          </span>
                        </td>

                        {/* 9. Duration */}
                        <td style={{ padding: "12px 14px" }}>
                          {j.duration !== "—" ? (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#E2E8F0", fontFamily: "'JetBrains Mono', monospace" }}>
                                {j.duration}
                              </span>
                              <span style={{ fontSize: 8.5, color: "#64748B", marginTop: 2 }}>
                                Average
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>—</span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              fontSize: 10, 
              color: "#64748B", 
              borderTop: "1px solid rgba(255, 255, 255, 0.04)", 
              paddingTop: 12,
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              <span>
                Showing latest {filteredJobs.length} of {enrichedJobs.length} missions
              </span>
              <a 
                href="#history" 
                onClick={(e) => e.preventDefault()}
                style={{ 
                  color: "#00E5FF", 
                  textDecoration: "none", 
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#00E5FF"}
              >
                View Complete Mission History →
              </a>
            </div>

            {/* CSS styles local to this panel */}
            <style>{`
              .hover-row {
                background: transparent;
              }
              .hover-row:hover {
                background: rgba(0, 220, 255, 0.02) !important;
                box-shadow: inset 0 0 12px rgba(0, 220, 255, 0.04);
              }
            `}</style>

          </div>

          {/* AI Pipeline Flow with Connectors */}
          <div 
            className="glass-panel-neon animate-glow" 
            style={{ 
              padding: "20px 24px", 
              border: "1px solid rgba(0, 220, 255, 0.08)", 
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease",
              cursor: "default"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(0,220,255,0.06)", paddingBottom: 12, gap: 12 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 800, color: "white", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  AI Interpolation Pipeline
                </h3>
                <span style={{ fontSize: 10.5, color: "#64748B" }}>End-to-end AI processing workflow for temporal frame generation.</span>
              </div>
              <span style={{ 
                fontSize: 9, 
                color: "#7B61FF", 
                background: "rgba(123, 97, 255, 0.08)", 
                border: "1px solid rgba(123, 97, 255, 0.2)", 
                padding: "2px 8px", 
                borderRadius: 4, 
                fontWeight: 700, 
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                TemporalNet v2.1
              </span>
            </div>

            {/* Live Processing Counters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, borderBottom: "1px solid rgba(0,220,255,0.06)", paddingBottom: 12 }}>
              {[
                { label: "Frames Ingested", count: 1248 + (elapsedSeconds % 5), icon: Satellite, color: "#00E5FF" },
                { label: "Frames Synthesized", count: 2496 + (elapsedSeconds % 5) * 2, icon: Brain, color: "#7B61FF" },
                { label: "Frames Validated", count: 2494 + (elapsedSeconds % 5) * 2, icon: Shield, color: "#00F593" },
                { label: "Frames Exported", count: 2490 + (elapsedSeconds % 5) * 2, icon: CheckCircle, color: "#00E5FF" }
              ].map((cnt) => (
                <div key={cnt.label} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(12, 20, 35, 0.35)", padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.02)" }}>
                  <cnt.icon size={13} color={cnt.color} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 8.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>{cnt.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "white", fontFamily: "'JetBrains Mono', monospace" }}>{cnt.count}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pipeline Nodes container */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", gap: 2, position: "relative" }}>
              {[
                { id: 1, label: "Data Ingestion", sub: "INSAT-3DS Raw Ingest", Icon: Satellite, status: "completed", time: "0.02s", confidence: "99%", completedDetails: "100% Ingested" },
                { id: 2, label: "Pre-processing", sub: "Radiometric Normalization", Icon: Layers, status: "completed", time: "0.08s", confidence: "98%", completedDetails: "Calibrated" },
                { id: 3, label: "Optical Flow Estimation", sub: "Wind velocity vectors tracking", Icon: Activity, status: "completed", time: "0.35s", confidence: "96%", completedDetails: "Vectors Computed" },
                { id: 4, label: "TemporalNet Inference", sub: "Convolutional Frame Synthesis", Icon: Brain, status: "processing", time: "1.45s", confidence: "94%", remaining: "0.5s", operation: "Running TemporalNet..." },
                { id: 5, label: "Quality Validation", sub: "SSIM/PSNR Gate checking", Icon: Shield, status: "queued", time: "—", confidence: "99%", metrics: { ssim: "0.942", psnr: "36.1 dB", mse: "0.0024", fsim: "0.951" }, validationStatus: "PASS" },
                { id: 6, label: "Frame Generation", sub: "Final Video Stream Compile", Icon: CheckCircle, status: "queued", time: "—", confidence: "95%" }
              ].map((stage, i, arr) => {
                const isDone = stage.status === "completed";
                const isProc = stage.status === "processing";
                const isQue = stage.status === "queued";
                
                const cardColor = isDone ? "#00F593" : isProc ? "#00E5FF" : "#475569";
                const cardBg = isDone ? "rgba(0, 245, 147, 0.02)" : isProc ? "rgba(0, 229, 255, 0.04)" : "rgba(4, 8, 17, 0.25)";
                const cardBorder = isDone ? "rgba(0, 245, 147, 0.15)" : isProc ? "rgba(0, 229, 255, 0.35)" : "rgba(255, 255, 255, 0.04)";

                const nodeDetails: Record<number, { purpose: string; input: string; output: string; latency: string; module: string; hardware: string }> = {
                  1: { purpose: "Ingest geostationary satellite frames (INSAT-3DS raw bands).", input: "Raw satellite stream", output: "Pre-calibrated observations", latency: "0.02s", module: "DataStream Ingest", hardware: "ISRO Ground-Station Uplink" },
                  2: { purpose: "Radiometric calibration, histogram matching, and crop alignment.", input: "Raw band observations", output: "Normalized frame series", latency: "0.08s", module: "Spatial Pre-processor v2.0", hardware: "Node CPU Intel Xeon" },
                  3: { purpose: "Calculate motion vector paths between consecutive observations.", input: "Consecutive frames", output: "Estimated cloud velocity vectors", latency: "0.35s", module: "Optical Flow Tracker (Farneback)", hardware: "RTX A6000 Node-1" },
                  4: { purpose: "Run TemporalNet convolutional layers to predict intermediate frame.", input: "Previous frame, Next frame, Motion vectors", output: "Synthesized intermediate frame (t = +15m)", latency: "0.48s", module: "TemporalNet CNN v2.1", hardware: "RTX A6000 Node-2" },
                  5: { purpose: "Validate generated frames against quality parameters (SSIM, PSNR).", input: "Synthesized frame vs ground truth", output: "Validation metric coefficients", latency: "0.12s", module: "SSIM/PSNR Analyzer Gate", hardware: "Node CPU Intel Xeon" },
                  6: { purpose: "Compile and export final interpolated high-resolution series.", input: "Validated intermediate frames", output: "Interpolated satellite video stream", latency: "0.05s", module: "Stream Exporter Node", hardware: "SAC Storage Array Network" }
                };

                return (
                  <React.Fragment key={stage.id}>
                    {/* Node block */}
                    <div 
                      onMouseEnter={() => setHoveredNode(stage.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        textAlign: "center", 
                        padding: "10px 8px", 
                        minWidth: 120,
                        flex: "1 1 15%",
                        background: cardBg,
                        border: `1px solid ${cardBorder}`,
                        borderRadius: 8,
                        position: "relative",
                        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                        cursor: "default",
                        boxShadow: isProc ? "0 0 16px rgba(0, 229, 255, 0.08)" : "none"
                      }}
                    >
                      {/* Active rotating ring or pulsing glow */}
                      {isProc && (
                        <div style={{
                          position: "absolute",
                          inset: -2,
                          borderRadius: 10,
                          border: "1px dashed #00E5FF",
                          animation: "spin 12s linear infinite"
                        }} />
                      )}

                      {/* Icon & Live indicators */}
                      <div style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: "50%", 
                        marginBottom: 6, 
                        background: isDone ? "rgba(0, 245, 147, 0.06)" : isProc ? "rgba(0, 229, 255, 0.08)" : "rgba(255,255,255,0.02)", 
                        border: `1px solid ${isDone ? "rgba(0, 245, 147, 0.2)" : isProc ? "rgba(0, 229, 255, 0.3)" : "rgba(255,255,255,0.04)"}`, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        position: "relative"
                      }}>
                        <stage.Icon size={14} color={isQue ? "#475569" : cardColor} />
                        
                        {isDone && (
                          <div style={{ 
                            position: "absolute", 
                            top: -3, 
                            right: -3, 
                            width: 11, 
                            height: 11, 
                            borderRadius: "50%", 
                            background: "#00F593", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center"
                          }}>
                            <CheckCircle size={8} color="#040811" strokeWidth={3.5} />
                          </div>
                        )}
                        
                        {isProc && (
                          <div style={{
                            position: "absolute",
                            top: -3,
                            right: -3,
                            width: 11,
                            height: 11,
                            borderRadius: "50%",
                            background: "#00E5FF",
                            fontSize: 6,
                            fontWeight: 800,
                            color: "#040811",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            animation: "pulse-dot 1s infinite"
                          }}>
                            L
                          </div>
                        )}
                      </div>

                      {/* Stage Title */}
                      <div style={{ fontSize: 10, fontWeight: 700, color: isQue ? "#64748B" : "white", marginBottom: 2 }}>
                        {stage.label}
                      </div>

                      {/* Display content tailored to node state */}
                      {isDone && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 1, fontSize: 8, color: "#64748B" }}>
                          <span style={{ color: "#00F593", fontWeight: 700 }}>{stage.completedDetails}</span>
                          <span>Time: {stage.time}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#64748B" }}>Conf: {stage.confidence}</span>
                        </div>
                      )}

                      {isProc && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 1, fontSize: 8, color: "#00E5FF" }}>
                          <span style={{ animation: "pulse-dot 1.5s infinite" }}>{stage.operation}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Rem: {stage.remaining}</span>
                        </div>
                      )}

                      {isQue && stage.id === 5 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 1.5, fontSize: 7.5, color: "#475569" }}>
                          <div style={{ display: "flex", gap: 4, fontFamily: "'JetBrains Mono', monospace", justifyContent: "center" }}>
                            <span>SSIM: 0.94</span>
                            <span>PSNR: 36</span>
                          </div>
                          <span style={{ 
                            fontSize: 7, 
                            color: "#00F593", 
                            background: "rgba(0, 245, 147, 0.08)", 
                            border: "1px solid rgba(0, 245, 147, 0.2)", 
                            padding: "0.5px 4.5px", 
                            borderRadius: 3, 
                            fontWeight: 800,
                            fontFamily: "'JetBrains Mono', monospace",
                            alignSelf: "center"
                          }}>
                            {stage.validationStatus}
                          </span>
                        </div>
                      )}

                      {isQue && stage.id === 6 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", marginTop: 2 }}>
                          {/* Mini Animated frame transition preview */}
                          <div style={{ 
                            width: 36, 
                            height: 20, 
                            borderRadius: 3, 
                            border: "1px solid rgba(0, 229, 255, 0.15)", 
                            background: "rgba(4,8,17,0.6)",
                            position: "relative",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              position: "absolute",
                              inset: 0,
                              background: "radial-gradient(circle, rgba(0,229,255,0.2) 10%, transparent 60%)",
                              animation: "preview-slide 2.5s infinite ease-in-out"
                            }} />
                            <div style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              fontSize: 5.5,
                              color: "#00E5FF",
                              fontFamily: "'JetBrains Mono', monospace",
                              background: "rgba(0,0,0,0.6)",
                              textAlign: "center"
                            }}>
                              SYNTH
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tooltip Overlay */}
                      {hoveredNode === stage.id && (
                        <div style={{
                          position: "absolute",
                          bottom: "110%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 230,
                          background: "#071221",
                          border: "1px solid rgba(0, 229, 255, 0.3)",
                          borderRadius: 8,
                          padding: "10px",
                          textAlign: "left",
                          boxShadow: "0 8px 32px rgba(4, 8, 17, 0.85)",
                          zIndex: 140,
                          pointerEvents: "none"
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#00E5FF", borderBottom: "1px solid rgba(0, 229, 255, 0.15)", paddingBottom: 5, marginBottom: 6, textTransform: "uppercase" }}>
                            {stage.label}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 9 }}>
                            <div><span style={{ color: "#64748B", fontWeight: 700 }}>PURPOSE:</span> <span style={{ color: "#E2E8F0" }}>{nodeDetails[stage.id].purpose}</span></div>
                            <div><span style={{ color: "#64748B", fontWeight: 700 }}>INPUT:</span> <span style={{ color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>{nodeDetails[stage.id].input}</span></div>
                            <div><span style={{ color: "#64748B", fontWeight: 700 }}>OUTPUT:</span> <span style={{ color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>{nodeDetails[stage.id].output}</span></div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                              <div><span style={{ color: "#64748B", fontWeight: 700 }}>LATENCY:</span> <span style={{ color: "#00F593", fontWeight: 700 }}>{nodeDetails[stage.id].latency}</span></div>
                              <div><span style={{ color: "#64748B", fontWeight: 700 }}>MODULE:</span> <span style={{ color: "white" }}>{nodeDetails[stage.id].module}</span></div>
                            </div>
                            <div><span style={{ color: "#64748B", fontWeight: 700 }}>HARDWARE:</span> <span style={{ color: "#7B61FF", fontWeight: 700 }}>{nodeDetails[stage.id].hardware}</span></div>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Connecting Channel */}
                    {i < arr.length - 1 && (
                      <div 
                        style={{ 
                          flex: "1 1 18px", 
                          height: 2, 
                          background: isDone ? "rgba(0, 245, 147, 0.15)" : isProc ? "rgba(0, 229, 255, 0.15)" : "rgba(255, 255, 255, 0.04)", 
                          minWidth: 10, 
                          position: "relative", 
                          overflow: "hidden"
                        }}
                      >
                        {(isDone || isProc) && (
                          <div 
                            style={{
                              position: "absolute",
                              left: "-100%",
                              top: 0,
                              width: "100%",
                              height: "100%",
                              background: isDone 
                                ? "linear-gradient(90deg, transparent, #00F593, transparent)" 
                                : "linear-gradient(90deg, transparent, #00E5FF, transparent)",
                              animation: "h-flow 2.5s linear infinite"
                            }}
                          />
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pipeline Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 4, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 14 }}>
              {[
                { label: "Frames Generated", val: "12 / 16", color: "#00E5FF", sub: "Temporal interpolation path" },
                { label: "Average Inference", val: "2.3 sec", color: "#7B61FF", sub: "End-to-end latency" },
                { label: "Current SSIM", val: "0.942", color: "#00F593", sub: "SSIM structural index" },
                { label: "Current Confidence", val: "94.2%", color: "#FFB800", sub: "Model inference trust" }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="glass-card" 
                  style={{ 
                    padding: "10px 12px", 
                    borderRadius: 6, 
                    display: "flex", 
                    flexDirection: "column",
                    gap: 2,
                    border: "1px solid rgba(255,255,255,0.03)",
                    background: "rgba(4, 8, 17, 0.15)"
                  }}
                >
                  <span style={{ fontSize: 8.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: item.color, fontFamily: "'JetBrains Mono', monospace", margin: "2px 0" }}>{item.val}</span>
                  <span style={{ fontSize: 8, color: "#475569" }}>{item.sub}</span>
                </div>
              ))}
            </div>

            {/* Local Styles */}
            <style>{`
              @keyframes h-flow {
                0% { left: -100%; }
                100% { left: 100%; }
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes preview-slide {
                0%, 100% { opacity: 0.35; transform: scale(1); }
                50% { opacity: 0.95; transform: scale(1.1); }
              }
            `}</style>
          </div>

        </div>

        {/* Right Column: Satellite Network & Mini Metrics Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Satellite network panel */}
          <div 
            className="glass-panel-neon animate-glow" 
            style={{ 
              padding: "16px 20px", 
              display: "flex", 
              flexDirection: "column", 
              gap: 12,
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease",
              cursor: "default"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 800, color: "white", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Satellite Network
                </h3>
                <span style={{ fontSize: 10, color: "#64748B" }}>Live status of all connected observation satellites.</span>
              </div>
              <span style={{ 
                fontSize: 9, 
                color: "#00F593", 
                background: "rgba(0, 245, 147, 0.08)", 
                border: "1px solid rgba(0, 245, 147, 0.2)", 
                padding: "2px 8px", 
                borderRadius: 4, 
                fontWeight: 700, 
                fontFamily: "'JetBrains Mono', monospace",
                whiteSpace: "nowrap"
              }}>
                CONNECTED: 5 / 5
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SATELLITES.map((sat, i) => {
                const sc = sat.status === "active" ? "#00F593" : "#7B61FF";
                
                return (
                  <div 
                    key={sat.id} 
                    className="glass-card" 
                    style={{ 
                      padding: "12px 14px", 
                      borderRadius: 8,
                      border: "1px solid rgba(0, 220, 255, 0.08)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      position: "relative",
                      transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0, 220, 255, 0.25)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 220, 255, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0, 220, 255, 0.08)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Top line: Name/Type, Status Badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ 
                          width: 28, 
                          height: 28, 
                          borderRadius: 6, 
                          background: "rgba(0, 229, 255, 0.04)", 
                          border: "1px solid rgba(0, 229, 255, 0.1)",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <Satellite size={14} color="#00E5FF" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{sat.id}</span>
                          <span style={{ fontSize: 9, color: "#64748B" }}>
                            {sat.orbit.includes("GEO") ? "Geostationary" : "Polar Orbit"}
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span style={{ 
                        fontSize: 8.5, 
                        fontWeight: 800, 
                        padding: "2px 6px", 
                        borderRadius: 4, 
                        background: sat.status === "active" ? "rgba(0, 245, 147, 0.06)" : "rgba(123, 97, 255, 0.06)", 
                        color: sc, 
                        border: `1px solid ${sat.status === "active" ? "rgba(0, 245, 147, 0.15)" : "rgba(123, 97, 255, 0.15)"}`,
                        fontFamily: "'JetBrains Mono', monospace",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4
                      }}>
                        <span style={{ 
                          width: 4.5, 
                          height: 4.5, 
                          borderRadius: "50%", 
                          background: sc, 
                          display: "inline-block", 
                          animation: "pulse-dot 1.5s infinite" 
                        }} />
                        {sat.status === "active" ? "ACTIVE" : "PROCESSING"}
                      </span>
                    </div>

                    {/* Information Grid */}
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(3, 1fr)", 
                      gap: "6px 12px", 
                      background: "rgba(4, 8, 17, 0.3)",
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.01)"
                    }}>
                      <div>
                        <div style={{ fontSize: 7.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Coverage</div>
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#E2E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {sat.coverage.replace(" Region", "").replace("Area", "")}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 7.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Refresh</div>
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#E2E8F0", fontFamily: "'JetBrains Mono', monospace" }}>{sat.refresh}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 7.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Cloud Cover</div>
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#E2E8F0", fontFamily: "'JetBrains Mono', monospace" }}>{sat.cloud}%</div>
                      </div>
                    </div>

                    {/* Bottom line: Signal Animated track & Coverage svg globe */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      {/* SVG Coverage Visualization */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" style={{ opacity: 0.8, flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10" stroke="rgba(0, 229, 255, 0.15)" strokeWidth="0.8" fill="none" />
                          <path d="M12 2 L12 22 M2 12 L22 12" stroke="rgba(0, 229, 255, 0.15)" strokeWidth="0.8" />
                          <circle cx="12" cy="12" r="3" fill="none" stroke="#00E5FF" strokeWidth="1">
                            <animate attributeName="r" values="2;8;2" dur="3s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
                          </circle>
                        </svg>
                        <span style={{ fontSize: 8.5, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>
                          UP: {((elapsedSeconds + i * 3) % 25) + 3}s ago
                        </span>
                      </div>

                      {/* Signal animated bar & Heartbeat pulse */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "flex-end", minWidth: 0 }}>
                        <span style={{ fontSize: 8.5, color: "#64748B" }}>Signal</span>
                        <div style={{ width: 44, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                          <div 
                            style={{ 
                              width: `${sat.signal}%`, 
                              height: "100%", 
                              background: "linear-gradient(90deg, #7B61FF, #00E5FF, #7B61FF)", 
                              borderRadius: 2,
                              animation: "progress-gradient-slide 4s linear infinite",
                              backgroundSize: "200% auto"
                            }} 
                          />
                        </div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: "#00E5FF", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 2.5 }}>
                          {sat.signal}%
                          <span style={{ 
                            width: 4, 
                            height: 4, 
                            borderRadius: "50%", 
                            background: "#00E5FF", 
                            display: "inline-block",
                            animation: "pulse-dot 1s infinite" 
                          }} />
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Footer counts */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              fontSize: 9.5, 
              color: "#64748B", 
              borderTop: "1px solid rgba(255, 255, 255, 0.04)", 
              paddingTop: 10,
              marginTop: 4,
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              <span>Total Satellites: 5</span>
              <span>Online: 4</span>
              <span>Processing: 1</span>
              <span>Offline: 0</span>
            </div>

          </div>

          {/* Metrics Overview Panel */}
          <div className="glass-panel animate-scale" style={{ padding: 18, border: "1px solid rgba(0, 220, 255, 0.16)" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "white", marginBottom: 14 }}>
              AI Model Metrics Summary
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              
              {/* SSIM */}
              <div className="glass-card" style={{ padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(0, 229, 255, 0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUp size={16} color="#00E5FF" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>AVG_SSIM_ACCURACY</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#00F593", fontFamily: "'JetBrains Mono', monospace" }}>0.942</div>
                </div>
                <div style={{ width: 60, textAlign: "right" }}>
                  <span style={{ fontSize: 9, color: "#00F593", background: "rgba(0, 245, 147, 0.08)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>+4.2%</span>
                </div>
              </div>

              {/* PSNR */}
              <div className="glass-card" style={{ padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(123, 97, 255, 0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={16} color="#7B61FF" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>PEAK_SIGNAL_NOISE_RATIO</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#7B61FF", fontFamily: "'JetBrains Mono', monospace" }}>36.1 dB</div>
                </div>
                <div style={{ width: 60, textAlign: "right" }}>
                  <span style={{ fontSize: 9, color: "#7B61FF", background: "rgba(123, 97, 255, 0.08)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>PASSED</span>
                </div>
              </div>

              {/* Inference */}
              <div className="glass-card" style={{ padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(255, 184, 0, 0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={16} color="#FFB800" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>INFERENCE_LATENCY_RATE</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#FFB800", fontFamily: "'JetBrains Mono', monospace" }}>2.3 SEC</div>
                </div>
                <div style={{ width: 60, textAlign: "right" }}>
                  <span style={{ fontSize: 9, color: "#FFB800", background: "rgba(255, 184, 0, 0.08)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>NOMINAL</span>
                </div>
              </div>

              {/* System Global Health Indicators */}
              <div className="glass-card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: 6 }}>
                  <GpuIcon size={13} color="#00E5FF" />
                  <span style={{ fontSize: 9.5, color: "#E2E8F0", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>System Global Health</span>
                </div>
                
                {[
                  { label: "GPU Utilization", val: "84.2%", fill: 84.2, color: "#00E5FF" },
                  { label: "VRAM Allocation", val: "11.2 GB / 16 GB", fill: 70, color: "#7B61FF" },
                  { label: "CPU Compute Load", val: "42.8%", fill: 42.8, color: "#00F593" },
                  { label: "Network Bandwidth", val: "450 Mbps", fill: 45, color: "#FFB800" },
                  { label: "Inference Queue", val: "12 / 16 Frames", fill: 75, color: "#00E5FF" },
                  { label: "Memory (RAM)", val: "22.4 GB / 32 GB", fill: 70, color: "#7B61FF" },
                  { label: "Network Latency", val: "24 ms", fill: 24, color: "#00F593" }
                ].map((stat) => (
                  <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                    <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center", fontSize: 8.5 }}>
                      <span style={{ color: "#64748B", fontWeight: 500 }}>{stat.label}</span>
                      <span style={{ color: "white", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{stat.val}</span>
                    </div>
                    <div style={{ height: 3.5, background: "rgba(255,255,255,0.04)", borderRadius: 1.5 }}>
                      <div style={{ width: `${stat.fill}%`, height: "100%", background: stat.color, borderRadius: 1.5 }} />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
