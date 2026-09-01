import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Sparkles, Activity, ShieldAlert, Cpu, CheckCircle2, Clock, BarChart3, AlertCircle, Info, Layers, Workflow, ShieldCheck } from "lucide-react";

interface AITemporalEnhancementDemoProps {
  onNavigate?: (navId: string) => void;
}

// Deterministic Canvas Weighted Blend (I_mid = 0.5 * I_A + 0.5 * I_B) for Baseline Temporal Interpolation
function InterpolatedCanvasFrame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isMounted = true;
    const img = new Image();
    img.src = "/IR_Michaung.gif";
    img.onload = () => {
      if (!isMounted || !canvas) return;
      const w = canvas.width = canvas.clientWidth || 260;
      const h = canvas.height = canvas.clientHeight || 140;

      ctx.clearRect(0, 0, w, h);

      // Frame A (base layer)
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, 0, 0, w, h);

      // Frame B (50/50 linear alpha weighted blend I_mid = 0.5*I_A + 0.5*I_B)
      ctx.globalAlpha = 0.5;
      ctx.save();
      ctx.translate(2, 1); // slight spatial displacement representing time step
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();

      // Reset alpha
      ctx.globalAlpha = 1.0;

      // Overlay text label for Baseline Temporal Interpolation
      ctx.fillStyle = "rgba(4, 10, 24, 0.85)";
      ctx.fillRect(6, h - 22, 180, 16);
      ctx.fillStyle = "#00E5FF";
      ctx.font = "8px 'JetBrains Mono', monospace";
      ctx.fillText("SIMULATED FOR DEMONSTRATION (α = 0.5)", 10, h - 11);
    };

    img.onerror = () => {
      if (!isMounted || !canvas || !ctx) return;
      const w = canvas.width = canvas.clientWidth || 260;
      const h = canvas.height = canvas.clientHeight || 140;
      ctx.fillStyle = "rgba(12, 20, 35, 0.9)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#FFB800";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText("Satellite imagery unavailable", 10, h / 2);
    };

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: "100%", height: 140, display: "block", borderRadius: 6, background: "#02040a" }} 
    />
  );
}

