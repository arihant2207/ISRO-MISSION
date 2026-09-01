import React, { useEffect, useRef, useState } from "react";
import { Brain, ShieldCheck, Database, Layers, Info, AlertCircle, Cpu, Radio, Sparkles, ArrowRight } from "lucide-react";
import { MICHAUNG_METADATA } from "../michaungTrack";

interface XAIScreenProps {
  onNavigate?: (navId: string) => void;
}

// Interactive Canvas-based Attention Heatmap with Prototype Labels
function AttentionHeatmap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ col: number; row: number; val: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const ROWS = 11;
    const COLS = 18;

    const targetX = 13.0;
    const targetY = 7.0;
    const particles: { x: number; speed: number; alpha: number; pathIdx: number }[] = [];

    const flowPaths = [
      { startX: 1, startY: 1, cp1X: 5, cp1Y: 3, cp2X: 9, cp2Y: 5 },
      { startX: 1, startY: 9, cp1X: 4, cp1Y: 8, cp2X: 8, cp2Y: 7 },
      { startX: 16, startY: 1, cp1X: 15, cp1Y: 3, cp2X: 14, cp2Y: 5 },
      { startX: 16, startY: 9, cp1X: 15, cp1Y: 8, cp2X: 14, cp2Y: 7 },
      { startX: 8, startY: 1, cp1X: 10, cp1Y: 3, cp2X: 12, cp2Y: 5 },
      { startX: 8, startY: 10, cp1X: 10, cp1Y: 9, cp2X: 12, cp2Y: 8 }
    ];

    const spawnParticle = (index?: number) => {
      const pathIdx = index !== undefined ? index : Math.floor(Math.random() * flowPaths.length);
      particles.push({
        x: 0,
        speed: 0.004 + Math.random() * 0.006,
        alpha: 0.3 + Math.random() * 0.5,
        pathIdx
      });
    };

    for (let i = 0; i < 12; i++) {
      spawnParticle(i % flowPaths.length);
      particles[i].x = Math.random();
    }

    const draw = () => {
      const width = canvas.width = canvas.clientWidth || 450;
      const height = canvas.height = canvas.clientHeight || 240;
      ctx.clearRect(0, 0, width, height);

      const cellW = (width - 25) / COLS;
      const cellH = (height - 30) / ROWS;
      const t = Date.now() * 0.0012;

      const cyX = 13 + Math.sin(t * 0.7) * 0.35;
      const cyY = 7 + Math.cos(t * 0.5) * 0.25;

      // 1. Draw Heatmap Cells
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cd = Math.sqrt((c - cyX) ** 2 + (r - cyY) ** 2);
          const cl = Math.min(
            Math.sqrt((c - 2 - Math.sin(t * 0.4) * 0.3) ** 2 + (r - 2) ** 2),
            Math.sqrt((c - 6) ** 2 + (r - 1 - Math.cos(t * 0.3) * 0.2) ** 2),
            Math.sqrt((c - 1) ** 2 + (r - 5 + Math.sin(t * 0.5) * 0.2) ** 2)
          );
          
          const baseVal = Math.max(0, Math.min(1, 0.82 * Math.exp(-cd * 0.42) + 0.5 * Math.exp(-cl * 0.52)));
          const val = Math.max(0, Math.min(1, baseVal + Math.sin(t * 2.5 + c * 0.7 + r * 0.4) * 0.03));

          const x = 10 + c * cellW;
          const y = 15 + r * cellH;

          let color = `rgba(0, 229, 255, ${0.08 + val * 0.52})`;
          if (val > 0.33 && val <= 0.67) {
            const ratio = (val - 0.33) / 0.34;
            color = `rgba(255, 184, 0, ${0.22 + ratio * 0.58})`;
          } else if (val > 0.67) {
            const ratio = (val - 0.67) / 0.33;
            color = `rgba(255, 77, 109, ${0.45 + ratio * 0.55})`;
          }

          ctx.fillStyle = color;

          if (val > 0.72) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(255, 77, 109, 0.5)";
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.rect(x + 1, y + 1, cellW - 2, cellH - 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // 2. Draw Grid Axis Coordinate Labels
      ctx.fillStyle = "rgba(148, 163, 184, 0.35)";
      ctx.font = "8px var(--font-display), monospace";
      ctx.textAlign = "center";
      for (let c = 0; c < COLS; c++) {
        const char = String.fromCharCode(65 + c);
        ctx.fillText(char, 10 + c * cellW + cellW / 2, 9);
      }
      ctx.textAlign = "left";
      for (let r = 0; r < ROWS; r++) {
        ctx.fillText(String(r + 1).padStart(2, "0"), width - 13, 15 + r * cellH + cellH / 2 + 3);
      }

      // 3. Draw Attention Flow curves
      particles.forEach((p, idx) => {
        p.x += p.speed;
        if (p.x >= 1.0) {
          particles.splice(idx, 1);
          spawnParticle();
          return;
        }

        const path = flowPaths[p.pathIdx];
        const tVal = p.x;
        const mt = 1 - tVal;
        
        const gridX = mt*mt*mt * path.startX + 3*mt*mt*tVal * path.cp1X + 3*mt*tVal*tVal * path.cp2X + tVal*tVal*tVal * cyX;
        const gridY = mt*mt*mt * path.startY + 3*mt*mt*tVal * path.cp1Y + 3*mt*tVal*tVal * path.cp2Y + tVal*tVal*tVal * cyY;

        const pxX = 10 + gridX * cellW + cellW / 2;
        const pxY = 15 + gridY * cellH + cellH / 2;

        ctx.strokeStyle = "rgba(0, 229, 255, 0.02)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10 + path.startX * cellW + cellW / 2, 15 + path.startY * cellH + cellH / 2);
        ctx.bezierCurveTo(
          10 + path.cp1X * cellW + cellW / 2, 15 + path.cp1Y * cellH + cellH / 2,
          10 + path.cp2X * cellW + cellW / 2, 15 + path.cp2Y * cellH + cellH / 2,
          10 + cyX * cellW + cellW / 2, 15 + cyY * cellH + cellH / 2
        );
        ctx.stroke();

        ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha * (1 - p.x) * 0.9})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#00E5FF";
        ctx.beginPath();
        ctx.arc(pxX, pxY, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      while (particles.length < 12) {
        spawnParticle();
      }

      // 4. Draw Reticle Lock with Scientifically Honest Labels
      const reticleX = 10 + cyX * cellW + cellW / 2;
      const reticleY = 15 + cyY * cellH + cellH / 2;
      const pulseRadius = 14 + Math.sin(t * 4.5) * 3.5;

      ctx.strokeStyle = "rgba(255, 77, 109, 0.65)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(reticleX, reticleY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#FF4D6D";
      ctx.font = "8px var(--font-display), monospace";
      ctx.fillText("SPATIAL FOCUS: CYCLONE CORE", reticleX + pulseRadius + 7, reticleY - 3);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText("SIMULATED REGION", reticleX + pulseRadius + 7, reticleY + 7);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ROWS = 11;
    const COLS = 18;
    const cellW = (rect.width - 25) / COLS;
    const cellH = (rect.height - 30) / ROWS;

    const colIdx = Math.floor((x - 10) / cellW);
    const rowIdx = Math.floor((y - 15) / cellH);

    if (colIdx >= 0 && colIdx < COLS && rowIdx >= 0 && rowIdx < ROWS) {
      const cd = Math.sqrt((colIdx - 13.0) ** 2 + (rowIdx - 7.0) ** 2);
      const cl = Math.min(
        Math.sqrt((colIdx - 2) ** 2 + (rowIdx - 2) ** 2),
        Math.sqrt((colIdx - 6) ** 2 + (rowIdx - 1) ** 2),
        Math.sqrt((colIdx - 1) ** 2 + (rowIdx - 5) ** 2)
      );
      const val = Math.max(0, Math.min(1, 0.82 * Math.exp(-cd * 0.42) + 0.5 * Math.exp(-cl * 0.52)));
      
      setHoveredCell({ col: colIdx, row: rowIdx, val });
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseLeave = () => setHoveredCell(null);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: "100%",
          height: 240,
          display: "block",
          background: "rgba(0,0,0,0.22)",
          borderRadius: 8,
          border: "1px solid rgba(0, 220, 255, 0.08)",
          cursor: "crosshair"
        }}
      />
      {hoveredCell && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            background: "rgba(4, 8, 17, 0.92)",
            border: "1px solid rgba(0, 220, 255, 0.35)",
            borderRadius: 4,
            padding: "6px 10px",
            fontFamily: "var(--font-display), monospace",
            fontSize: 9,
            color: "white",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            boxShadow: "0 0 10px rgba(0, 220, 255, 0.15)",
            pointerEvents: "none"
          }}
        >
          <div style={{ color: "#00E5FF", fontWeight: "bold" }}>GRID INDEX: {String.fromCharCode(65 + hoveredCell.col)}{hoveredCell.row + 1}</div>
          <div>SIMULATED WEIGHT: {hoveredCell.val.toFixed(4)} (Illustrative — not model output)</div>
        </div>
      )}
    </div>
  );
}

