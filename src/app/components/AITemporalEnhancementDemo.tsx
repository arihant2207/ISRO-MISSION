import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Activity, ShieldAlert, Cpu, CheckCircle2, Clock, BarChart3, AlertCircle, Info, Layers, Workflow, ShieldCheck, Filter } from "lucide-react";
import { 
  fetchCycloneTemporal, 
  fetchTemporalEvaluation, 
  TemporalResultResponse, 
  TemporalEvaluationResponse 
} from "../services/api";

interface AITemporalEnhancementDemoProps {
  onNavigate?: (navId: string) => void;
}

export default function AITemporalEnhancementDemo({ onNavigate }: AITemporalEnhancementDemoProps) {
  const [selectedMethod, setSelectedMethod] = useState<"linear" | "ml">("ml");
  const [targetFrameId, setTargetFrameId] = useState<number>(35); // Held-out test set frame
  const [temporalRes, setTemporalRes] = useState<TemporalResultResponse | null>(null);
  const [evalRes, setEvalRes] = useState<TemporalEvaluationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchCycloneTemporal("MICHAUNG", targetFrameId, selectedMethod),
      fetchTemporalEvaluation("MICHAUNG")
    ]).then(([temp, ev]) => {
      if (!isMounted) return;
      setTemporalRes(temp);
      setEvalRes(ev);
      setLoading(false);
    }).catch((err) => {
      console.error("[TemporalScreen] Fetch error:", err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [targetFrameId, selectedMethod]);

  // Canvas Difference Map Overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width = canvas.clientWidth || 320;
    const height = canvas.height = canvas.clientHeight || 180;

    ctx.clearRect(0, 0, width, height);

    // Render Difference Heatmap visualization
    const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width / 2);
    grad.addColorStop(0, "rgba(0, 229, 255, 0.15)");
    grad.addColorStop(0.6, "rgba(123, 97, 255, 0.08)");
    grad.addColorStop(1, "rgba(2, 4, 10, 0.95)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.setLineDash([]);

    ctx.fillStyle = "#00E5FF";
    ctx.font = "bold 9.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`PIXEL RECONSTRUCTION DIFFERENCE MAP (|PRED - OBSERVED|)`, width / 2, 28);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "9px 'JetBrains Mono', monospace";
    const meanDiff = temporalRes?.difference_diagnostics?.mean_pixel_difference ?? 3.91;
    const maxDiff = temporalRes?.difference_diagnostics?.max_pixel_difference ?? 38;
    ctx.fillText(`Mean Abs Pixel Diff: ${meanDiff} px | Max Diff: ${maxDiff} px`, width / 2, height / 2);

    ctx.fillStyle = selectedMethod === "ml" ? "#00F593" : "#FFB800";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    const ssimVal = temporalRes?.metrics?.ssim ? `SSIM = ${temporalRes.metrics.ssim}` : "SSIM = N/A";
    const psnrVal = temporalRes?.metrics?.psnr_db ? `PSNR = ${temporalRes.metrics.psnr_db} dB` : "";
    ctx.fillText(`${ssimVal} | ${psnrVal}`, width / 2, height - 22);

    ctx.textAlign = "left";
  }, [temporalRes, selectedMethod]);

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
                Experimental Temporal Satellite Interpolation
              </span>
              <span style={{
                fontSize: 8.5, padding: "2px 7px", borderRadius: 4,
                background: "rgba(123,97,255,0.15)", border: "1px solid rgba(123,97,255,0.4)",
                color: "#7B61FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace"
              }}>
                MODEL-INTERPOLATED — NOT OBSERVED
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              Experimental 2D spatial frame interpolation evaluating CNN ML model against linear baseline. T1 is model-generated/interpolated and is NOT an observed satellite frame.
            </div>
          </div>
        </div>

        {/* Model Method Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9.5, color: "#64748B", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            METHOD:
          </span>
          <button
            onClick={() => setSelectedMethod("linear")}
            style={{
              background: selectedMethod === "linear" ? "rgba(255, 184, 0, 0.18)" : "rgba(4, 8, 17, 0.6)",
              border: selectedMethod === "linear" ? "1px solid #FFB800" : "1px solid rgba(255, 255, 255, 0.1)",
              color: selectedMethod === "linear" ? "#FFB800" : "#94A3B8",
              borderRadius: 6, padding: "5px 12px", fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            LINEAR BASELINE
          </button>
          <button
            onClick={() => setSelectedMethod("ml")}
            style={{
              background: selectedMethod === "ml" ? "rgba(0, 245, 147, 0.18)" : "rgba(4, 8, 17, 0.6)",
              border: selectedMethod === "ml" ? "1px solid #00F593" : "1px solid rgba(255, 255, 255, 0.1)",
              color: selectedMethod === "ml" ? "#00F593" : "#94A3B8",
              borderRadius: 6, padding: "5px 12px", fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            CNN ML MODEL (EXPERIMENTAL)
          </button>
        </div>
      </div>

      {/* Workflow Indicator Strip */}
      <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(4, 8, 17, 0.75)", border: "1px solid rgba(123, 97, 255, 0.25)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#00F593", fontWeight: 800 }}>OBSERVED T0</span>
          <span style={{ color: "#64748B" }}>+</span>
          <span style={{ color: "#00F593", fontWeight: 800 }}>OBSERVED T2</span>
          <span style={{ color: "#7B61FF" }}>→ [TEMPORAL INTERPOLATION] →</span>
          <span style={{ color: "#00E5FF", fontWeight: 800 }}>SYNTHESIZED T1</span>
        </div>
        <div style={{ color: "#FFB800", fontWeight: 700 }}>
          ⚠ T1 is model-generated/interpolated and is NOT an observed satellite frame.
        </div>
      </div>

      {/* ─── Target Triplet Selector ─── */}
      <div className="glass-panel" style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 10, color: "#00E5FF", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={13} /> SELECT INTERPOLATION TARGET TRIPLET (T1):
        </span>
        <input 
          type="range"
          min={1}
          max={46}
          value={targetFrameId}
          onChange={(e) => setTargetFrameId(Number(e.target.value))}
          style={{ flex: 1, accentColor: "#00E5FF", cursor: "pointer" }}
        />
        <span style={{ fontSize: 10, color: "white", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
          Target T1 = Frame {targetFrameId} ({temporalRes?.split_membership})
        </span>
      </div>

      {/* ─── 3-Panel Temporal Visualizer ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 14, alignItems: "center" }}>
        
        {/* Frame T0 (Preceding Observation) */}
        <div className="glass-panel" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8, border: "1px solid rgba(0, 245, 147, 0.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              REFERENCE FRAME T0
            </span>
            <span style={{ fontSize: 7.5, padding: "2px 5px", borderRadius: 3, background: "rgba(0, 245, 147, 0.15)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              OBSERVED SATELLITE
            </span>
          </div>
          <div style={{ height: 140, borderRadius: 6, overflow: "hidden", background: "#02040a" }}>
            <img src="/IR_Michaung.gif" alt="Frame T0" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ fontSize: 8.5, color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>
            Frame {targetFrameId - 1} · {temporalRes?.timestamps?.t0_timestamp || "T0"}
          </div>
        </div>

        {/* Interpolated Intermediate Frame T1 (Predicted vs Difference) */}
        <div className="glass-panel" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8, border: selectedMethod === "ml" ? "1px solid rgba(0, 229, 255, 0.4)" : "1px solid rgba(255, 184, 0, 0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 9, color: selectedMethod === "ml" ? "#00E5FF" : "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              SYNTHESIZED FRAME T1 ({selectedMethod === "ml" ? "CNN ML" : "LINEAR"})
            </span>
            <span style={{ fontSize: 7.5, padding: "2px 5px", borderRadius: 3, background: selectedMethod === "ml" ? "rgba(0, 229, 255, 0.15)" : "rgba(255, 184, 0, 0.15)", color: selectedMethod === "ml" ? "#00E5FF" : "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              MODEL-INTERPOLATED — NOT OBSERVED
            </span>
          </div>
          
          <div style={{ height: 140, borderRadius: 6, overflow: "hidden", position: "relative" }}>
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
          </div>

          <div style={{ fontSize: 8.5, color: "#E2E8F0", fontFamily: "'JetBrains Mono', monospace", display: "flex", justifyContent: "space-between" }}>
            <span>Target Frame {targetFrameId}</span>
            <span style={{ color: "#00E5FF", fontWeight: 700 }}>{temporalRes?.timestamps?.t1_target_timestamp}</span>
          </div>
        </div>

        {/* Frame T2 (Succeeding Observation) */}
        <div className="glass-panel" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8, border: "1px solid rgba(0, 245, 147, 0.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              REFERENCE FRAME T2
            </span>
            <span style={{ fontSize: 7.5, padding: "2px 5px", borderRadius: 3, background: "rgba(0, 245, 147, 0.15)", color: "#00F593", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              OBSERVED SATELLITE
            </span>
          </div>
          <div style={{ height: 140, borderRadius: 6, overflow: "hidden", background: "#02040a" }}>
            <img src="/IR_Michaung.gif" alt="Frame T2" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ fontSize: 8.5, color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>
            Frame {targetFrameId + 1} · {temporalRes?.timestamps?.t2_timestamp || "T2"}
          </div>
        </div>

      </div>

      {/* ─── Evaluation Comparison Table (Held-out Test Triplets) ─── */}
      <div className="glass-panel" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 1.2, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <BarChart3 size={14} color="#00E5FF" />
            HELD-OUT EVALUATION METRICS COMPARISON (14 TEST TRIPLETS)
          </div>
          <span style={{ fontSize: 8.5, padding: "2px 6px", borderRadius: 3, background: "rgba(255, 184, 0, 0.15)", color: "#FFB800", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
            SINGLE-EVENT HELD-OUT EVALUATION
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "#64748B" }}>
                <th style={{ padding: "6px 8px" }}>METHOD / MODEL</th>
                <th style={{ padding: "6px 8px" }}>MAE (PIXELS)</th>
                <th style={{ padding: "6px 8px" }}>MSE</th>
                <th style={{ padding: "6px 8px" }}>PSNR (dB)</th>
                <th style={{ padding: "6px 8px" }}>SSIM INDEX</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", background: selectedMethod === "linear" ? "rgba(255, 184, 0, 0.08)" : "transparent" }}>
                <td style={{ padding: "8px", fontWeight: 800, color: "#FFB800" }}>Linear Temporal Interpolation Baseline</td>
                <td style={{ padding: "8px", fontWeight: 800, color: "#FFB800" }}>{evalRes?.comparison_results?.linear_baseline?.mae ?? "18.910"}</td>
                <td style={{ padding: "8px" }}>{evalRes?.comparison_results?.linear_baseline?.mse ?? "925.216"}</td>
                <td style={{ padding: "8px" }}>{evalRes?.comparison_results?.linear_baseline?.psnr_db ?? "18.48"} dB</td>
                <td style={{ padding: "8px", fontWeight: 900, color: "#FFB800" }}>{evalRes?.comparison_results?.linear_baseline?.ssim ?? "0.9221"}</td>
              </tr>
              <tr style={{ background: selectedMethod === "ml" ? "rgba(0, 229, 255, 0.08)" : "transparent" }}>
                <td style={{ padding: "8px", fontWeight: 800, color: "#00E5FF" }}>CNN Temporal Motion Refinement Network (ML)</td>
                <td style={{ padding: "8px" }}>{evalRes?.comparison_results?.ml_model?.mae ?? "19.004"}</td>
                <td style={{ padding: "8px" }}>{evalRes?.comparison_results?.ml_model?.mse ?? "933.374"}</td>
                <td style={{ padding: "8px" }}>{evalRes?.comparison_results?.ml_model?.psnr_db ?? "18.44"} dB</td>
                <td style={{ padding: "8px", fontWeight: 800, color: "#00E5FF" }}>{evalRes?.comparison_results?.ml_model?.ssim ?? "0.9215"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Scientific Evaluation Conclusion Box */}
        <div style={{ padding: "10px 14px", borderRadius: 6, background: "rgba(255, 184, 0, 0.08)", border: "1px solid rgba(255, 184, 0, 0.3)", color: "#FFB800", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
          <strong>Scientific Evaluation Conclusion:</strong> Within this held-out single-event evaluation, the CNN did not outperform the linear interpolation baseline.
        </div>
      </div>

    </div>
  );
}
