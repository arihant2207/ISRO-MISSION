import React from "react";
import { Cpu, AlertCircle, Info, Workflow, BarChart3, ArrowRight } from "lucide-react";
import AITemporalEnhancementDemo from "./AITemporalEnhancementDemo";

interface MetricsScreenProps {
  onNavigate?: (navId: string) => void;
}

export default function MetricsScreen({ onNavigate }: MetricsScreenProps) {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, maxWidth: 1600, margin: "0 auto" }}>
      {/* Render the scientifically honest Temporal Enhancement Demo */}
      <AITemporalEnhancementDemo onNavigate={onNavigate} />
    </div>
  );
}