// Feature Importance Item with Qualitative States
function FeatureImportanceItem({ label, state, badge, color }: { label: string; state: string; badge: string; color: string }) {
  return (
    <div style={{ background: "rgba(4, 8, 17, 0.5)", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 11.5, color: "white", fontWeight: 700, fontFamily: "var(--font-sans)" }}>{label}</span>
        <span style={{ fontSize: 8.5, padding: "2px 6px", borderRadius: 3, background: `${color}15`, color, border: `1px solid ${color}35`, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
          {badge}
        </span>
      </div>
      <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
        Role: <span style={{ color }}>{state}</span>
      </div>
    </div>
  );
}

// Customized Proposed Neural Network Architecture
function ProposedArchitectureVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const layerSizes = [4, 5, 5, 2];
    const nodes: { x: number; y: number; layer: number; label: string }[] = [];
    const connections: { from: number; to: number; weight: number }[] = [];

    const padX = 55;
    const padY = 32;
    const width = canvas.width = 460;
    const height = canvas.height = 220;

    const layerLabels = ["INPUT FRAMES", "MOTION ESTIMATION", "ATTENTION / FEATURE FUSION", "OUTPUT"];
    const inputLabels = ["F_t0", "F_t1", "Flow_Vectors", "IR_Channel"];
    const hidden1Labels = ["Motion_0", "Motion_1", "Motion_2", "Motion_3", "Motion_4"];
    const hidden2Labels = ["Fuse_0", "Fuse_1", "Fuse_2", "Fuse_3", "Fuse_4"];
    const outputLabels = ["F_synth", "Val_Gate"];

    layerSizes.forEach((size, layerIdx) => {
      const x = padX + (layerIdx / (layerSizes.length - 1)) * (width - padX * 2);
      for (let i = 0; i < size; i++) {
        const y = padY + (i / (size - 1 || 1)) * (height - padY * 2 - 10) + (size === 2 ? 15 : 0) + (size === 4 ? 6 : 0);
        let label = "";
        if (layerIdx === 0) label = inputLabels[i];
        else if (layerIdx === 1) label = hidden1Labels[i];
        else if (layerIdx === 2) label = hidden2Labels[i];
        else if (layerIdx === 3) label = outputLabels[i];

        nodes.push({ x, y, layer: layerIdx, label });
      }
    });

    nodes.forEach((nodeA, idxA) => {
      nodes.forEach((nodeB, idxB) => {
        if (nodeB.layer === nodeA.layer + 1) {
          connections.push({ from: idxA, to: idxB, weight: 0.5 });
        }
      });
    });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let layerIdx = 0; layerIdx < layerSizes.length; layerIdx++) {
        const x = padX + (layerIdx / (layerSizes.length - 1)) * (width - padX * 2);
        
        ctx.fillStyle = "rgba(12, 20, 35, 0.4)";
        ctx.strokeStyle = "rgba(0, 220, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(x - 22, 24, 44, height - 36);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
        ctx.font = "7.5px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(layerLabels[layerIdx], x, 16);
      }

      connections.forEach((conn) => {
        const nodeA = nodes[conn.from];
        const nodeB = nodes[conn.to];
        ctx.strokeStyle = "rgba(123, 97, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.stroke();
      });

      nodes.forEach((node) => {
        let nodeColor = "123, 97, 255";
        if (node.layer === 0) nodeColor = "0, 229, 255";
        else if (node.layer === layerSizes.length - 1) nodeColor = "0, 245, 147";

        ctx.fillStyle = `rgba(${nodeColor}, 0.8)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "8px 'JetBrains Mono', monospace";
        ctx.textAlign = node.layer === 0 ? "right" : (node.layer === layerSizes.length - 1 ? "left" : "center");
        const labelX = node.layer === 0 ? node.x - 10 : (node.layer === layerSizes.length - 1 ? node.x + 10 : node.x);
        const labelY = node.layer === 0 || node.layer === layerSizes.length - 1 ? node.y + 3 : node.y - 10;
        ctx.fillText(node.label, labelX, labelY);
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 220,
          display: "block",
          background: "rgba(0,0,0,0.22)",
          borderRadius: 8,
          border: "1px solid rgba(123, 97, 255, 0.12)"
        }}
      />
      <div style={{ fontSize: 9.5, color: "#FFB800", fontFamily: "'JetBrains Mono', monospace", textAlign: "center", background: "rgba(255, 184, 0, 0.05)", padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255, 184, 0, 0.2)" }}>
        Architecture shown for prototype demonstration. Model inference backend is not connected.
      </div>
    </div>
  );
}

// 7-step Reasoning Pipeline Flowchart
function ReasoningPipeline() {
  const steps = [
    { num: "01", name: "Input Frames", desc: "Loads temporal bounds F_t0 and F_t1.", status: "LOADED", badge: "REAL DATA", color: "#00F593" },
    { num: "02", name: "Motion Estimation", desc: "Estimates optical flow spin vectors.", status: "CALCULATED", badge: "DERIVED", color: "#00E5FF" },
    { num: "03", name: "Feature Fusion", desc: "Prioritizes cyclone core regions.", status: "PROTOTYPE", badge: "PROTOTYPE", color: "#7B61FF" },
    { num: "04", name: "Temporal Decoder", desc: "Feature map warping flow fields.", status: "COMING NEXT", badge: "FUTURE", color: "#FFB800" },
    { num: "05", name: "Frame Generation", desc: "Synthesizes pixel interpolation at t_mid.", status: "PROTOTYPE", badge: "PROTOTYPE", color: "#7B61FF" },
    { num: "06", name: "Validation", desc: "Structural similarity checks vs ground truth.", status: "COMING NEXT", badge: "FUTURE", color: "#FFB800" },
    { num: "07", name: "Output", desc: "Exposes synthesized frames to dashboard.", status: "PROTOTYPE", badge: "PROTOTYPE", color: "#00F593" }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
      {steps.map((step) => (
        <div
          key={step.num}
          className="glass-card"
          style={{
            padding: "10px 8px",
            border: "1px solid rgba(0, 220, 255, 0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            minHeight: 140
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 900, color: step.color, fontFamily: "'JetBrains Mono', monospace" }}>
            {step.num}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "white", fontFamily: "var(--font-heading)" }}>
            {step.name}
          </div>
          <div style={{ fontSize: 8.5, color: "#94A3B8", lineHeight: 1.3, flex: 1 }}>
            {step.desc}
          </div>
          <div 
            style={{ 
              fontSize: 7.5, 
              fontWeight: 800, 
              fontFamily: "'JetBrains Mono', monospace",
              padding: "2px 4px",
              borderRadius: 3,
              background: `${step.color}15`,
              color: step.color,
              border: `1px solid ${step.color}35`,
              textAlign: "center"
            }}
          >
            {step.status}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function XAIScreen({ onNavigate }: XAIScreenProps) {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* ─── Page-Level Header & Status ─── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>
            Explainable AI — Conceptual Reasoning & Pipeline Architecture
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            Data-grounded visualization of the proposed temporal interpolation reasoning pipeline.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(123, 97, 255, 0.12)", border: "1px solid rgba(123, 97, 255, 0.35)", color: "#7B61FF", fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
            <Brain size={15} /> EXPLAINABILITY MODE: PROTOTYPE
          </div>

          <button
            onClick={() => onNavigate && onNavigate("dashboard")}
            style={{
              background: "rgba(0, 245, 147, 0.12)",
              border: "1px solid rgba(0, 245, 147, 0.35)",
              borderRadius: 8,
              color: "#00F593",
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
            BACK TO MISSION OVERVIEW <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ─── Traceability & Explainability Evidence Panel ─── */}
      <div className="glass-panel" style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
            <Database size={15} color="#00E5FF" />
            EXPLAINABILITY EVIDENCE & DATA PROVENANCE
          </div>
          <span style={{ fontSize: 8.5, padding: "2px 6px", borderRadius: 3, background: "rgba(0, 245, 147, 0.1)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            REAL DATA TRACEABILITY
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(0, 229, 255, 0.1)" }}>
            <div style={{ color: "#64748B", fontSize: 8.5, marginBottom: 2 }}>REAL INPUT</div>
            <div style={{ color: "#00F593", fontWeight: 800 }}>INSAT-3D IR (10.8 µm)</div>
          </div>
          <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(0, 229, 255, 0.1)" }}>
            <div style={{ color: "#64748B", fontSize: 8.5, marginBottom: 2 }}>REFERENCE DATA</div>
            <div style={{ color: "#00F593", fontWeight: 800 }}>NOAA IBTrACS Track</div>
          </div>
          <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(0, 229, 255, 0.1)" }}>
            <div style={{ color: "#64748B", fontSize: 8.5, marginBottom: 2 }}>EVENT WINDOW</div>
            <div style={{ color: "white", fontWeight: 800 }}>Nov 30 – Dec 06, 2023</div>
          </div>
          <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(0, 229, 255, 0.1)" }}>
            <div style={{ color: "#64748B", fontSize: 8.5, marginBottom: 2 }}>MOTION FIELD</div>
            <div style={{ color: "#00E5FF", fontWeight: 800 }}>Optical Flow Prototype</div>
          </div>
          <div style={{ background: "rgba(4, 8, 17, 0.6)", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(0, 229, 255, 0.1)" }}>
            <div style={{ color: "#64748B", fontSize: 8.5, marginBottom: 2 }}>MODEL STATUS</div>
            <div style={{ color: "#FFB800", fontWeight: 800 }}>PROTOTYPE / NOT CONNECTED</div>
          </div>
        </div>
      </div>

      {/* ─── Main Split: Prototype Attention Map & Feature Importance ─── */}
      <div className="xai-grid-split" style={{ gap: 18 }}>
        
        {/* Panel 1: Prototype Attention Map */}
        <div className="glass-panel" style={{ padding: 20, border: "1px solid rgba(0, 229, 255, 0.18)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 800, color: "white" }}>
              Prototype Attention Map
            </div>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "rgba(0, 229, 255, 0.12)", color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              PROTOTYPE VISUALIZATION
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#94A3B8", marginBottom: 14 }}>
            Illustrative visualization of where a future temporal-interpolation model could focus. No trained-model attention weights are being claimed.
          </div>
          
          <AttentionHeatmap />

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 9, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>MIN_ATTN</span>
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: "linear-gradient(90deg,rgba(0,229,255,0.4),rgba(255,184,0,0.6),rgba(255,77,109,0.85))" }} />
            <span style={{ fontSize: 9, color: "#64748B", fontFamily: "'JetBrains Mono', monospace" }}>MAX_ATTN</span>
          </div>

          {/* Peak Focus Message */}
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,77,109,0.06)", borderRadius: 8, border: "1px solid rgba(255,77,109,0.25)" }}>
            <div style={{ fontSize: 11.5, color: "#FF4D6D", fontWeight: 800, marginBottom: 3, display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-heading)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF4D6D", animation: "pulse-dot 1.5s infinite" }} />
              CYCLONE CORE REGION HIGHLIGHTED
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#94A3B8", lineHeight: 1.4 }}>
              The prototype emphasizes the cyclone core and surrounding cloud structure as regions of interest for future temporal-motion modeling.
            </div>
          </div>
        </div>

        {/* Panel 2: Feature Importance — Prototype */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 800, color: "white" }}>
              Feature Importance — Prototype
            </div>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "rgba(123, 97, 255, 0.12)", color: "#7B61FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              CONCEPTUAL ROLES
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#94A3B8", marginBottom: 16 }}>
            Conceptual inputs for future model feature attribution
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FeatureImportanceItem label="Cloud Motion Continuity — Prototype" state="PRIMARY INPUT" badge="OBSERVED / DATASET" color="#00E5FF" />
            <FeatureImportanceItem label="Cyclone Trajectory Context — Prototype" state="SUPPORTING INPUT" badge="NOAA IBTrACS" color="#7B61FF" />
            <FeatureImportanceItem label="Temporal Coherence — Prototype" state="DERIVED INPUT" badge="DERIVED" color="#00F593" />
            <FeatureImportanceItem label="Spatial Structure — Prototype" state="PRIMARY INPUT" badge="INSAT-3D IR" color="#00E5FF" />
            <FeatureImportanceItem label="Optical Flow — Prototype" state="FUTURE MODEL FEATURE" badge="PROTOTYPE" color="#FFB800" />
          </div>
        </div>

      </div>

      {/* ─── Proposed Neural Network Architecture & Reasoning Pipeline ─── */}
      <div className="xai-grid-asymmetric" style={{ gap: 16 }}>
        
        {/* Proposed Architecture */}
        <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 800, color: "white" }}>
              TEMPORAL MODEL ARCHITECTURE — PROPOSED
            </div>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "rgba(123, 97, 255, 0.15)", color: "#7B61FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              PROPOSED ARCHITECTURE
            </span>
          </div>
          <ProposedArchitectureVisualizer />
        </div>

        {/* Interpolation Reasoning Pipeline */}
        <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 800, color: "white" }}>
              Interpolation Reasoning Pipeline
            </div>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "rgba(255, 184, 0, 0.12)", color: "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              PIPELINE STAGE STATUS
            </span>
          </div>
          <ReasoningPipeline />
        </div>

      </div>

    </div>
  );
}
