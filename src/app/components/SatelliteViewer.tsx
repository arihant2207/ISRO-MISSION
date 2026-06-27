import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import indiaSatelliteImg from "./india_satellite_base.png";

interface SatelliteViewerProps {
  mode: string;
  isPlaying: boolean;
  frameIdx?: number;
}

const FRAMES = ["00:00", "07:30", "15:00", "22:30", "30:00"];
const FTYPES = ["RAW_INPUT (30m)", "AI_SYNTHESIZED (7.5m)", "RAW_INPUT (30m)", "AI_SYNTHESIZED (7.5m)", "RAW_INPUT (30m)"];

const FRAME_METRICS = [
  { wind: 162, pressure: 970, temp: 27.8 },
  { wind: 165, pressure: 968, temp: 28.4 },
  { wind: 167, pressure: 967, temp: 28.9 },
  { wind: 169, pressure: 965, temp: 29.2 },
  { wind: 172, pressure: 962, temp: 29.8 }
];

export default function SatelliteViewer({ mode, isPlaying, frameIdx = 0 }: SatelliteViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [tick, setTick] = useState(0);
  const timeRef = useRef(0);
  const rafRef = useRef(0);

  const isPlayingRef = useRef(isPlaying);
  const frameIdxRef = useRef(frameIdx);
  const metricsRef = useRef({ wind: 162, pressure: 970, temp: 27.8 });

  // Weather variables
  const [metrics, setMetrics] = useState({ pressure: 970, wind: 162, temp: 27.8 });

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
      
      // Always advance ticker for ambient canvas sweep animations
      timeRef.current += dt;
      setTick((t) => t + 1);

      // Smoothly interpolate metrics towards the current frame's target values with tiny fluctuations
      const target = FRAME_METRICS[frameIdxRef.current] || FRAME_METRICS[0];
      const windFlutter = Math.sin(timeRef.current * 4) * 0.35;
      const pressFlutter = Math.cos(timeRef.current * 3.2) * 0.25;
      const tempFlutter = Math.sin(timeRef.current * 1.8) * 0.07;

      metricsRef.current.wind += (target.wind + windFlutter - metricsRef.current.wind) * 0.12;
      metricsRef.current.pressure += (target.pressure + pressFlutter - metricsRef.current.pressure) * 0.12;
      metricsRef.current.temp += (target.temp + tempFlutter - metricsRef.current.temp) * 0.12;

      setMetrics({
        wind: Math.round(metricsRef.current.wind),
        pressure: Math.round(metricsRef.current.pressure),
        temp: parseFloat(metricsRef.current.temp.toFixed(1))
      });

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ─── Resize listener to redraw canvas ───
  useEffect(() => {
    const handleResize = () => {
      setTick((t) => t + 1);
    };
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

    // Match canvas internal resolution to DOM dimensions to avoid scaling issues
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    // Clear overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cyclone center coordinates relative to 2D image layout (placed in Bay of Bengal)
    const cX = canvas.width * 0.62;
    const cY = canvas.height * 0.60;

    // Orbiting Wind Particles (always active, but slower when paused)
    const particleSpeedMult = isPlaying ? 1.2 : 0.2;
    windParticlesRef.current.forEach((p) => {
      p.angle -= p.speed * particleSpeedMult;
    });

    const isDiffMode = mode === "difference";

    // ─── Draw GIS Grid coordinate labels ───
    ctx.strokeStyle = isDiffMode ? "rgba(255, 77, 109, 0.05)" : "rgba(0, 229, 255, 0.06)";
    ctx.lineWidth = 0.5;
    ctx.fillStyle = isDiffMode ? "rgba(255, 77, 109, 0.4)" : "rgba(0, 229, 255, 0.4)";
    ctx.font = "8px 'JetBrains Mono', monospace";
    
    // Longitudinal grid lines
    const lons = [
      { val: 65, pct: 0.2 },
      { val: 75, pct: 0.4 },
      { val: 85, pct: 0.6 },
      { val: 95, pct: 0.8 }
    ];
    lons.forEach((lon) => {
      const x = canvas.width * lon.pct;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      ctx.fillText(`${lon.val}°E`, x + 4, canvas.height - 12);
    });

    // Latitudinal grid lines
    const lats = [
      { val: 30, pct: 0.25 },
      { val: 20, pct: 0.5 },
      { val: 10, pct: 0.75 }
    ];
    lats.forEach((lat) => {
      const y = canvas.height * lat.pct;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
      ctx.fillText(`${lat.val}°N`, 12, y - 4);
    });

    // ─── Draw Weather Cyclone layers ───
    // Conic Radar sweep
    const sweepAngle = (timeRef.current * 0.75) % (Math.PI * 2);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cX, cY, 120, 0, Math.PI * 2);
    ctx.clip();

    const sweepGrad = ctx.createConicGradient(sweepAngle, cX, cY);
    sweepGrad.addColorStop(0, isDiffMode ? "rgba(255, 77, 109, 0.16)" : "rgba(0, 229, 255, 0.16)");
    sweepGrad.addColorStop(0.2, isDiffMode ? "rgba(255, 77, 109, 0.01)" : "rgba(0, 229, 255, 0.01)");
    sweepGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.moveTo(cX, cY);
    ctx.arc(cX, cY, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Concentric range rings
    ctx.strokeStyle = isDiffMode ? "rgba(255, 77, 109, 0.12)" : "rgba(0, 229, 255, 0.12)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(cX, cY, 55, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = isDiffMode ? "rgba(255, 77, 109, 0.05)" : "rgba(0, 229, 255, 0.05)";
    ctx.beginPath(); ctx.arc(cX, cY, 110, 0, Math.PI * 2); ctx.stroke();

    // ─── Draw Meteorological Clouds or Difference Contours ───
    const arms = 3;
    const steps = 90;
    const stormRotation = -timeRef.current * 1.5;
    const flash = Math.random() < (isPlaying ? 0.015 : 0.003);

    if (isDiffMode) {
      // ─── DIFFERENCE MODE: Render neon boundaries & optical flow arrow vectors ───
      ctx.strokeStyle = "rgba(255, 77, 109, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.fillStyle = "rgba(255, 77, 109, 0.05)";
      ctx.strokeRect(cX - 80, cY - 80, 160, 160);
      ctx.fillRect(cX - 80, cY - 80, 160, 160);
      ctx.fillStyle = "#FF4D6D";
      ctx.font = "bold 8px 'JetBrains Mono', monospace";
      ctx.fillText("▲ INTERPOLATION_DIFFERENCE_SURFACE", cX - 74, cY - 70);
      ctx.fillText("▲ DELTA_SIGMA_DEVIATION: 0.031", cX - 74, cY + 72);

      // Draw displacement difference contours
      for (let arm = 0; arm < arms; arm++) {
        const startAngle = stormRotation + arm * ((Math.PI * 2) / arms);
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.35 + Math.sin(timeRef.current * 3) * 0.1})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 10; i <= steps; i += 4) {
          const frac = i / steps;
          const r = frac * 85;
          const theta = startAngle + frac * Math.PI * 4.2;
          const px = cX + r * Math.cos(theta);
          const py = cY + r * Math.sin(theta);
          if (i === 10) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 77, 109, ${0.3 + Math.sin(timeRef.current * 4) * 0.08})`;
        ctx.beginPath();
        for (let i = 10; i <= steps; i += 4) {
          const frac = i / steps;
          const r = frac * 85 + 4; // offset contour indicating change
          const theta = startAngle + frac * Math.PI * 4.2;
          const px = cX + r * Math.cos(theta);
          const py = cY + r * Math.sin(theta);
          if (i === 10) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Draw active motion vectors (arrow lines showing cloud movements)
      const motionVectors = [
        { x: cX - 42, y: cY - 22, vx: -12, vy: -8 },
        { x: cX - 22, y: cY - 42, vx: -8, vy: -12 },
        { x: cX + 22, y: cY - 42, vx: 8, vy: -12 },
        { x: cX + 42, y: cY - 22, vx: 12, vy: -8 },
        { x: cX + 42, y: cY + 22, vx: 12, vy: 8 },
        { x: cX + 22, y: cY + 42, vx: 8, vy: 12 },
        { x: cX - 22, y: cY + 42, vx: -8, vy: 12 },
        { x: cX - 42, y: cY + 22, vx: -12, vy: 8 },
      ];
      motionVectors.forEach((v) => {
        const shift = isPlaying ? ((timeRef.current * 18) % 15) : 8;
        const startX = v.x + (v.vx * shift) / 15;
        const startY = v.y + (v.vy * shift) / 15;
        const endX = startX + v.vx;
        const endY = startY + v.vy;

        ctx.strokeStyle = "#00E5FF";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(v.vy, v.vx);
        ctx.fillStyle = "#00E5FF";
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 4 * Math.cos(angle - Math.PI / 6), endY - 4 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - 4 * Math.cos(angle + Math.PI / 6), endY - 4 * Math.sin(angle + Math.PI / 6));
        ctx.fill();
      });

    } else {
      // ─── NORMAL MODE: Render standard volumetric clouds & weather reflectivity ───
      for (let arm = 0; arm < arms; arm++) {
        const startAngle = stormRotation + arm * ((Math.PI * 2) / arms);
        for (let i = 0; i <= steps; i++) {
          const frac = i / steps;
          const r = frac * 80;
          const theta = startAngle + frac * Math.PI * 4.2;
          const px = cX + r * Math.cos(theta);
          const py = cY + r * Math.sin(theta);

          ctx.fillStyle = flash 
            ? `rgba(225, 240, 255, ${0.45 * (1.0 - frac)})` 
            : `rgba(240, 248, 255, ${(0.3 - frac * 0.2)})`;
          
          ctx.beginPath();
          ctx.arc(px, py, 8 * (1.0 - frac * 0.45), 0, Math.PI * 2);
          ctx.fill();

          if (frac > 0.15 && frac < 0.65 && (Math.sin(theta * 5.0) > 0.2)) {
            const isHeavy = frac > 0.3 && frac < 0.5;
            ctx.fillStyle = isHeavy 
              ? `rgba(255, 120, 0, ${(0.42 - frac * 0.22)})`
              : `rgba(0, 245, 160, ${(0.35 - frac * 0.18)})`;
            ctx.beginPath();
            ctx.arc(px + (Math.sin(timeRef.current * 5 + r) * 2), py, 4.5 * (1.0 - frac * 0.45), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Cyclone eye core
    ctx.fillStyle = isDiffMode ? "rgba(255, 77, 109, 0.95)" : "rgba(2, 4, 11, 0.95)";
    ctx.beginPath(); ctx.arc(cX, cY, 5.5, 0, Math.PI * 2); ctx.fill();

    // ─── Wind Vector Particles ───
    ctx.fillStyle = isDiffMode ? "#FF4D6D" : "#00E5FF";
    ctx.shadowBlur = 4;
    ctx.shadowColor = isDiffMode ? "#FF4D6D" : "#00E5FF";
    windParticlesRef.current.forEach((p) => {
      const wx = cX + Math.cos(p.angle) * p.r;
      const wy = cY + Math.sin(p.angle) * p.r;
      ctx.beginPath();
      ctx.arc(wx, wy, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0; // reset

    // ─── Storm Trajectory Curves (Normalized) ───
    const pPast = { x: canvas.width * 0.75, y: canvas.height * 0.85 };
    const pFore = { x: canvas.width * 0.45, y: canvas.height * 0.35 };

    // Past track
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(cX, cY);
    ctx.quadraticCurveTo((cX + pPast.x)/2 + 25, (cY + pPast.y)/2 + 20, pPast.x, pPast.y);
    ctx.stroke();

    // Forecast Path
    ctx.strokeStyle = "#FFAA00";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cX, cY);
    ctx.quadraticCurveTo((cX + pFore.x)/2 - 30, (cY + pFore.y)/2 - 30, pFore.x, pFore.y);
    ctx.stroke();
    ctx.setLineDash([]); // clear

    // ─── AI Target Lock brackets ───
    const boxSize = 70;
    ctx.strokeStyle = isDiffMode ? "#FF4D6D" : "#00E5FF";
    ctx.lineWidth = 1;
    ctx.beginPath();
    // top-left
    ctx.moveTo(cX - boxSize/2, cY - boxSize/2 + 8);
    ctx.lineTo(cX - boxSize/2, cY - boxSize/2);
    ctx.lineTo(cX - boxSize/2 + 8, cY - boxSize/2);
    // top-right
    ctx.moveTo(cX + boxSize/2 - 8, cY - boxSize/2);
    ctx.lineTo(cX + boxSize/2, cY - boxSize/2);
    ctx.lineTo(cX + boxSize/2, cY - boxSize/2 + 8);
    // bottom-left
    ctx.moveTo(cX - boxSize/2, cY + boxSize/2 - 8);
    ctx.lineTo(cX - boxSize/2, cY + boxSize/2);
    ctx.lineTo(cX - boxSize/2 + 8, cY + boxSize/2);
    // bottom-right
    ctx.moveTo(cX + boxSize/2 - 8, cY + boxSize/2);
    ctx.lineTo(cX + boxSize/2, cY + boxSize/2);
    ctx.lineTo(cX + boxSize/2, cY + boxSize/2 - 8);
    ctx.stroke();

    // Crosshair dot
    ctx.fillStyle = isDiffMode ? "#FF4D6D" : "#00E5FF";
    ctx.beginPath(); ctx.arc(cX, cY, 2, 0, Math.PI * 2); ctx.fill();

    // ─── Target Lock Info Box (Telemetry HUD) ───
    const infoX = cX + 48;
    const infoY = cY - 55;
    const infoW = 180;
    const infoH = 112;
    
    ctx.fillStyle = "rgba(6, 14, 28, 0.82)";
    ctx.strokeStyle = isDiffMode ? "rgba(255, 77, 109, 0.28)" : "rgba(0, 229, 255, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(infoX, infoY, infoW, infoH, 6);
    ctx.fill();
    ctx.stroke();

    // Connector line
    ctx.strokeStyle = isDiffMode ? "rgba(255, 77, 109, 0.4)" : "rgba(0, 229, 255, 0.4)";
    ctx.beginPath(); ctx.moveTo(cX, cY); ctx.lineTo(infoX, infoY + 30); ctx.stroke();

    // Lock Info title
    ctx.fillStyle = isDiffMode ? "#FF4D6D" : "#FF4B6E";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillText("▲ TARGET: CYCLONE_MICHAUNG", infoX + 10, infoY + 14);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "8.5px 'JetBrains Mono', monospace";
    
    // Determine dynamic values based on frame index
    const activeFrame = FRAMES[frameIdx];
    const activeStatus = isDiffMode ? "DIFFERENCE_MAP" : FTYPES[frameIdx];
    const timestampStr = `2026-06-26 15:27:${activeFrame}`;

    const lockData = [
      ["Satellite:", "INSAT-3DS"],
      ["Timestamp:", timestampStr],
      ["Frame:", `0${frameIdx + 1} / 05`],
      ["Confidence:", "94.20%"],
      ["Wind speed:", `${metrics.wind} KM/H`],
      ["Core press:", `${metrics.pressure} hPa`],
      ["Status:", activeStatus]
    ];
    lockData.forEach(([label, value], idx) => {
      const yOffset = infoY + 28 + idx * 11;
      ctx.fillStyle = "#64748B";
      ctx.fillText(label, infoX + 10, yOffset);
      ctx.fillStyle = isDiffMode ? "#FF4D6D" : "#00E5FF";
      ctx.fillText(value, infoX + infoW - 98, yOffset);
    });

    // ─── Vertical Scan Sweeper line ───
    const scanY = ((timeRef.current * 100) % (canvas.height + 40)) - 20;
    ctx.strokeStyle = isDiffMode ? "rgba(255, 77, 109, 0.45)" : "rgba(0, 220, 255, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(canvas.width, scanY); ctx.stroke();

    // ─── Bottom HUD Overlay ───
    ctx.fillStyle = "rgba(6, 14, 28, 0.72)";
    ctx.strokeStyle = isDiffMode ? "rgba(255, 77, 109, 0.16)" : "rgba(0, 220, 255, 0.16)";
    ctx.lineWidth = 1;
    
    const hudW = 160;
    const hudH = 18;
    const hudY = canvas.height - 30;
    
    // Left telemetry block
    ctx.beginPath(); ctx.roundRect(12, hudY, hudW, hudH, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#64748B";
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.fillText("TELEMETRY: ", 18, hudY + 12);
    ctx.fillStyle = isDiffMode ? "#FF4D6D" : "#00E5FF";
    ctx.fillText("INSAT-3DS_GEO", 75, hudY + 12);

    // Right wavelength block
    ctx.fillStyle = "rgba(6, 14, 28, 0.72)";
    ctx.beginPath(); ctx.roundRect(canvas.width - 12 - 110, hudY, 110, hudH, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#64748B";
    ctx.fillText("WAVELENGTH: ", canvas.width - 12 - 104, hudY + 12);
    ctx.fillStyle = "#00F5A0";
    ctx.fillText("VIS_0.65UM", canvas.width - 12 - 50, hudY + 12);

  }, [tick, mode, isPlaying, frameIdx]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#02040b", borderRadius: 12 }}>
      
      {/* Background High-Resolution Satellite Image Base Layer */}
      <img 
        src={indiaSatelliteImg} 
        alt="Satellite Basemap India" 
        style={{ 
          width: "100%", 
          height: "100%", 
          objectFit: "cover", 
          display: "block",
          opacity: 0.82,
          filter: "contrast(1.15) brightness(0.88) saturate(1.05)" // Dark satellite console aesthetics
        }} 
      />

      {/* Overlay Canvas (all coordinate locked drawings) */}
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
    </div>
  );
}
