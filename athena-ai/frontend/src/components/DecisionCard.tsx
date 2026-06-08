"use client";

import { useState } from "react";
import type { WorkflowStep } from "@/hooks/useWorkflowSim";

interface DecisionCardProps {
  step: WorkflowStep;
  onApprove?: () => void;
  onOverride?: () => void;
}

export default function DecisionCard({ step, onApprove, onOverride }: DecisionCardProps) {
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  const isDecisionStep = step.stepIndex === 5;
  const isResolved = step.stepIndex === 6;

  const handleApprove = () => {
    if (approving || approved) return;
    setApproving(true);
    setTimeout(() => {
      setApproved(true);
      setApproving(false);
      onApprove?.();
    }, 800);
  };

  return (
    <div
      className="glass-card p-4 flex flex-col gap-3 relative overflow-hidden transition-all duration-700"
      style={{
        borderColor: isDecisionStep
          ? "rgba(251,191,36,0.3)"
          : isResolved
          ? "rgba(52,211,153,0.25)"
          : "var(--border-subtle)",
        boxShadow: isDecisionStep
          ? "0 0 0 1px rgba(251,191,36,0.08) inset, 0 4px 32px rgba(0,0,0,0.3), 0 0 40px rgba(251,191,36,0.06)"
          : isResolved
          ? "0 0 0 1px rgba(52,211,153,0.06) inset, 0 4px 32px rgba(0,0,0,0.3), 0 0 30px rgba(52,211,153,0.05)"
          : "0 0 0 1px rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.3)",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Top accent line */}
      {isDecisionStep && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent)" }}
        />
      )}
      {isResolved && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)" }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: isDecisionStep
              ? "rgba(251,191,36,0.1)"
              : isResolved
              ? "rgba(52,211,153,0.1)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${isDecisionStep ? "rgba(251,191,36,0.25)" : isResolved ? "rgba(52,211,153,0.25)" : "var(--border-subtle)"}`,
          }}
        >
          <span style={{ fontSize: 13 }}>
            {isResolved ? "✓" : isDecisionStep ? "⚡" : "◈"}
          </span>
        </div>
        <div>
          <p
            className="text-xs font-medium"
            style={{
              color: isDecisionStep ? "#FBBF24" : isResolved ? "#34D399" : "var(--text-secondary)",
              letterSpacing: "0.04em",
            }}
          >
            {isResolved ? "Decision Executed" : isDecisionStep ? "Awaiting Approval" : "Decision Engine"}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>
            Human-in-the-loop checkpoint
          </p>
        </div>
      </div>

      <div className="divider" />

      {/* Content */}
      {isResolved ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#34D399" }}>Option C Executed</p>
              <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>09:42 IST · Dhruv Malhotra, COO</p>
            </div>
          </div>
          <div
            className="rounded-lg p-2.5 text-xs"
            style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}
          >
            <p style={{ color: "#34D399" }}>✓ Air cargo booked via IndiGo Cargo</p>
            <p style={{ color: "#34D399", marginTop: 2 }}>✓ Secondary supplier B activated</p>
            <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 9 }}>Net savings: ₹870,000 · Delivery on track D+2</p>
          </div>
        </div>
      ) : isDecisionStep ? (
        <div className="flex flex-col gap-3">
          {/* Recommended action */}
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium" style={{ color: "#FBBF24" }}>Recommended: Option C</p>
              <span className="label-tag label-tag-success" style={{ fontSize: 9 }}>94.1% confidence</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)", fontSize: 11 }}>
              Air freight (40%) + Secondary supplier activation (60%). Estimated cost: ₹155,000. Prevents ₹870,000 in losses.
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <div
              className="flex-1 h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FBBF24, #FB7185)",
                  width: approved ? "100%" : "65%",
                  transition: "width 0.5s linear",
                }}
              />
            </div>
            <span className="mono text-xs" style={{ color: "var(--text-muted)", fontSize: 9 }}>
              {approved ? "Approved" : "~11s remaining"}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={approving || approved}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5"
              style={{
                background: approved ? "rgba(52,211,153,0.15)" : approving ? "rgba(52,211,153,0.08)" : "rgba(52,211,153,0.1)",
                border: `1px solid ${approved ? "rgba(52,211,153,0.4)" : "rgba(52,211,153,0.25)"}`,
                color: approved ? "#34D399" : approving ? "#6EE7B7" : "#34D399",
                cursor: approved ? "default" : "pointer",
                transform: approving ? "scale(0.98)" : "scale(1)",
              }}
            >
              {approved ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L3.5 7L8.5 2" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Approved
                </>
              ) : approving ? (
                <>
                  <span className="mono" style={{ animation: "pulse-slow 0.8s ease-in-out infinite", fontSize: 10 }}>⬡</span>
                  Confirming...
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L3.5 7L8.5 2" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Approve & Execute
                </>
              )}
            </button>
            <button
              onClick={onOverride}
              className="py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.borderColor = "var(--border-hover)";
                (e.target as HTMLButtonElement).style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
                (e.target as HTMLButtonElement).style.color = "var(--text-muted)";
              }}
            >
              Override
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div
            className="rounded-lg p-3 flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)" }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>⏸</span>
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Monitoring Mode
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>
                {step.stepIndex < 4
                  ? "Agents building recommendation..."
                  : "Awaiting agent pipeline completion"}
              </p>
            </div>
          </div>
          <p className="text-xs text-center" style={{ color: "var(--text-muted)", fontSize: 10, opacity: 0.6 }}>
            Human override available at decision checkpoint
          </p>
        </div>
      )}
    </div>
  );
}