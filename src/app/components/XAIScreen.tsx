import React, { useEffect, useRef, useState } from "react";
import { Brain } from "lucide-react";

// Interactive Canvas-based Attention Heatmap with Drift and Flow Animations
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

    // Define attention flow particles drifting from low-focus to high-focus grid locations
    const targetX = 13.0;
    const targetY = 7.0;
    const particles: { x: number; speed: number; alpha: number; pathIdx: number }[] = [];

    // Predefined curved paths converging at (13, 7) - Cyclone Michaung center
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
        x: 0, // progress along the path from 0 to 1
        speed: 0.004 + Math.random() * 0.006,
        alpha: 0.3 + Math.random() * 0.5,
        pathIdx
      });
    };

    // Populate initial particles at various starting positions
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

      // Pulse and drift cyclone center slightly to simulate active satellite tracking
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
          // Add dynamic wave ripple/flutter to the cells
          const val = Math.max(0, Math.min(1, baseVal + Math.sin(t * 2.5 + c * 0.7 + r * 0.4) * 0.03));

          const x = 10 + c * cellW;
          const y = 15 + r * cellH;

          // Color system based on attention level (Cyan -> Yellow -> Red)
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

      // 3. Draw Attention Flow curves and flowing signal particles
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
        
        // Bezier interpolation
        const gridX = mt*mt*mt * path.startX + 3*mt*mt*tVal * path.cp1X + 3*mt*tVal*tVal * path.cp2X + tVal*tVal*tVal * cyX;
        const gridY = mt*mt*mt * path.startY + 3*mt*mt*tVal * path.cp1Y + 3*mt*tVal*tVal * path.cp2Y + tVal*tVal*tVal * cyY;

        const pxX = 10 + gridX * cellW + cellW / 2;
        const pxY = 15 + gridY * cellH + cellH / 2;

        // Trace flow path lines
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

        // Draw flowing signal dots
        ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha * (1 - p.x) * 0.9})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#00E5FF";
        ctx.beginPath();
        ctx.arc(pxX, pxY, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Maintain particle density
      while (particles.length < 12) {
        spawnParticle();
      }

      // 4. Draw Cyclone Attention Target Lock Reticle
      const reticleX = 10 + cyX * cellW + cellW / 2;
      const reticleY = 15 + cyY * cellH + cellH / 2;
      const pulseRadius = 14 + Math.sin(t * 4.5) * 3.5;

      ctx.strokeStyle = "rgba(255, 77, 109, 0.65)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(reticleX, reticleY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = "rgba(255, 77, 109, 0.25)";
      ctx.beginPath();
      ctx.arc(reticleX, reticleY, pulseRadius + 6, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.strokeStyle = "rgba(255, 77, 109, 0.85)";
      ctx.lineWidth = 1.2;
      const bracket = 5;
      
      // Top Left Corner Bracket
      ctx.beginPath();
      ctx.moveTo(reticleX - pulseRadius, reticleY - pulseRadius + bracket);
      ctx.lineTo(reticleX - pulseRadius, reticleY - pulseRadius);
      ctx.lineTo(reticleX - pulseRadius + bracket, reticleY - pulseRadius);
      ctx.stroke();

      // Top Right Corner Bracket
      ctx.beginPath();
      ctx.moveTo(reticleX + pulseRadius, reticleY - pulseRadius + bracket);
      ctx.lineTo(reticleX + pulseRadius, reticleY - pulseRadius);
      ctx.lineTo(reticleX + pulseRadius - bracket, reticleY - pulseRadius);
      ctx.stroke();

      // Bottom Left Corner Bracket
      ctx.beginPath();
      ctx.moveTo(reticleX - pulseRadius, reticleY + pulseRadius - bracket);
      ctx.lineTo(reticleX - pulseRadius, reticleY + pulseRadius);
      ctx.lineTo(reticleX - pulseRadius + bracket, reticleY + pulseRadius);
      ctx.stroke();

      // Bottom Right Corner Bracket
      ctx.beginPath();
      ctx.moveTo(reticleX + pulseRadius, reticleY + pulseRadius - bracket);
      ctx.lineTo(reticleX + pulseRadius, reticleY + pulseRadius);
      ctx.lineTo(reticleX + pulseRadius - bracket, reticleY + pulseRadius);
      ctx.stroke();

      // Reticle lock labels
      ctx.fillStyle = "#FF4D6D";
      ctx.font = "8px var(--font-display), monospace";
      ctx.fillText("ATTN LOCK: ACTIVE", reticleX + pulseRadius + 7, reticleY - 3);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText(`${(82.4 + Math.sin(t * 3.5) * 2.1).toFixed(1)}% FOCUS`, reticleX + pulseRadius + 7, reticleY + 7);

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
      
      setHoveredCell({
        col: colIdx,
        row: rowIdx,
        val
      });
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

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
          <div>ATTN_WT: {hoveredCell.val.toFixed(4)}</div>
          <div>CYC_DIST: {Math.sqrt((hoveredCell.col - 13) ** 2 + (hoveredCell.row - 7) ** 2).toFixed(2)}px</div>
        </div>
      )}
    </div>
  );
}

