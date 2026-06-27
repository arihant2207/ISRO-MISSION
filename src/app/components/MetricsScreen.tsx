import React, { useEffect, useState } from "react";
import { TrendingUp, Cpu } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { METRIC_TREND, MODEL_RADAR, INFER_DATA } from "../data";

// Live Counter with initial count-up and subtle telemetry drift animations
function LiveCounter({ 
  label, 
  baseValue, 
  precision, 
  unit = "", 
  desc, 
  color, 
  driftRange,
  comparisonText = "+3.2% vs baseline"
}: { 
  label: string; 
  baseValue: number; 
  precision: number; 
  unit?: string; 
  desc: string; 
  color: string; 
  driftRange: number;
  comparisonText?: string;
}) {
  const [currentVal, setCurrentVal] = useState(0);

  useEffect(() => {
    let start = baseValue * 0.75; // Start from 75% of value for a technical load effect
    if (baseValue < 0.1) start = 0;
    const duration = 800; // ms
    const startTime = performance.now();

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad curve
      const ease = progress * (2 - progress);
      setCurrentVal(start + (baseValue - start) * ease);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        // Start minor random walk drift to mimic active real-time mathematical solver updates
        const interval = setInterval(() => {
          setCurrentVal((prev) => {
            const drift = (Math.random() - 0.5) * 2 * driftRange;
            return Math.min(baseValue + driftRange, Math.max(baseValue - driftRange, baseValue + drift));
          });
        }, 1600 + Math.random() * 600);
        return () => clearInterval(interval);
      }
    };

    requestAnimationFrame(animateCount);
  }, [baseValue, driftRange]);

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: "16px 12px", 
        textAlign: "center", 
        border: `1px solid ${color}1e`,
        boxShadow: `0 4px 20px ${color}02`,
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s"
      }}
    >
      <div style={{ fontSize: 9.5, color: "#64748B", letterSpacing: 0.8, marginBottom: 8, fontWeight: 700, fontFamily: "var(--font-display)" }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 800, color, fontFamily: "var(--font-display), monospace", lineHeight: 1, marginBottom: 5 }}>
        {currentVal.toFixed(precision)}{unit}
      </div>
      <div style={{ fontSize: 9, color: "#94A3B8", marginBottom: 7, fontWeight: 500, fontFamily: "var(--font-sans)" }}>{desc}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 8, color: "#00F593", background: "rgba(0,245,147,0.06)", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontFamily: "var(--font-display)", border: "1px solid rgba(0, 245, 147, 0.12)" }}>
        <TrendingUp size={8} />{comparisonText}
      </div>
    </div>
  );
}

// Live hardware utilization component with loader sweeps and telemetry drifts
function HardwareProgressItem({ 
  label, 
  baseValue, 
  unit = "%", 
  totalValue = 0, 
  color 
}: { 
  label: string; 
  baseValue: number; 
  unit?: string; 
  totalValue?: number; 
  color: string; 
}) {
  const [val, setVal] = useState(baseValue * 0.5);

  useEffect(() => {
    const duration = 1000;
    const startTime = performance.now();
    const startVal = baseValue * 0.4;

    const anim = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress);
      setVal(startVal + (baseValue - startVal) * ease);

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        const interval = setInterval(() => {
          setVal((prev) => {
            const drift = (Math.random() - 0.5) * 3; // drift bounds +/-1.5%
            return Math.min(100, Math.max(0, baseValue + drift));
          });
        }, 1100 + Math.random() * 500);
        return () => clearInterval(interval);
      }
    };
    requestAnimationFrame(anim);
  }, [baseValue]);

  let descText = "";
  if (totalValue > 0) {
    const used = ((val / 100) * totalValue).toFixed(1);
    descText = ` [${used}/${totalValue} GB]`;
  } else if (label.toLowerCase().includes("throughput")) {
    descText = ` · ${(val * 0.2).toFixed(1)} fps`;
  }

  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 10.5, color: "#94A3B8", fontFamily: "var(--font-sans)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 10.5, color, fontFamily: "var(--font-display), monospace", fontWeight: 700 }}>
          {val.toFixed(1)}{unit}{descText}
        </span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div 
          style={{ 
            width: `${val}%`, 
            height: "100%", 
            background: `linear-gradient(90deg, ${color}bb, ${color})`, 
            borderRadius: 2, 
            boxShadow: `0 0 6px ${color}22`,
            transition: "width 0.15s linear"
          }} 
        />
      </div>
    </div>
  );
}

