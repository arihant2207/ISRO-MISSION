import React, { useEffect, useRef } from "react";
import { Satellite as SatIcon, Wifi } from "lucide-react";
import { SATELLITES } from "../data";

// Reusable 3D Canvas Wireframe Satellite
function Satellite3DCanvas({ satelliteId }: { satelliteId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let theta = Math.random() * Math.PI; // initial angle
    let signalPulse = 0;

    // Define 3D wireframe points for a satellite
    // Craft body: cube
    const bodyPoints = [
      { x: -10, y: -10, z: -10 },
      { x: 10, y: -10, z: -10 },
      { x: 10, y: 10, z: -10 },
      { x: -10, y: 10, z: -10 },
      { x: -10, y: -10, z: 10 },
      { x: 10, y: -10, z: 10 },
      { x: 10, y: 10, z: 10 },
      { x: -10, y: 10, z: 10 },
    ];
    // Connections to make cube
    const bodyEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back
      [4, 5], [5, 6], [6, 7], [7, 4], // front
      [0, 4], [1, 5], [2, 6], [3, 7]  // links
    ];

    // Solar panels (left and right wings)
    const solarLeft = [
      { x: -35, y: -6, z: 0 },
      { x: -15, y: -6, z: 0 },
      { x: -15, y: 6, z: 0 },
      { x: -35, y: 6, z: 0 }
    ];
    const solarRight = [
      { x: 15, y: -6, z: 0 },
      { x: 35, y: -6, z: 0 },
      { x: 35, y: 6, z: 0 },
      { x: 15, y: 6, z: 0 }
    ];

    // Antenna dish points (pointing down)
    const antennaPoints = [
      { x: 0, y: 10, z: 0 }, // base
      { x: 0, y: 18, z: 0 }, // feed
      { x: -6, y: 15, z: -3 }, // dish corners
      { x: 6, y: 15, z: -3 },
      { x: 6, y: 15, z: 3 },
      { x: -6, y: 15, z: 3 }
    ];

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2 - 10;
      const scale = 1.8;

      theta += 0.012; // slow spin
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      // slight tilt
      const cosP = Math.cos(0.25);
      const sinP = Math.sin(0.25);

      function project(x: number, y: number, z: number) {
        // Rotate Y (theta)
        const x1 = x * cosT - z * sinT;
        const z1 = x * sinT + z * cosT;
        // Rotate X (tilt)
        const y2 = y * cosP - z1 * sinP;
        return {
          px: cx + x1 * scale,
          py: cy - y2 * scale
        };
      }

      // Draw Earth horizon curve at the bottom
      ctx.strokeStyle = "rgba(0, 229, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, canvas.height + 150, 220, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();

      // Draw Orbit dashed line background
      ctx.strokeStyle = "rgba(123, 97, 255, 0.08)";
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Draw signal telemetry pulses pointing downwards
      signalPulse += 0.35;
      if (signalPulse > 35) signalPulse = 0;
      ctx.strokeStyle = `rgba(0, 229, 255, ${1.0 - signalPulse / 35})`;
      ctx.beginPath();
      ctx.arc(cx, cy + 18, signalPulse, Math.PI * 0.25, Math.PI * 0.75);
      ctx.stroke();

      // Draw solar panels left
      ctx.fillStyle = "rgba(0, 100, 255, 0.15)";
      ctx.strokeStyle = "#00a3ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      solarLeft.forEach((p, idx) => {
        const pt = project(p.x, p.y, p.z);
        if (idx === 0) ctx.moveTo(pt.px, pt.py);
        else ctx.lineTo(pt.px, pt.py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Draw grid lines inside panel
      const l1 = project(-25, -6, 0), l2 = project(-25, 6, 0);
      ctx.beginPath(); ctx.moveTo(l1.px, l1.py); ctx.lineTo(l2.px, l2.py); ctx.stroke();

      // Draw solar panels right
      ctx.fillStyle = "rgba(0, 100, 255, 0.15)";
      ctx.strokeStyle = "#00a3ff";
      ctx.beginPath();
      solarRight.forEach((p, idx) => {
        const pt = project(p.x, p.y, p.z);
        if (idx === 0) ctx.moveTo(pt.px, pt.py);
        else ctx.lineTo(pt.px, pt.py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Draw grid line
      const r1 = project(25, -6, 0), r2 = project(25, 6, 0);
      ctx.beginPath(); ctx.moveTo(r1.px, r1.py); ctx.lineTo(r2.px, r2.py); ctx.stroke();

      // Draw panel brackets (body connection lines)
      const bLeft = project(-10, 0, 0), pLeft = project(-15, 0, 0);
      const bRight = project(10, 0, 0), pRight = project(15, 0, 0);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bLeft.px, bLeft.py); ctx.lineTo(pLeft.px, pLeft.py);
      ctx.moveTo(bRight.px, bRight.py); ctx.lineTo(pRight.px, pRight.py);
      ctx.stroke();

      // Draw main cube body
      ctx.strokeStyle = "#00E5FF";
      ctx.fillStyle = "rgba(5, 12, 28, 0.9)";
      ctx.lineWidth = 1;
      // Draw face fills to create solid depth feel (back to front sort of)
      bodyEdges.forEach((edge) => {
        const pA = project(bodyPoints[edge[0]].x, bodyPoints[edge[0]].y, bodyPoints[edge[0]].z);
        const pB = project(bodyPoints[edge[1]].x, bodyPoints[edge[1]].y, bodyPoints[edge[1]].z);
        ctx.beginPath();
        ctx.moveTo(pA.px, pA.py);
        ctx.lineTo(pB.px, pB.py);
        ctx.stroke();
      });

      // Draw Antenna dish pointing downwards
      const antBase = project(antennaPoints[0].x, antennaPoints[0].y, antennaPoints[0].z);
      const antFeed = project(antennaPoints[1].x, antennaPoints[1].y, antennaPoints[1].z);
      ctx.strokeStyle = "#7B61FF";
      ctx.beginPath();
      ctx.moveTo(antBase.px, antBase.py);
      ctx.lineTo(antFeed.px, antFeed.py);
      ctx.stroke();

      // Draw dish wire frame
      ctx.fillStyle = "rgba(123, 97, 255, 0.2)";
      ctx.beginPath();
      for (let idx = 2; idx < 6; idx++) {
        const pt = project(antennaPoints[idx].x, antennaPoints[idx].y, antennaPoints[idx].z);
        if (idx === 2) ctx.moveTo(pt.px, pt.py);
        else ctx.lineTo(pt.px, pt.py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width={220} 
      height={115} 
      style={{ display: "block", background: "linear-gradient(180deg, #020712, #040d21)", borderRadius: 6, border: "1px solid rgba(0, 229, 255, 0.08)" }}
    />
  );
}

export default function SatellitesScreen() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "white" }}>Satellite Network</div>
        <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Real-time telemetry and 3D schematics of online geostationary & LEO nodes</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {SATELLITES.map((sat) => (
          <div key={sat.id} className="glass-panel" style={{ padding: 20 }}>
            
            {/* Header info */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 800, color: "white" }}>{sat.id}</div>
                <div style={{ fontSize: 10, color: "#64748B", marginTop: 1, fontFamily: "'JetBrains Mono', monospace" }}>{sat.orbit}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 12, background: sat.status === "active" ? "rgba(0,255,136,0.08)" : "rgba(255,184,0,0.08)", border: `1px solid ${sat.status === "active" ? "rgba(0,255,136,0.25)" : "rgba(255,184,0,0.25)"}` }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: sat.status === "active" ? "#00FF88" : "#FFB800", animation: sat.status === "active" ? "pulse-dot 2s infinite" : "none" }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: sat.status === "active" ? "#00FF88" : "#FFB800" }}>{sat.status.toUpperCase()}</span>
              </div>
            </div>

            {/* 3D Satellite Wireframe visualizer */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <Satellite3DCanvas satelliteId={sat.id} />
            </div>

            {/* Details and stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Coverage Region", sat.coverage],
                ["Cloud Cover", `${sat.cloud}%`],
                ["Refresh Interval", sat.refresh]
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>{l}</span>
                  <span style={{ fontSize: 11, color: "#E2E8F0", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              
              <div style={{ marginTop: 6, borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                    <Wifi size={10} color="#00E5FF" /> Signal Transmission
                  </span>
                  <span style={{ fontSize: 11, color: "#00E5FF", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{sat.signal}%</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                  <div style={{ width: `${sat.signal}%`, height: "100%", background: "linear-gradient(90deg,#7B61FF,#00E5FF)", borderRadius: 2 }} />
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