// Feature weight item with floating values to simulate active calculations
function FeatureWeightItem({ label, baseValue, color }: { label: string; baseValue: number; color: string }) {
  const [value, setValue] = useState(baseValue);

  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now() * 0.0025;
      const flutter = Math.sin(time + baseValue) * 0.85 + (Math.random() - 0.5) * 0.3;
      setValue(Math.min(100, Math.max(0, baseValue + flutter)));
    }, 100);

    return () => clearInterval(interval);
  }, [baseValue]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11.5, color: "#94A3B8", fontWeight: 500, fontFamily: "var(--font-sans)" }}>{label}</span>
        <span style={{ fontSize: 11.5, color, fontWeight: 800, fontFamily: "var(--font-display), monospace" }}>
          {value.toFixed(2)}%
        </span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, position: "relative" }}>
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}bb, ${color})`,
            borderRadius: 3,
            boxShadow: `0 0 8px ${color}30`,
            transition: "width 0.12s linear"
          }}
        />
      </div>
    </div>
  );
}

// Customized frame interpolation Neural Network canvas
function NeuralNetworkVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const layerSizes = [4, 5, 5, 2];
    const nodes: { x: number; y: number; layer: number; label: string; glow: number; basePulse: number }[] = [];
    const connections: { from: number; to: number; weight: number }[] = [];
    const signals: { fromIdx: number; toIdx: number; progress: number; speed: number; color: string }[] = [];

    const padX = 55;
    const padY = 32;
    const width = canvas.width = 460;
    const height = canvas.height = 220;

    const layerLabels = ["INPUT", "ENCODER", "DECODER", "OUTPUT"];
    const inputLabels = ["F_t0", "F_t1", "Motion_Flow", "Attn_Mask"];
    const hidden1Labels = ["Enc_0", "Enc_1", "Enc_2", "Enc_3", "Enc_4"];
    const hidden2Labels = ["Dec_0", "Dec_1", "Dec_2", "Dec_3", "Dec_4"];
    const outputLabels = ["F_synth", "Val_Gate"];

    // Generate Nodes
    layerSizes.forEach((size, layerIdx) => {
      const x = padX + (layerIdx / (layerSizes.length - 1)) * (width - padX * 2);
      for (let i = 0; i < size; i++) {
        const y = padY + (i / (size - 1 || 1)) * (height - padY * 2 - 10) + (size === 2 ? 15 : 0) + (size === 4 ? 6 : 0);
        let label = "";
        if (layerIdx === 0) label = inputLabels[i];
        else if (layerIdx === 1) label = hidden1Labels[i];
        else if (layerIdx === 2) label = hidden2Labels[i];
        else if (layerIdx === 3) label = outputLabels[i];

        nodes.push({ x, y, layer: layerIdx, label, glow: 0, basePulse: Math.random() * Math.PI });
      }
    });

    // Generate connections between adjacent layers
    nodes.forEach((nodeA, idxA) => {
      nodes.forEach((nodeB, idxB) => {
        if (nodeB.layer === nodeA.layer + 1) {
          connections.push({
            from: idxA,
            to: idxB,
            weight: Math.random() * 0.8 + 0.2
          });
        }
      });
    });

    const spawnSignal = () => {
      const layer0Nodes = nodes.filter(n => n.layer === 0);
      if (layer0Nodes.length === 0) return;
      const startNode = layer0Nodes[Math.floor(Math.random() * layer0Nodes.length)];
      const startIdx = nodes.indexOf(startNode);

      const matchingConns = connections.filter(c => c.from === startIdx);
      if (matchingConns.length > 0) {
        const conn = matchingConns[Math.floor(Math.random() * matchingConns.length)];
        signals.push({
          fromIdx: conn.from,
          toIdx: conn.to,
          progress: 0,
          speed: 0.015 + Math.random() * 0.015,
          color: "rgba(0, 229, 255, 0.8)"
        });
      }
    };

    // Prepopulate signals
    for (let i = 0; i < 5; i++) {
      spawnSignal();
      signals[i].progress = Math.random();
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const time = Date.now() * 0.001;

      // 1. Draw layer background columns/bands
      for (let layerIdx = 0; layerIdx < layerSizes.length; layerIdx++) {
        const x = padX + (layerIdx / (layerSizes.length - 1)) * (width - padX * 2);
        
        ctx.fillStyle = "rgba(12, 20, 35, 0.4)";
        ctx.strokeStyle = "rgba(0, 220, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(x - 22, 24, 44, height - 36);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgba(148, 163, 184, 0.45)";
        ctx.font = "8px var(--font-display), monospace";
        ctx.textAlign = "center";
        ctx.fillText(layerLabels[layerIdx], x, 16);
      }

      // 2. Draw connections (synapses) with animated sliding dashes
      connections.forEach((conn) => {
        const nodeA = nodes[conn.from];
        const nodeB = nodes[conn.to];
        
        ctx.strokeStyle = `rgba(123, 97, 255, ${conn.weight * 0.12})`;
        ctx.lineWidth = conn.weight * 1.5;
        
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -time * 12 * conn.weight;
        
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.stroke();
        ctx.setLineDash([]); // reset
      });

      // 3. Update and Draw Signals
      if (Math.random() < 0.12 && signals.length < 15) {
        spawnSignal();
      }

      for (let i = signals.length - 1; i >= 0; i--) {
        const sig = signals[i];
        sig.progress += sig.speed;

        const nodeA = nodes[sig.fromIdx];
        const nodeB = nodes[sig.toIdx];

        const sx = nodeA.x + (nodeB.x - nodeA.x) * sig.progress;
        const sy = nodeA.y + (nodeB.y - nodeA.y) * sig.progress;

        ctx.fillStyle = sig.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "#00e5ff";
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (sig.progress >= 1.0) {
          nodeB.glow = 1.0;

          if (nodeB.layer < layerSizes.length - 1) {
            const nextConns = connections.filter(c => c.from === sig.toIdx);
            if (nextConns.length > 0) {
              const conn = nextConns[Math.floor(Math.random() * nextConns.length)];
              signals.push({
                fromIdx: conn.from,
                toIdx: conn.to,
                progress: 0,
                speed: 0.015 + Math.random() * 0.015,
                color: "rgba(123, 97, 255, 0.8)"
              });
            }
          }
          signals.splice(i, 1);
        }
      }

      // 4. Draw Nodes with soft bloom and slight pulsing sizing
      nodes.forEach((node) => {
        if (node.glow > 0) node.glow -= 0.035;

        let nodeColor = "123, 97, 255"; // Hidden (purple)
        if (node.layer === 0) {
          nodeColor = "0, 229, 255"; // Input (cyan)
        } else if (node.layer === layerSizes.length - 1) {
          nodeColor = node.label === "F_synth" ? "0, 245, 147" : "255, 77, 109"; // Output (green / red)
        }

        const pulse = 1 + Math.sin(time * 3 + node.basePulse) * 0.12;
        const radius = (node.layer === 0 || node.layer === layerSizes.length - 1 ? 4.5 : 3.5) * pulse;

        ctx.strokeStyle = `rgba(${nodeColor}, ${0.12 + node.glow * 0.72})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4 + node.glow * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(${nodeColor}, 1.0)`;
        ctx.shadowBlur = node.glow > 0 ? 8 : 0;
        ctx.shadowColor = `rgb(${nodeColor})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = node.layer === 0 || node.layer === layerSizes.length - 1 ? "rgba(255, 255, 255, 0.8)" : "rgba(148, 163, 184, 0.6)";
        ctx.font = "8px var(--font-display), monospace";
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
  );
}

