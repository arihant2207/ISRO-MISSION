import React, { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, Maximize2, Minimize2, Eye, Wind, Layers, AlertCircle, ShieldAlert, Zap, Radio, Info, ChevronRight 
} from "lucide-react";
import { MICHAUNG_METADATA } from "../michaungTrack";

interface SatelliteAnimationViewerProps {
  onFrameChange?: (framePct: number) => void;
}

export default function SatelliteAnimationViewer({ onFrameChange }: SatelliteAnimationViewerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [showOpticalFlow, setShowOpticalFlow] = useState(true);
  const [showConfidenceMap, setShowConfidenceMap] = useState(true);
  const [showTelemetryHUD, setShowTelemetryHUD] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const tickRef = useRef<number>(0);

  // Playback timer loop simulating gif frame progression scrubber
  useEffect(() => {
    let lastTime = performance.now();

    function loop(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setProgress((prev) => {
          const next = (prev + (dt * 12 * playbackSpeed)) % 100;
          if (onFrameChange) onFrameChange(next);
          return next;
        });
      }

      tickRef.current += dt * playbackSpeed;
      drawOverlays();
      animFrameRef.current = requestAnimationFrame(loop);
    }

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, playbackSpeed, showOpticalFlow, showConfidenceMap, showTelemetryHUD]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.error(err));
    }
  };

  // Canvas drawing for Optical Flow Vector Fields and AI Confidence Heatmap
  const drawOverlays = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const t = tickRef.current;
    const cX = w * 0.52;
    const cY = h * 0.48;

    // ─── 1. OPTICAL FLOW VECTOR FIELD ("Optical Flow — Prototype Visualization") ───
    if (showOpticalFlow) {
      const rows = 10;
      const cols = 14;
      const cellW = w / cols;
      const cellH = h / rows;

      ctx.strokeStyle = "rgba(0, 229, 255, 0.45)";
      ctx.lineWidth = 1.2;

      for (let r = 1; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
          const x = c * cellW;
          const y = r * cellH;

          const dx = x - cX;
          const dy = y - cY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < Math.min(w, h) * 0.45 && dist > 20) {
            const angle = Math.atan2(dy, dx) - Math.PI / 2 + Math.sin(t * 1.2 + dist * 0.01) * 0.2;
            const mag = Math.max(8, (1 - dist / (Math.min(w, h) * 0.45)) * 26);

            const vx = Math.cos(angle) * mag;
            const vy = Math.sin(angle) * mag;

            const endX = x + vx;
            const endY = y + vy;

            ctx.strokeStyle = dist < 110 ? "#00E5FF" : "rgba(0, 229, 255, 0.35)";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            const tipAngle = Math.atan2(vy, vx);
            ctx.fillStyle = dist < 110 ? "#00E5FF" : "rgba(0, 229, 255, 0.5)";
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - 4 * Math.cos(tipAngle - Math.PI / 6), endY - 4 * Math.sin(tipAngle - Math.PI / 6));
            ctx.lineTo(endX - 4 * Math.cos(tipAngle + Math.PI / 6), endY - 4 * Math.sin(tipAngle + Math.PI / 6));
            ctx.fill();

            ctx.fillStyle = "rgba(0, 229, 255, 0.6)";
            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // ─── 2. CONFIDENCE / ATTENTION OVERLAY ("AI Confidence — Prototype Simulation") ───
    if (showConfidenceMap) {
      const radii = [
        { r: 40, color: "rgba(0, 245, 147, 0.22)", border: "#00F593", label: "Simulated Core Region" },
        { r: 95, color: "rgba(255, 184, 0, 0.14)", border: "#FFB800", label: "Simulated Mid Ring" },
        { r: 160, color: "rgba(255, 59, 92, 0.08)", border: "rgba(255, 59, 92, 0.5)", label: "Simulated Outer Ring" }
      ];

      radii.reverse().forEach((ring) => {
        const pulse = Math.sin(t * 2 + ring.r) * 3;
        ctx.fillStyle = ring.color;
        ctx.beginPath();
        ctx.arc(cX, cY, ring.r + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = ring.border;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cX, cY, ring.r + pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // ─── 3. TARGET LOCK BRACKETS ───
    if (showTelemetryHUD) {
      const bSize = 45;
      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(cX - bSize, cY - bSize + 10); ctx.lineTo(cX - bSize, cY - bSize); ctx.lineTo(cX - bSize + 10, cY - bSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cX + bSize - 10, cY - bSize); ctx.lineTo(cX + bSize, cY - bSize); ctx.lineTo(cX + bSize, cY - bSize + 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cX - bSize, cY + bSize - 10); ctx.lineTo(cX - bSize, cY + bSize); ctx.lineTo(cX - bSize + 10, cY + bSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cX + bSize - 10, cY + bSize); ctx.lineTo(cX + bSize, cY + bSize); ctx.lineTo(cX + bSize, cY + bSize - 10);
      ctx.stroke();

      ctx.fillStyle = "#FF3B5C";
      ctx.beginPath();
      ctx.arc(cX, cY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const currentFrameNum = Math.floor((progress / 100) * 24) + 1;
  const currentTimestamp = `2023-12-03 ${String(Math.floor((progress / 100) * 24)).padStart(2, '0')}:00:00 UTC (HISTORICAL)`;

  return (
    <div 
      ref={containerRef}
      className="glass-panel"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: isFullscreen ? "100vh" : 520,
        display: "flex",
        flexDirection: "column",
        background: "#030712",
        borderRadius: isFullscreen ? 0 : 12,
        overflow: "hidden",
        border: "1px solid rgba(0, 229, 255, 0.2)",
        boxShadow: "0 0 35px rgba(0, 229, 255, 0.08)"
      }}
    >
      {/* ─── Top Header Bar ─── */}
      <div 
        style={{
          padding: "10px 16px",
          background: "rgba(7, 18, 33, 0.9)",
          borderBottom: "1px solid rgba(0, 229, 255, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 30,
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span 
            style={{
              padding: "3px 8px",
              borderRadius: 4,
              background: "rgba(255, 59, 92, 0.15)",
              border: "1px solid rgba(255, 59, 92, 0.4)",
              color: "#FF3B5C",
              fontSize: 10,
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B5C", animation: "pulse-dot 1.2s infinite" }} />
            HISTORICAL EVENT
          </span>

          <span style={{ fontSize: 13, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)" }}>
            CYCLONE MICHAUNG · INSAT-3D INFRARED (10.8 µm)
          </span>

          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(0, 245, 147, 0.1)", border: "1px solid rgba(0, 245, 147, 0.3)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            REAL SATELLITE DATA
          </span>
        </div>

        {/* Dynamic Overlay Toggles */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setShowOpticalFlow(!showOpticalFlow)}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              background: showOpticalFlow ? "rgba(0, 229, 255, 0.15)" : "rgba(255,255,255,0.03)",
              color: showOpticalFlow ? "#00E5FF" : "#64748B",
              border: showOpticalFlow ? "1px solid rgba(0, 229, 255, 0.4)" : "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <Wind size={12} color={showOpticalFlow ? "#00E5FF" : "#64748B"} />
            MOTION VECTORS (PROTOTYPE)
          </button>

          <button
            onClick={() => setShowConfidenceMap(!showConfidenceMap)}
            style={{
              padding: "5px 10px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              background: showConfidenceMap ? "rgba(0, 245, 147, 0.15)" : "rgba(255,255,255,0.03)",
              color: showConfidenceMap ? "#00F593" : "#64748B",
              border: showConfidenceMap ? "1px solid rgba(0, 245, 147, 0.4)" : "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <Layers size={12} color={showConfidenceMap ? "#00F593" : "#64748B"} />
            SPATIAL FOCUS (PROTOTYPE)
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94A3B8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* ─── Hero Visual Container ─── */}
      <div 
        style={{
          position: "relative",
          flex: 1,
          width: "100%",
          height: "100%",
          background: "#02040a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}
      >
        <img
          src="/IR_Michaung.gif"
          alt="INSAT-3D IR Cyclone Michaung Animation"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            filter: "contrast(1.15) brightness(0.92) saturate(1.1)"
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 10
          }}
        />

        {/* Prototype Visualization Labels (Requirement 6) */}
        <div 
          style={{
            position: "absolute",
            top: 14,
            left: 16,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            zIndex: 20,
            pointerEvents: "none"
          }}
        >
          {showOpticalFlow && (
            <div 
              style={{
                background: "rgba(4, 10, 24, 0.88)",
                border: "1px solid rgba(0, 229, 255, 0.4)",
                borderRadius: 6,
                padding: "5px 10px",
                color: "#00E5FF",
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Wind size={12} color="#00E5FF" />
              Motion Vector Visualization — Prototype
            </div>
          )}

          {showConfidenceMap && (
            <div 
              style={{
                background: "rgba(4, 10, 24, 0.88)",
                border: "1px solid rgba(0, 245, 147, 0.4)",
                borderRadius: 6,
                padding: "5px 10px",
                color: "#00F593",
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Layers size={12} color="#00F593" />
              AI Confidence — Prototype Simulation
            </div>
          )}
        </div>

        {/* Legend Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            background: "rgba(7, 18, 33, 0.92)",
            border: "1px solid rgba(0, 229, 255, 0.15)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 9.5,
            fontFamily: "'JetBrains Mono', monospace",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            gap: 5,
            backdropFilter: "blur(6px)"
          }}
        >
          <div style={{ color: "#64748B", fontWeight: 700, letterSpacing: 0.5, marginBottom: 2 }}>
            OVERLAY LEGEND · SIMULATED FOR DEMONSTRATION
          </div>
          {showConfidenceMap && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#00F593" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00F593" }} /> Core Region
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#FFB800" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFB800" }} /> Mid Band
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#FF3B5C" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF3B5C" }} /> Outer Band
              </span>
            </div>
          )}
          {showOpticalFlow && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#00E5FF", marginTop: 2 }}>
              <span>▸ Vector Velocity:</span>
              <span style={{ fontWeight: 700 }}>Tangential Cyclonic Swirl (Simulated)</span>
            </div>
          )}
        </div>

        {/* Metadata Telemetry Badge on Right */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "rgba(7, 18, 33, 0.92)",
            border: "1px solid rgba(0, 229, 255, 0.2)",
            borderRadius: 8,
            padding: "10px 14px",
            zIndex: 20,
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            backdropFilter: "blur(6px)"
          }}
        >
          <div style={{ color: "#00E5FF", fontWeight: 800, marginBottom: 2 }}>SATELLITE METADATA</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span style={{ color: "#64748B" }}>Satellite:</span>
            <span style={{ color: "#00F593", fontWeight: 700 }}>{MICHAUNG_METADATA.satellite} (OBSERVED)</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span style={{ color: "#64748B" }}>Channel:</span>
            <span style={{ color: "white", fontWeight: 700 }}>{MICHAUNG_METADATA.channel}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span style={{ color: "#64748B" }}>Event:</span>
            <span style={{ color: "#FFB800", fontWeight: 700 }}>{MICHAUNG_METADATA.name}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span style={{ color: "#64748B" }}>Model Link:</span>
            <span style={{ color: "#FFB800", fontWeight: 700 }}>NOT CONNECTED / DEMO</span>
          </div>
        </div>
      </div>

      {/* ─── Bottom Scrubber Control Bar ─── */}
      <div 
        style={{
          padding: "10px 20px",
          background: "rgba(7, 18, 33, 0.95)",
          borderTop: "1px solid rgba(0, 229, 255, 0.12)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          zIndex: 30
        }}
      >
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: isPlaying ? "rgba(0, 229, 255, 0.15)" : "linear-gradient(135deg,#00E5FF,#7B61FF)",
            border: isPlaying ? "1px solid #00E5FF" : "none",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          {isPlaying ? <Pause size={15} color="#00E5FF" /> : <Play size={15} color="white" style={{ marginLeft: 2 }} />}
        </button>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: "#00E5FF", fontWeight: 700 }}>
              FRAME {String(currentFrameNum).padStart(2, '0')} / 24
            </span>
            <span style={{ color: "#94A3B8" }}>{currentTimestamp}</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setProgress(val);
              if (onFrameChange) onFrameChange(val);
            }}
            style={{
              width: "100%",
              height: 5,
              borderRadius: 3,
              accentColor: "#00E5FF",
              cursor: "pointer"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              style={{
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                background: playbackSpeed === spd ? "rgba(0, 229, 255, 0.2)" : "transparent",
                color: playbackSpeed === spd ? "#00E5FF" : "#64748B",
                border: playbackSpeed === spd ? "1px solid rgba(0, 229, 255, 0.4)" : "1px solid transparent"
              }}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
