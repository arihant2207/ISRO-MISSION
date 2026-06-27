import React, { useState } from "react";
import { Sliders, Cpu, Bell } from "lucide-react";
import { G } from "../data";

export default function SettingsScreen() {
  const [speed, setSpeed] = useState(1.0);
  const [quality, setQuality] = useState("high");
  const [model, setModel] = useState("TemporalNet v2.1");
  const [gpu, setGpu] = useState("A100-80GB");
  const [notif, setNotif] = useState(true);

  const configs = [
    {
      title: "AI Model Configuration",
      Icon: Sliders,
      items: [
        { 
          label: "Model Version", 
          desc: "Select interpolation neural network architecture", 
          ctrl: (
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)} 
              style={{ 
                background: "rgba(0,0,0,0.45)", 
                border: "1px solid rgba(0,229,255,0.22)", 
                color: "white", 
                padding: "8px 14px", 
                borderRadius: 8, 
                fontSize: 12, 
                outline: "none",
                fontFamily: "'JetBrains Mono', monospace" 
              }}
            >
              <option>TemporalNet v2.1</option>
              <option>TemporalNet v2.0</option>
              <option>RIFE v4.6</option>
              <option>DAIN v2.0</option>
            </select>
          )
        },
        { 
          label: "Inference Quality", 
          desc: "Balance resource utilization vs output resolution", 
          ctrl: (
            <div className="segmented-control">
              {["fast", "balanced", "high", "ultra"].map((q) => (
                <button 
                  key={q} 
                  onClick={() => setQuality(q)} 
                  className={`segmented-btn ${quality === q ? "active" : ""}`}
                >
                  {q.toUpperCase()}
                </button>
              ))}
            </div>
          )
        },
      ],
    },
    {
      title: "Hardware Accelerator & Performance",
      Icon: Cpu,
      items: [
        { 
          label: "Playback Animation Speed", 
          desc: "Frame rate multiplication index for visual loops", 
          ctrl: (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input 
                type="range" 
                min={0.25} 
                max={4} 
                step={0.25} 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))} 
                className="glass-slider"
                style={{ width: 120 }} 
              />
              <span style={{ fontSize: 12.5, color: "#00E5FF", fontFamily: "'JetBrains Mono',monospace", minWidth: 32, fontWeight: 700 }}>{speed}×</span>
            </div>
          )
        },
        { 
          label: "Inference Device", 
          desc: "Select CUDA graphic processing accelerator", 
          ctrl: (
            <select 
              value={gpu} 
              onChange={(e) => setGpu(e.target.value)} 
              style={{ 
                background: "rgba(0,0,0,0.45)", 
                border: "1px solid rgba(0,229,255,0.22)", 
                color: "white", 
                padding: "8px 14px", 
                borderRadius: 8, 
                fontSize: 12, 
                outline: "none",
                fontFamily: "'JetBrains Mono', monospace" 
              }}
            >
              <option>A100-80GB</option>
              <option>V100-32GB</option>
              <option>RTX 4090</option>
              <option>CPU (Fallback)</option>
            </select>
          )
        },
      ],
    },
    {
      title: "Telemetry & Notification Controls",
      Icon: Bell,
      items: [
        { 
          label: "Real-time Event Alerts", 
          desc: "Send warnings immediately when storm features are detected", 
          ctrl: (
            <div 
              className={`glass-switch ${notif ? "active" : ""}`}
              onClick={() => setNotif(!notif)}
            >
              <div className="glass-switch-handle" />
            </div>
          )
        },
      ],
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 760 }}>
      
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "white" }}>Settings</div>
        <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Configure hardware priorities, interpolation rates, and security linkages</div>
      </div>

      {/* Configurations blocks */}
      {configs.map(({ title, Icon, items }) => (
        <div key={title} className="glass-panel" style={{ marginBottom: 16, overflow: "hidden" }}>
          
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(0,229,255,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon size={14} color="#00E5FF" />
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 12.5, fontWeight: 700, color: "white", letterSpacing: 0.5 }}>{title.toUpperCase()}</div>
          </div>

          {items.map(({ label, desc, ctrl }) => (
            <div 
              key={label} 
              style={{ 
                padding: "16px 20px", 
                borderBottom: "1px solid rgba(255,255,255,0.02)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                gap: 24 
              }}
            >
              <div>
                <div style={{ fontSize: 12.5, color: "white", marginBottom: 3, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{desc}</div>
              </div>
              {ctrl}
            </div>
          ))}

        </div>
      ))}
    </div>
  );
}