export default function AITemporalEnhancementDemo({ onNavigate }: AITemporalEnhancementDemoProps) {
  const [selectedFrame, setSelectedFrame] = useState<"observed1" | "interpolated" | "observed2">("interpolated");

  return (
    <div 
      className="glass-panel-neon"
      style={{
        padding: "22px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* ─── Header Badge Section ─── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#7B61FF,#00E5FF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px rgba(123,97,255,0.3)" }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                AI Temporal Resolution Enhancement — Demonstration
              </span>
              <span style={{
                fontSize: 9,
                color: "#7B61FF",
                background: "rgba(123, 97, 255, 0.12)",
                border: "1px solid rgba(123, 97, 255, 0.3)",
                padding: "2px 7px",
                borderRadius: 4,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                30 min (REAL) → 15 min (INTERPOLATED) → 7.5 min (TARGET RESOLUTION)
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              Current satellite observations are available at a 30-min interval. The proposed system aims to synthesize intermediate frames using motion-aware temporal modeling.
            </p>
          </div>
        </div>

        {/* Model Status Indicator & Navigation CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div 
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              background: "rgba(255, 184, 0, 0.08)",
              border: "1px solid rgba(255, 184, 0, 0.3)",
              color: "#FFB800",
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <AlertCircle size={14} color="#FFB800" />
            MODEL STATUS: DEMO / NOT CONNECTED
          </div>

          <button
            onClick={() => onNavigate && onNavigate("xai")}
            style={{
              background: "rgba(0, 229, 255, 0.15)",
              border: "1px solid rgba(0, 229, 255, 0.4)",
              borderRadius: 6,
              color: "#00E5FF",
              fontSize: 10.5,
              fontWeight: 800,
              padding: "6px 14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            VIEW EXPLAINABILITY <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ─── 3-Panel Temporal Interpolation Comparison ─── */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr auto 1fr",
          gap: 12,
          alignItems: "center"
        }}
      >
        {/* Panel 1: Observed Frame A */}
        <div 
          onClick={() => setSelectedFrame("observed1")}
          style={{
            background: selectedFrame === "observed1" ? "rgba(0, 245, 147, 0.06)" : "rgba(4, 8, 17, 0.5)",
            border: selectedFrame === "observed1" ? "1px solid #00F593" : "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 10,
            padding: 14,
            cursor: "pointer",
            transition: "all 0.25s"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: "#00F593", fontWeight: 800 }}>STEP 01 · OBSERVED INPUT</span>
            <span style={{ color: "#00F593", fontWeight: 700 }}>t = 00 min</span>
          </div>

          <div style={{ width: "100%", height: 140, borderRadius: 6, overflow: "hidden", position: "relative", background: "#02040a" }}>
            <img src="/IR_Michaung.gif" alt="Observed Frame A" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
            <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,245,147,0.85)", padding: "2px 6px", borderRadius: 4, fontSize: 8, color: "#030712", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              REAL OBSERVATION
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: "white", fontWeight: 700, textAlign: "center" }}>
            Observed Frame A (30 min)
          </div>
          <div style={{ fontSize: 9, color: "#94A3B8", textAlign: "center", marginTop: 2 }}>
            Source: INSAT-3D IR 10.8 µm (Dec 2023)
          </div>
        </div>

        {/* Arrow Connector 1 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#7B61FF", gap: 4 }}>
          <ArrowRight size={20} />
          <span style={{ fontSize: 8.5, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>15 MIN INTERPOLATION</span>
        </div>

        {/* Panel 2: PROTOTYPE INTERPOLATED FRAME */}
        <div 
          onClick={() => setSelectedFrame("interpolated")}
          style={{
            background: selectedFrame === "interpolated" ? "rgba(123, 97, 255, 0.1)" : "rgba(4, 8, 17, 0.6)",
            border: selectedFrame === "interpolated" ? "1.5px solid #7B61FF" : "1px solid rgba(123, 97, 255, 0.3)",
            borderRadius: 10,
            padding: 14,
            cursor: "pointer",
            boxShadow: selectedFrame === "interpolated" ? "0 0 20px rgba(123, 97, 255, 0.25)" : "none",
            transition: "all 0.25s",
            position: "relative"
          }}
        >
          <div 
            style={{
              position: "absolute",
              top: -10,
              right: 12,
              background: "#7B61FF",
              color: "white",
              fontSize: 8,
              fontWeight: 800,
              padding: "2px 7px",
              borderRadius: 4,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            SIMULATED FOR DEMONSTRATION
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: "#7B61FF", fontWeight: 800 }}>STEP 02 · INTERPOLATION</span>
            <span style={{ color: "#7B61FF", fontWeight: 800 }}>t = 15 min</span>
          </div>

          <div style={{ width: "100%", height: 140, borderRadius: 6, overflow: "hidden", position: "relative" }}>
            <InterpolatedCanvasFrame />
            <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(123,97,255,0.85)", padding: "2px 6px", borderRadius: 4, fontSize: 8, color: "white", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              INTERPOLATED FRAME (15 min)
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: "#7B61FF", fontWeight: 800, textAlign: "center" }}>
            INTERPOLATED FRAME (15 min)
          </div>
          <div style={{ fontSize: 9, color: "#94A3B8", textAlign: "center", marginTop: 2 }}>
            Simulated Baseline Interpolation Demo
          </div>
        </div>

        {/* Arrow Connector 2 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#00F593", gap: 4 }}>
          <ArrowRight size={20} />
          <span style={{ fontSize: 8.5, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>NEXT OBSERVED</span>
        </div>

        {/* Panel 3: Next Observed Frame B */}
        <div 
          onClick={() => setSelectedFrame("observed2")}
          style={{
            background: selectedFrame === "observed2" ? "rgba(0, 245, 147, 0.06)" : "rgba(4, 8, 17, 0.5)",
            border: selectedFrame === "observed2" ? "1px solid #00F593" : "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 10,
            padding: 14,
            cursor: "pointer",
            transition: "all 0.25s"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: "#00F593", fontWeight: 800 }}>STEP 03 · OBSERVED INPUT</span>
            <span style={{ color: "#00F593", fontWeight: 700 }}>t = 30 min</span>
          </div>

          <div style={{ width: "100%", height: 140, borderRadius: 6, overflow: "hidden", position: "relative", background: "#02040a" }}>
            <img src="/IR_Michaung.gif" alt="Observed Frame B" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
            <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,245,147,0.85)", padding: "2px 6px", borderRadius: 4, fontSize: 8, color: "#030712", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              REAL OBSERVATION
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: "white", fontWeight: 700, textAlign: "center" }}>
            Next Observed Frame B (30 min)
          </div>
          <div style={{ fontSize: 9, color: "#94A3B8", textAlign: "center", marginTop: 2 }}>
            Source: INSAT-3D IR 10.8 µm (Dec 2023)
          </div>
        </div>
      </div>

      {/* ─── Visual Explanation Callout (Requirement 5) ─── */}
      <div 
        style={{
          background: "rgba(123, 97, 255, 0.08)",
          border: "1px solid rgba(123, 97, 255, 0.3)",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}
      >
        <Info size={16} color="#7B61FF" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 10.5, color: "#E2E8F0", fontFamily: "var(--font-sans)", lineHeight: 1.4 }}>
          <strong style={{ color: "#7B61FF" }}>Prototype Interpolation:</strong> Demonstration of the intended temporal reconstruction workflow. Trained model inference is not connected in the current prototype.
        </span>
      </div>

      {/* ─── Technical Pipeline Breakdown ─── */}
      <div style={{ padding: 16, background: "rgba(4, 8, 17, 0.6)", border: "1px solid rgba(0, 229, 255, 0.12)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 11, color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
          <Workflow size={14} color="#00E5FF" />
          TECHNICAL PIPELINE — STAGE EXPOSURE & MODEL ROADMAP
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace" }}>
          {[
            { stage: "OBSERVED INPUT", desc: "INSAT-3D raw frames", status: "REAL DATA", color: "#00F593" },
            { stage: "MOTION ESTIMATION", desc: "Optical flow vectors", status: "PROTOTYPE", color: "#00E5FF" },
            { stage: "TEMPORAL INTERPOLATION", desc: "Baseline frame blend", status: "PROTOTYPE", color: "#7B61FF" },
            { stage: "FRAME GENERATION", desc: "Intermediate synthesis", status: "PLANNED / NEXT PHASE", color: "#FFB800" },
            { stage: "VALIDATION", desc: "SSIM/PSNR comparison", status: "PLANNED / NEXT PHASE", color: "#FFB800" },
          ].map((s) => (
            <div key={s.stage} style={{ background: "rgba(2, 6, 16, 0.7)", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ color: "white", fontWeight: 800, fontSize: 9, marginBottom: 2 }}>{s.stage}</div>
              <div style={{ color: "#94A3B8", fontSize: 8.5, marginBottom: 4 }}>{s.desc}</div>
              <span style={{ fontSize: 7.5, padding: "1px 5px", borderRadius: 3, background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}35`, fontWeight: 800 }}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Research & Validation Strategy Section ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        
        {/* Card 1: Why Temporal Interpolation? */}
        <div style={{ padding: 14, background: "rgba(4, 8, 17, 0.6)", border: "1px solid rgba(0, 229, 255, 0.12)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
            <Info size={14} color="#00E5FF" />
            CURRENT PROTOTYPE vs. PROPOSED SYSTEM
          </div>
          <p style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.45 }}>
            Current satellite observations are available at a coarser 30-minute interval. The proposed system aims to synthesize intermediate frames using motion-aware temporal modeling.
          </p>
          <div style={{ fontSize: 8.5, color: "#00E5FF", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginTop: "auto" }}>
            Current: Baseline Visualization Demo · Proposed: Neural Motion Synthesis Pipeline
          </div>
        </div>

        {/* Card 2: Validation Strategy Workflow */}
        <div style={{ padding: 14, background: "rgba(4, 8, 17, 0.6)", border: "1px solid rgba(123, 97, 255, 0.15)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: "#7B61FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
            <Activity size={14} color="#7B61FF" />
            FUTURE MODEL EVALUATION STRATEGY
          </div>
          <p style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.45 }}>
            When a future trained model is connected, reconstructed intermediate frames will be evaluated against ground-truth satellite scans using structural similarity and signal-to-noise metrics.
          </p>
          <div style={{ fontSize: 8.5, color: "#FFB800", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginTop: "auto" }}>
            Workflow: Frame A → Interpolation → Intermediate Frame → Ground Truth Check → Metrics
          </div>
        </div>

      </div>

      {/* ─── Evaluation Metrics Panel ─── */}
      <div style={{ marginTop: 2 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <BarChart3 size={13} color="#00E5FF" />
            Evaluation Metrics — Model Inference Status
          </div>
          <button
            onClick={() => onNavigate && onNavigate("xai")}
            style={{
              background: "rgba(0, 229, 255, 0.12)",
              border: "1px solid rgba(0, 229, 255, 0.35)",
              borderRadius: 6,
              color: "#00E5FF",
              fontSize: 10,
              fontWeight: 800,
              padding: "4px 10px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            VIEW EXPLAINABILITY <ArrowRight size={12} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { metric: "SSIM", full: "Structural Similarity Index", status: "Awaiting model inference" },
            { metric: "PSNR", full: "Peak Signal-to-Noise Ratio", status: "Awaiting model inference" },
            { metric: "MSE", full: "Mean Squared Error", status: "Awaiting model inference" },
            { metric: "FSIM", full: "Feature Similarity Index", status: "Awaiting model inference" }
          ].map((item) => (
            <div 
              key={item.metric}
              style={{
                background: "rgba(4, 8, 17, 0.6)",
                border: "1px solid rgba(0, 229, 255, 0.1)",
                borderRadius: 8,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: "white", fontFamily: "'JetBrains Mono', monospace" }}>
                  {item.metric}
                </span>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFB800", animation: "pulse-dot 1.8s infinite" }} />
              </div>

              <span style={{ fontSize: 9, color: "#64748B", fontWeight: 500 }}>{item.full}</span>

              <div 
                style={{
                  marginTop: 4,
                  padding: "4px 8px",
                  borderRadius: 4,
                  background: "rgba(255, 184, 0, 0.06)",
                  border: "1px solid rgba(255, 184, 0, 0.2)",
                  color: "#FFB800",
                  fontSize: 8.5,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: "center"
                }}
              >
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
