import React, { useEffect, useRef, useState } from "react";
import { MICHAUNG_IBTRACS_TRACK, MICHAUNG_METADATA } from "../michaungTrack";

interface SatelliteViewerProps {
  mode: string;
  isPlaying: boolean;
  frameIdx?: number;
}

const FRAMES = ["00:00", "07:30", "15:00", "22:30", "30:00"];
const FTYPES = [
  "RAW_OBSERVED (30m)", 
  "PROTOTYPE_INTERPOLATED (15m)", 
  "RAW_OBSERVED (30m)", 
  "PROTOTYPE_INTERPOLATED (15m)", 
  "RAW_OBSERVED (30m)"
];

export default function SatelliteViewer({ mode, isPlaying, frameIdx = 0 }: SatelliteViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [tick, setTick] = useState(0);
  const timeRef = useRef(0);
  const rafRef = useRef(0);

  const isPlayingRef = useRef(isPlaying);
  const frameIdxRef = useRef(frameIdx);

  // Pull real IBTrACS track values for selected frame
  const trackIndices = [34, 36, 38, 40, 42];
  const activeTrackPt = MICHAUNG_IBTRACS_TRACK[trackIndices[frameIdx]] || MICHAUNG_IBTRACS_TRACK[34];
  const activeWindKmh = Math.round(activeTrackPt.windKt * 1.852);
  const activePresHpa = activeTrackPt.presHpa;

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    frameIdxRef.current = frameIdx;
  }, [isPlaying, frameIdx]);

  // ─── Animation Ticker ───
  useEffect(() => {
    let prev = performance.now();
    function loop(now: number) {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      
      timeRef.current += dt;
      setTick((t) => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ─── Resize listener ───
  useEffect(() => {
    const handleResize = () => setTick((t) => t + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Procedural Wind Particles ───
  const windParticlesRef = useRef<{ angle: number; r: number; speed: number; size: number }[]>([]);
  if (windParticlesRef.current.length === 0) {
    windParticlesRef.current = Array.from({ length: 22 }, () => ({
      angle: Math.random() * Math.PI * 2,
      r: 16 + Math.random() * 64,
      speed: 0.06 + Math.random() * 0.06,
      size: 1.2 + Math.random() * 1.5
    }));
  }

  // ─── Canvas overlay rendering logic ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cX = canvas.width * 0.52;
    const cY = canvas.height * 0.48;

    const particleSpeedMult = isPlaying ? 1.2 : 0.2;
    windParticlesRef.current.forEach((p) => {
      p.angle -= p.speed * particleSpeedMult;
    });

    const isDiffMode = mode === "difference";

    // ─── GIS Grid coordinate labels ───
    ctx.strokeStyle = isDiffMode ? "rgba(255, 77, 109, 0.05)" : "rgba(0, 229, 255, 0.06)";
    ctx.lineWidth = 0.5;
    ctx.fillStyle = isDiffMode ? "rgba(255, 77, 109, 0.4)" : "rgba(0, 229, 255, 0.4)";
    ctx.font = "8px 'JetBrains Mono', monospace";
    
    const lons = [{ val: 65, pct: 0.2 }, { val: 75, pct: 0.4 }, { val: 85, pct: 0.6 }, { val: 95, pct: 0.8 }];
    lons.forEach((lon) => {
      const x = canvas.width * lon.pct;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      ctx.fillText(`${lon.val}°E`, x + 4, canvas.height - 12);
    });

    const lats = [{ val: 30, pct: 0.25 }, { val: 20, pct: 0.5 }, { val: 10, pct: 0.75 }];
    lats.forEach((lat) => {
      const y = canvas.height * lat.pct;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      ctx.fillText(`${lat.val}°N`, 12, y - 4);
    });

    // ─── Conic Radar sweep ───
    const sweepAngle = (timeRef.current * 0.75) % (Math.PI * 2);
    ctx.save();
    ctx.beginPath(); ctx.arc(cX, cY, 120, 0, Math.PI * 2); ctx.clip();
    const sweepGrad = ctx.createConicGradient(sweepAngle, cX, cY);
    sweepGrad.addColorStop(0, isDiffMode ? "rgba(255, 77, 109, 0.16)" : "rgba(0, 229, 255, 0.16)");
    sweepGrad.addColorStop(0.2, isDiffMode ? "rgba(255, 77, 109, 0.01)" : "rgba(0, 229, 255, 0.01)");
    sweepGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = sweepGrad;
    ctx.beginPath(); ctx.moveTo(cX, cY); ctx.arc(cX, cY, 120, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Range rings
    ctx.strokeStyle = isDiffMode ? "rgba(255, 77, 109, 0.12)" : "rgba(0, 229, 255, 0.12)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(cX, cY, 55, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);

    // Target Lock Box
    const boxSize = 70;
    ctx.strokeStyle = isDiffMode ? "#FF4D6D" : "#00E5FF";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cX - boxSize/2, cY - boxSize/2 + 8); ctx.lineTo(cX - boxSize/2, cY - boxSize/2); ctx.lineTo(cX - boxSize/2 + 8, cY - boxSize/2);
    ctx.moveTo(cX + boxSize/2 - 8, cY - boxSize/2); ctx.lineTo(cX + boxSize/2, cY - boxSize/2); ctx.lineTo(cX + boxSize/2, cY - boxSize/2 + 8);
    ctx.moveTo(cX - boxSize/2, cY + boxSize/2 - 8); ctx.lineTo(cX - boxSize/2, cY + boxSize/2); ctx.lineTo(cX - boxSize/2 + 8, cY + boxSize/2);
    ctx.moveTo(cX + boxSize/2 - 8, cY + boxSize/2); ctx.lineTo(cX + boxSize/2, cY + boxSize/2); ctx.lineTo(cX + boxSize/2, cY + boxSize/2 - 8);
    ctx.stroke();

    // Telemetry HUD Card (Requirements 4, 5, 6)
    const infoX = cX + 48;
    const infoY = cY - 55;
    const infoW = 185;
    const infoH = 112;
    
    ctx.fillStyle = "rgba(6, 14, 28, 0.88)";
    ctx.strokeStyle = isDiffMode ? "rgba(255, 77, 109, 0.28)" : "rgba(0, 229, 255, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(infoX, infoY, infoW, infoH, 6); ctx.fill(); ctx.stroke();

    ctx.strokeStyle = isDiffMode ? "rgba(255, 77, 109, 0.4)" : "rgba(0, 229, 255, 0.4)";
    ctx.beginPath(); ctx.moveTo(cX, cY); ctx.lineTo(infoX, infoY + 30); ctx.stroke();

    ctx.fillStyle = isDiffMode ? "#FF4D6D" : "#00E5FF";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillText("▲ TARGET: CYCLONE_MICHAUNG", infoX + 10, infoY + 14);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "8.5px 'JetBrains Mono', monospace";
    
    const timestampStr = `${activeTrackPt.time} UTC (HISTORICAL)`;

    const lockData = [
      ["Satellite:", "INSAT-3D (OBSERVED)"],
      ["Timestamp:", timestampStr],
      ["Frame:", `0${frameIdx + 1} / 05`],
      ["Wind speed:", `${activeWindKmh} KM/H (IBTrACS)`],
      ["Core press:", `${activePresHpa} hPa (IBTrACS)`],
      ["Model Status:", "DEMO / NOT INFERRED"],
      ["Processing:", isDiffMode ? "IMAGE DIFFERENCE" : FTYPES[frameIdx]]
    ];
    lockData.forEach(([label, value], idx) => {
      const yOffset = infoY + 28 + idx * 11;
      ctx.fillStyle = "#64748B";
      ctx.fillText(label, infoX + 10, yOffset);
      ctx.fillStyle = label.includes("Status") ? "#FFB800" : isDiffMode ? "#FF4D6D" : "#00E5FF";
      ctx.fillText(value, infoX + infoW - 110, yOffset);
    });

  }, [tick, mode, isPlaying, frameIdx]);

  // Mode provenance badge labels
  const getBadgeForMode = (m: string) => {
    if (m === "original") return { text: "REAL OBSERVATION · INSAT-3D IR 10.8 µm", bg: "rgba(0, 245, 147, 0.85)", color: "#030712" };
    if (m === "interpolated") return { text: "INTERPOLATION DEMONSTRATION · DERIVED FROM AVAILABLE OBSERVATION", bg: "rgba(123, 97, 255, 0.85)", color: "#FFFFFF" };
    if (m === "ground_truth") return { text: "REAL OBSERVATION · GROUND TRUTH SENSOR SCAN", bg: "rgba(0, 245, 147, 0.85)", color: "#030712" };
    return { text: "DERIVED DATA · IMAGE DIFFERENCE COMPUTED", bg: "rgba(255, 77, 109, 0.85)", color: "#FFFFFF" };
  };

  const badgeInfo = getBadgeForMode(mode);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#02040b", borderRadius: 12 }}>
      {/* Real INSAT-3D Satellite Observation GIF for Cyclone Michaung */}
      <img 
        src="/IR_Michaung.gif" 
        alt="INSAT-3D IR Satellite Observation - Cyclone Michaung" 
        style={{ 
          width: "100%", 
          height: "100%", 
          objectFit: "contain", 
          display: "block",
          opacity: mode === "interpolated" ? 0.95 : 0.85,
          filter: mode === "interpolated" 
            ? "contrast(1.2) brightness(1.02) hue-rotate(8deg)" 
            : mode === "difference"
            ? "contrast(1.3) invert(0.8) hue-rotate(180deg)"
            : "contrast(1.15) brightness(0.92) saturate(1.1)"
        }} 
      />

      {/* Canvas Overlay for Telemetry & Target Lock HUD */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10 }}
      />

      {/* Explicit Mode Data Provenance Badge */}
      <div 
        style={{ 
          position: "absolute", 
          top: 12, 
          left: 12, 
          background: badgeInfo.bg, 
          color: badgeInfo.color, 
          padding: "4px 8px", 
          borderRadius: 4, 
          fontSize: 8.5, 
          fontWeight: 800, 
          fontFamily: "'JetBrains Mono', monospace",
          zIndex: 20
        }}
      >
        {badgeInfo.text}
      </div>
    </div>
  );
}