export default function MetricsScreen() {
  // Chart datasets bound to states to simulate active numerical computations
  const [trendData, setTrendData] = useState(METRIC_TREND);
  const [radarData, setRadarData] = useState(MODEL_RADAR);
  const [inferData, setInferData] = useState(INFER_DATA);

  // Subtle real-time data fluctuations to trigger smooth transitions in charts
  useEffect(() => {
    const trendInterval = setInterval(() => {
      setTrendData((prev) => 
        prev.map((item) => {
          const drift = (Math.random() - 0.5) * 0.004;
          return { ...item, ssim: Math.min(0.98, Math.max(0.78, item.ssim + drift)) };
        })
      );
    }, 3800);

    const radarInterval = setInterval(() => {
      setRadarData((prev) => 
        prev.map((item) => {
          const drift = (Math.random() - 0.5) * 1.5;
          return { ...item, ai: Math.min(100, Math.max(65, item.ai + drift)) };
        })
      );
    }, 4200);

    const inferInterval = setInterval(() => {
      setInferData((prev) => 
        prev.map((item) => {
          const drift = (Math.random() - 0.5) * 0.08;
          return { ...item, ms: Math.min(3.2, Math.max(1.7, item.ms + drift)) };
        })
      );
    }, 3200);

    return () => {
      clearInterval(trendInterval);
      clearInterval(radarInterval);
      clearInterval(inferInterval);
    };
  }, []);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* Header section with technical status badges */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>AI Performance Metrics</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "#94A3B8", marginTop: 4 }}>Real-time model accuracy, temporal consistency, and hardware compute telemetry</div>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "5px 12px", borderRadius: 8, background: "rgba(0, 229, 255, 0.08)", border: "1px solid rgba(0, 229, 255, 0.22)", color: "#00E5FF", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
          MODEL_GATEWAY: SYNCED
        </div>
      </div>

      {/* ─── Categorized Telemetry Grid ─── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Row 1: Model Accuracy (Fidelity Metrics) */}
        <div>
          <div style={{ fontSize: 9, color: "#64748B", fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "0.1em", marginBottom: 8 }}>
            FIDELITY TELEMETRY (SPATIAL & PERCEPTUAL QUALITY)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            <LiveCounter label="SSIM" baseValue={0.9428} precision={4} desc="Structural Similarity Index" color="#00E5FF" driftRange={0.0006} comparisonText="+3.24% vs baseline" />
            <LiveCounter label="PSNR" baseValue={36.14} precision={2} unit=" dB" desc="Peak Signal-to-Noise Ratio" color="#00E5FF" driftRange={0.08} comparisonText="+4.82% vs baseline" />
            <LiveCounter label="LPIPS" baseValue={0.0312} precision={4} desc="Learned Perceptual Similarity" color="#FFB800" driftRange={0.0004} comparisonText="-12.4% vs baseline" />
            <LiveCounter label="FSIM" baseValue={0.9714} precision={4} desc="Feature Similarity Metric" color="#00F593" driftRange={0.0005} comparisonText="+2.15% vs baseline" />
          </div>
        </div>

        {/* Row 2: Performance & Error Telemetry */}
        <div>
          <div style={{ fontSize: 9, color: "#64748B", fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "0.1em", marginBottom: 8 }}>
            COMPUTE & ERROR TELEMETRY (EXECUTION SPEED & DEVIATION)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            <LiveCounter label="INFERENCE TIME" baseValue={2.24} precision={2} unit=" ms" desc="Avg Latency per Frame Pair" color="#FF6A00" driftRange={0.06} comparisonText="-8.14% vs baseline" />
            <LiveCounter label="THROUGHPUT (FPS)" baseValue={14.28} precision={2} unit=" fps" desc="Temporal Generation Rate" color="#00F593" driftRange={0.15} comparisonText="+6.22% vs baseline" />
            <LiveCounter label="MAE" baseValue={0.0182} precision={4} desc="Mean Absolute Error Index" color="#7B61FF" driftRange={0.0003} comparisonText="-9.45% vs baseline" />
            <LiveCounter label="MSE" baseValue={0.0024} precision={5} desc="Mean Squared Error Offset" color="#7B61FF" driftRange={0.00004} comparisonText="-11.8% vs baseline" />
          </div>
        </div>

      </div>

      {/* ─── Recharts Visualization Grid ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        
        {/* SSIM Trend Chart */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>SSIM Accuracy Trend</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, color: "#94A3B8", marginBottom: 16 }}>Reconstruction fidelity vs baseline models</div>
          <div style={{ height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="aiG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bsG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#7B61FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="t" tick={{ fontSize: 8.5, fill: "#64748B", fontFamily: "var(--font-display)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0.6, 1]} tick={{ fontSize: 8.5, fill: "#64748B", fontFamily: "var(--font-display)" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ background: "rgba(4, 8, 17, 0.92)", border: "1px solid rgba(0,229,255,0.22)", borderRadius: 8, fontSize: 11, backdropFilter: "blur(12px)", color: "white" }} labelStyle={{ color: "#94A3B8", fontFamily: "var(--font-display)" }} />
                <Area type="monotone" dataKey="ssim" name="AI Model" stroke="#00E5FF" fill="url(#aiG)" strokeWidth={2} dot={{ fill: "#00E5FF", r: 3 }} isAnimationActive={true} animationDuration={600} />
                <Area type="monotone" dataKey="base" name="Baseline" stroke="#7B61FF" fill="url(#bsG)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={true} animationDuration={600} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Radar Comparison */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>Model Core Comparison</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, color: "#94A3B8", marginBottom: 12 }}>TemporalNet v2.1 vs static resolution</div>
          <div style={{ height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius={68}>
                <PolarGrid stroke="rgba(255,255,255,0.04)" />
                <PolarAngleAxis dataKey="m" tick={{ fontSize: 8.5, fill: "#64748B", fontFamily: "var(--font-display)" }} />
                <Radar name="AI Model" dataKey="ai" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.12} strokeWidth={2} isAnimationActive={true} animationDuration={600} />
                <Radar name="Baseline" dataKey="base" stroke="#7B61FF" fill="#7B61FF" fillOpacity={0.06} strokeWidth={1.5} isAnimationActive={true} animationDuration={600} />
                <Tooltip contentStyle={{ background: "rgba(4, 8, 17, 0.92)", border: "1px solid rgba(0,229,255,0.22)", borderRadius: 8, fontSize: 11, color: "white" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inference Latency */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2 }}>Inference Latency</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, color: "#94A3B8", marginBottom: 16 }}>Execution speed in milliseconds per frame pair</div>
          <div style={{ height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inferData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="frame" tick={{ fontSize: 8, fill: "#64748B", fontFamily: "var(--font-display)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[1.5, 2.8]} tick={{ fontSize: 8.5, fill: "#64748B", fontFamily: "var(--font-display)" }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={{ background: "rgba(4, 8, 17, 0.92)", border: "1px solid rgba(0,229,255,0.22)", borderRadius: 8, fontSize: 11, color: "white" }} />
                <Bar dataKey="ms" name="Latency (ms)" fill="#FF6A00" radius={[4, 4, 0, 0]} fillOpacity={0.8} isAnimationActive={true} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ─── Hardware Utilization Panel ─── */}
      <div className="glass-panel" style={{ padding: "20px 24px", display: "flex", gap: 32, alignItems: "center" }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "white", marginBottom: 2, display: "flex", alignItems: "center", gap: 5 }}>
            <Cpu size={14} color="#00E5FF" /> System Performance
          </div>
          <div style={{ fontSize: 9.5, color: "#64748B", fontFamily: "var(--font-display), monospace" }}>HARDWARE: A100_SXM4</div>
        </div>
        
        <HardwareProgressItem label="GPU Utilization" baseValue={82} color="#FF6A00" />
        <HardwareProgressItem label="VRAM Occupation" baseValue={68} totalValue={16.0} color="#7B61FF" />
        <HardwareProgressItem label="CPU Threads" baseValue={34} color="#00E5FF" />
        <HardwareProgressItem label="Throughput Rate" baseValue={71} color="#00F593" />
      </div>

    </div>
  );
}
