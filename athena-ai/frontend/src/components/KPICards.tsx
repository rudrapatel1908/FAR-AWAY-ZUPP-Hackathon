"use client";

import { useEffect, useRef, useState } from "react";
import type { KPIState } from "@/hooks/useWorkflowSim";

interface KPICardsProps {
  kpis: KPIState;
}

function useCountUp(target: number, duration = 1200): number {
  const [current, setCurrent] = useState(target);
  const prevRef = useRef(target);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const startValueRef = useRef(target);

  useEffect(() => {
    if (prevRef.current === target) return;

    cancelAnimationFrame(animRef.current);
    startValueRef.current = prevRef.current;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Premium easing: cubic-bezier(0.16, 1, 0.3, 1)
      const eased = 1 - Math.pow(1 - progress, 3) * (1 + (1 - progress) * 0.6);
      const value = startValueRef.current + (target - startValueRef.current) * eased;
      setCurrent(value);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = target;
        setCurrent(target);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [target, duration]);

  return current;
}

interface KPICardProps {
  label: string;
  value: number;
  format: "currency" | "percent" | "count";
  subtext?: string;
  colorScheme: "danger" | "success" | "warning" | "brand" | "neutral";
  animDelay?: number;
  isActive?: boolean;
}

const SCHEME = {
  danger: { primary: "#FB7185", bg: "rgba(251,113,133,0.06)", border: "rgba(251,113,133,0.2)", glow: "rgba(251,113,133,0.1)" },
  success: { primary: "#34D399", bg: "rgba(52,211,153,0.06)", border: "rgba(52,211,153,0.2)", glow: "rgba(52,211,153,0.1)" },
  warning: { primary: "#FBBF24", bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.2)", glow: "rgba(251,191,36,0.1)" },
  brand: { primary: "#818CF8", bg: "rgba(129,140,248,0.06)", border: "rgba(129,140,248,0.2)", glow: "rgba(129,140,248,0.1)" },
  neutral: { primary: "#94A3B8", bg: "rgba(148,163,184,0.04)", border: "rgba(148,163,184,0.12)", glow: "transparent" },
};

function KPICard({ label, value, format, subtext, colorScheme, animDelay = 0, isActive }: KPICardProps) {
  const animated = useCountUp(value, 1400);
  const scheme = SCHEME[colorScheme];

  const formatValue = (v: number): string => {
    if (format === "currency") {
      if (v >= 1000000) return `₹${(v / 1000000).toFixed(2)}M`;
      if (v >= 1000) return `₹${Math.round(v / 1000)}K`;
      return `₹${Math.round(v).toLocaleString("en-IN")}`;
    }
    if (format === "percent") return `${v.toFixed(1)}%`;
    return Math.round(v).toString();
  };

  return (
    <div
      className="glass-card p-4 flex flex-col gap-2 transition-all duration-700 relative overflow-hidden"
      style={{
        background: value > 0 ? scheme.bg : "var(--card-surface)",
        borderColor: value > 0 ? scheme.border : "var(--border-subtle)",
        boxShadow: value > 0
          ? `0 0 0 1px rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.3), 0 0 20px ${scheme.glow}`
          : "0 0 0 1px rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.3)",
        animationDelay: `${animDelay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Gradient top accent */}
      {value > 0 && (
        <div
          className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${scheme.primary}60, transparent)` }}
        />
      )}

      {/* Label row */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium tracking-wider uppercase"
          style={{ color: "var(--text-muted)", letterSpacing: "0.08em", fontSize: 10 }}
        >
          {label}
        </span>
        {isActive && (
          <div
            className="status-dot"
            style={{
              background: scheme.primary,
              boxShadow: `0 0 6px ${scheme.primary}`,
              animation: "dot-pulse-brand 1.5s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Value */}
      <div
        className="mono font-medium transition-colors duration-700 leading-none"
        style={{
          fontSize: value === 0 ? 22 : 24,
          color: value > 0 ? scheme.primary : "var(--text-muted)",
          letterSpacing: "-0.02em",
        }}
      >
        {value === 0 ? (
          <span style={{ opacity: 0.3 }}>—</span>
        ) : (
          formatValue(animated)
        )}
      </div>

      {/* Subtext */}
      {subtext && (
        <p className="text-xs" style={{ color: "var(--text-muted)", lineHeight: 1.4 }}>
          {subtext}
        </p>
      )}
    </div>
  );
}

export default function KPICards({ kpis }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <KPICard
        label="Revenue at Risk"
        value={kpis.revenueRisk}
        format="currency"
        subtext="Exposure window open"
        colorScheme={kpis.revenueRisk > 500000 ? "danger" : kpis.revenueRisk > 0 ? "warning" : "neutral"}
        isActive={kpis.revenueRisk > 0}
        animDelay={0}
      />
      <KPICard
        label="Root Cause Score"
        value={kpis.rootCauseConfidence}
        format="percent"
        subtext="Bayesian confidence"
        colorScheme={kpis.rootCauseConfidence > 80 ? "brand" : "neutral"}
        isActive={kpis.rootCauseConfidence > 0}
        animDelay={80}
      />
      <KPICard
        label="Delay Probability"
        value={kpis.delayProbability}
        format="percent"
        subtext="5-day forecast window"
        colorScheme={kpis.delayProbability > 60 ? "warning" : kpis.delayProbability > 0 ? "brand" : "neutral"}
        isActive={kpis.delayProbability > 0}
        animDelay={160}
      />
      <KPICard
        label="Realized Savings"
        value={kpis.realizedSavings}
        format="currency"
        subtext="Losses prevented"
        colorScheme={kpis.realizedSavings > 0 ? "success" : "neutral"}
        isActive={kpis.realizedSavings > 0}
        animDelay={240}
      />
      <KPICard
        label="Actions Executed"
        value={kpis.decisionsExecuted}
        format="count"
        subtext="Autonomous decisions"
        colorScheme={kpis.decisionsExecuted > 0 ? "success" : "neutral"}
        isActive={kpis.decisionsExecuted > 0}
        animDelay={320}
      />
      <KPICard
        label="Active Alerts"
        value={kpis.activeAlerts}
        format="count"
        subtext="Requiring attention"
        colorScheme={kpis.activeAlerts > 2 ? "danger" : kpis.activeAlerts > 0 ? "warning" : "neutral"}
        isActive={kpis.activeAlerts > 0}
        animDelay={400}
      />
    </div>
  );
}