// Animated 7-step Reasoning Pipeline Flowchart with cycling step highlights
function ReasoningPipeline() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      num: "01",
      name: "Input Frames",
      desc: "Loads temporal bounds F_t0 and F_t1 boundary sensors.",
      color: "#00E5FF",
      badge: "LOADED"
    },
    {
      id: 1,
      num: "02",
      name: "Motion Estimation",
      desc: "Computes dense optical flow tracking spin vectors.",
      color: "#7B61FF",
      badge: "CALCULATED"
    },
    {
      id: 2,
      num: "03",
      name: "Attention",
      desc: "Prioritizes cloud centers and vortex gradients.",
      color: "#FFB800",
      badge: "MAPPED"
    },
    {
      id: 3,
      num: "04",
      name: "Decoder",
      desc: "Warps feature maps along flow fields using UNet gates.",
      color: "#7B61FF",
      badge: "SYNTHESIZED"
    },
    {
      id: 4,
      num: "05",
      name: "Frame Gen",
      desc: "Blends pixels at t_mid resolving occlusion masks.",
      color: "#00E5FF",
      badge: "RENDERED"
    },
    {
      id: 5,
      num: "06",
      name: "Validation",
      desc: "Checks structural similarity (SSIM) vs 0.90 threshold.",
      color: "#FF4D6D",
      badge: "VERIFIED"
    },
    {
      id: 6,
      num: "07",
      name: "Output",
      desc: "Publishes final interpolated frames to satellite grid.",
      color: "#00F593",
      badge: "EXPOSED"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      
      {/* 1. Animated SVG Flow Diagram */}
      <div 
        style={{ 
          background: "rgba(0,0,0,0.15)", 
          borderRadius: 8, 
          padding: "10px 20px", 
          border: "1px solid rgba(255,255,255,0.03)",
          position: "relative"
        }}
      >
        <svg width="100%" height="45" viewBox="0 0 700 45" preserveAspectRatio="none" style={{ display: "block" }}>
          <defs>
            <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7B61FF" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00F593" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Path Line */}
          <line x1="30" y1="22" x2="670" y2="22" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="3" />
          
          {/* Animated data flow dashed line (up to active step) */}
          <line 
            x1="30" 
            y1="22" 
            x2={30 + (activeStep / 6) * 640} 
            y2="22" 
            stroke="url(#activeGrad)" 
            strokeWidth="3" 
            strokeDasharray="5,5"
            style={{ animation: "flow-dash 1.2s linear infinite" }}
          />

          {/* Flow nodes */}
          {steps.map((step, idx) => {
            const cx = 30 + idx * (640 / 6);
            const isActive = idx === activeStep;
            const isCompleted = idx < activeStep;
            
            let nodeColor = "rgba(255, 255, 255, 0.12)";
            if (isActive) nodeColor = step.color;
            else if (isCompleted) nodeColor = "#00F593";

            return (
              <g key={step.id}>
                {/* Pulsing glow circle for active step */}
                {isActive && (
                  <circle 
                    cx={cx} 
                    cy="22" 
                    r="9" 
                    fill="none" 
                    stroke={step.color} 
                    strokeWidth="2" 
                    filter="url(#glow)" 
                    style={{ animation: "pulse-node 1.5s ease-in-out infinite" }}
                  />
                )}

                {/* Main Node Circle */}
                <circle 
                  cx={cx} 
                  cy="22" 
                  r={isActive ? "6" : "4.5"} 
                  fill={isCompleted || isActive ? nodeColor : "rgba(8, 17, 31, 0.9)"} 
                  stroke={nodeColor} 
                  strokeWidth="1.5" 
                />

                {/* Node Label Text */}
                <text 
                  x={cx} 
                  y="38" 
                  fill={isActive ? "white" : "rgba(148, 163, 184, 0.4)"} 
                  fontSize="7.5" 
                  fontFamily="var(--font-display), monospace" 
                  textAnchor="middle"
                  fontWeight={isActive ? "bold" : "normal"}
                >
                  {step.name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes flow-dash {
            to { stroke-dashoffset: -20; }
          }
          @keyframes pulse-node {
            0% { transform: scale(0.9) translate(0px, 0px); opacity: 0.8; }
            50% { transform: scale(1.4) translate(-3px, -3px); opacity: 0.3; transform-origin: center; }
            100% { transform: scale(0.9) translate(0px, 0px); opacity: 0.8; }
          }
        `}} />
      </div>

      {/* 2. Horizontal Detail Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {steps.map((step) => {
          const isActive = step.id === activeStep;
          const isCompleted = step.id < activeStep;
          
          let cardBorder = "1px solid rgba(0, 220, 255, 0.08)";
          let cardShadow = "none";
          let opacityValue = 0.55;
          let activeGlowStyle: React.CSSProperties = {};

          if (isActive) {
            cardBorder = `1px solid ${step.color}`;
            cardShadow = `0 0 14px ${step.color}25`;
            opacityValue = 1.0;
            activeGlowStyle = {
              background: `linear-gradient(180deg, rgba(12, 20, 35, 0.85) 0%, ${step.color}0d 100%)`
            };
          } else if (isCompleted) {
            opacityValue = 0.85;
          }

          return (
            <div
              key={step.id}
              className="glass-card"
              style={{
                padding: "10px 8px",
                border: cardBorder,
                boxShadow: cardShadow,
                opacity: opacityValue,
                display: "flex",
                flexDirection: "column",
                gap: 5,
                minHeight: 130,
                position: "relative",
                overflow: "hidden",
                ...activeGlowStyle
              }}
            >
              {/* Top border accent on active steps */}
              {isActive && (
                <div 
                  style={{ 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    width: "100%", 
                    height: 2, 
                    background: step.color 
                  }} 
                />
              )}

              {/* Step Index Label */}
              <div 
                style={{ 
                  fontSize: 16, 
                  fontWeight: 950, 
                  color: step.color, 
                  fontFamily: "var(--font-display), monospace", 
                  opacity: isActive ? 0.65 : 0.25 
                }}
              >
                {step.num}
              </div>

              {/* Title */}
              <div 
                style={{ 
                  fontSize: 11, 
                  fontWeight: 700, 
                  color: "white", 
                  fontFamily: "var(--font-heading)" 
                }}
              >
                {step.name}
              </div>

              {/* Description */}
              <div 
                style={{ 
                  fontSize: 8.5, 
                  color: isActive ? "#94A3B8" : "#64748B", 
                  lineHeight: 1.3, 
                  fontFamily: "var(--font-sans)",
                  flex: 1
                }}
              >
                {step.desc}
              </div>

              {/* Dynamic status indicators */}
              <div 
                style={{ 
                  fontSize: 7.5, 
                  fontWeight: 800, 
                  fontFamily: "var(--font-display), monospace",
                  alignSelf: "flex-start",
                  padding: "1px 4px",
                  borderRadius: 3,
                  marginTop: 2,
                  background: isActive 
                    ? `${step.color}18` 
                    : (isCompleted ? "rgba(0, 245, 147, 0.08)" : "rgba(255,255,255,0.02)"),
                  color: isActive 
                    ? step.color 
                    : (isCompleted ? "#00F593" : "#64748B"),
                  border: isActive
                    ? `1px solid ${step.color}35`
                    : (isCompleted ? "1px solid rgba(0, 245, 147, 0.15)" : "1px solid rgba(255,255,255,0.04)")
                }}
              >
                {isActive ? "ACTIVE" : (isCompleted ? `OK: ${step.badge}` : "QUEUED")}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

export default function XAIScreen() {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>Explainable AI</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#94A3B8", marginTop: 4 }}>Visual telemetry demonstrating neural network attention focus and reasoning chains</div>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "5px 12px", borderRadius: 8, background: "rgba(123, 97, 255, 0.08)", border: "1px solid rgba(123, 97, 255, 0.22)", color: "#7B61FF", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
          <Brain size={14} /> EXPLAINABILITY_GATE: ACTIVE
        </div>
      </div>

      {/* Main split: Heatmap and Feature Importance */}
      <div className="xai-grid-split" style={{ gap: 18 }}>
        
        {/* Attention Heatmap Panel */}
        <div className="glass-panel" style={{ padding: 20, border: "1px solid rgba(0, 229, 255, 0.18)" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "white", marginBottom: 3 }}>Attention Heatmap</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#94A3B8", marginBottom: 18 }}>Pixel attention weights during frame interpolation synthesis</div>
          
          <AttentionHeatmap />

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 9.5, color: "#64748B", fontFamily: "var(--font-display), monospace" }}>MIN_ATTN</span>
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: "linear-gradient(90deg,rgba(0,229,255,0.4),rgba(255,184,0,0.6),rgba(255,77,109,0.85))" }} />
            <span style={{ fontSize: 9.5, color: "#64748B", fontFamily: "var(--font-display), monospace" }}>MAX_ATTN</span>
          </div>

          {/* Attention details */}
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,77,109,0.06)", borderRadius: 8, border: "1px solid rgba(255,77,109,0.22)" }}>
            <div style={{ fontSize: 11.5, color: "#FF4D6D", fontWeight: 700, marginBottom: 3, display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-heading)" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF4D6D", animation: "pulse-dot 1.5s infinite" }} />
              PEAK FOCUS REGION DETECTED: CYCLONE MICHAUNG
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#94A3B8", lineHeight: 1.4 }}>
              Synthesis core prioritized cyclone vortex kinematics (61% attention) and trailing clouds (28% attention) to enforce rotational motion coherence.
            </div>
          </div>
        </div>

        {/* Feature Importance Panel */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "white", marginBottom: 3 }}>Feature Weight Matrix</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "#94A3B8", marginBottom: 18 }}>Quantitative weight assigned to inputs in TemporalNet decoder layers</div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FeatureWeightItem label="Cloud Motion Continuity" baseValue={94} color="#00E5FF" />
            <FeatureWeightItem label="Cyclone Trajectory Model" baseValue={88} color="#7B61FF" />
            <FeatureWeightItem label="Temporal Coherence Loss" baseValue={82} color="#00E5FF" />
            <FeatureWeightItem label="Feature Attention Map" baseValue={76} color="#FFB800" />
            <FeatureWeightItem label="Optical Flow Estimation" baseValue={71} color="#7B61FF" />
          </div>
        </div>

      </div>

      {/* Neural Network & Pipeline row */}
      <div className="xai-grid-asymmetric" style={{ gap: 16 }}>
        
        {/* Active Neural Network */}
        <div className="glass-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "white" }}>
            Neural Synapse Telemetry
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <NeuralNetworkVisualizer />
          </div>
        </div>

        {/* Reasoning chain */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "white", marginBottom: 14 }}>
            Interpolation Reasoning Pipeline
          </div>
          <ReasoningPipeline />
        </div>

      </div>

    </div>
  );
}
