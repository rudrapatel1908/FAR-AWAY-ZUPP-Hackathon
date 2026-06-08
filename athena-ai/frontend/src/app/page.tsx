"use client";

import { useState, useEffect } from "react";
import AthenaCore from "@/components/AthenaCore";
import AgentGraph from "@/components/AgentGraph";
import KPICards from "@/components/KPICards";
import AgentFeed from "@/components/AgentFeed";
import DecisionCard from "@/components/DecisionCard";
import { useWorkflowSim } from "@/hooks/useWorkflowSim";

const STEP_LABELS = [
  "Idle",
  "Anomaly",
  "Root Cause",
  "Forecast",
  "Strategy",
  "Decision",
  "Resolved",
];

export default function AthenaDashboard() {
  const { step, currentStep, totalSteps, nextStep, prevStep, resetWorkflow, goToStep, isFirst, isLast } =
    useWorkflowSim();

  const [mounted, setMounted] = useState(false);
  const [keyboardHint, setKeyboardHint] = useState(true);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setKeyboardHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        nextStep();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevStep();
      }
      if (e.key === "r" || e.key === "R") {
        resetWorkflow();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nextStep, prevStep, resetWorkflow]);

  if (!mounted) return null;

  const now = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: "var(--bg-base)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Content Layer */}
      <div
        className="relative z-10 flex flex-col"
        style={{ minHeight: "100vh" }}
      >
        {/* ─── Top Nav Bar ───────────────────────────────────────── */}
        <header
          className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
          style={{
            borderColor: "var(--border-subtle)",
            background: "rgba(15,23,42,0.8)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(167,139,250,0.1))",
                border: "1px solid rgba(96,165,250,0.3)",
                boxShadow: "0 0 12px rgba(96,165,250,0.15)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L12 11H2L7 1Z" stroke="#93C5FD" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M4.5 8H9.5" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1
                className="font-semibold leading-none"
                style={{ fontSize: 15, letterSpacing: "-0.02em", color: "var(--text-primary)" }}
              >
                Athena AI
              </h1>
              <p className="mono" style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                DECISION INTELLIGENCE PLATFORM
              </p>
            </div>
          </div>

          {/* Center — status pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className={`status-dot ${
                step.systemStatus === "idle"
                  ? ""
                  : step.systemStatus === "resolved"
                  ? "status-dot-success"
                  : step.systemStatus === "alert"
                  ? "status-dot-danger"
                  : "status-dot-processing"
              }`}
            />
            <span
              className="mono text-xs"
              style={{ color: "var(--text-secondary)", letterSpacing: "0.06em", fontSize: 10 }}
            >
              {step.systemStatus === "idle"
                ? "SYSTEM NOMINAL"
                : step.systemStatus === "resolved"
                ? "INCIDENT RESOLVED"
                : step.systemStatus === "alert"
                ? "ALERT ACTIVE"
                : "AGENTS PROCESSING"}
            </span>
          </div>

          {/* Right — meta */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="status-dot status-dot-success" />
                <span className="mono text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>
                  LangGraph v0.3
                </span>
              </div>
              <div
                className="h-3 w-px"
                style={{ background: "var(--border-subtle)" }}
              />
              <div className="flex items-center gap-1.5">
                <div className="status-dot status-dot-processing" />
                <span className="mono text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>
                  WS · live
                </span>
              </div>
            </div>
            <div
              className="px-2.5 py-1 rounded-lg mono text-xs"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                fontSize: 10,
              }}
            >
              {now} IST
            </div>
          </div>
        </header>

        {/* ─── Main Content ───────────────────────────────────────── */}
        <main className="flex-1 p-4 lg:p-5 overflow-auto">
          {/* Incident Banner */}
          {(step.systemStatus === "alert" || step.systemStatus === "resolved") && (
            <div
              className="mb-4 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-500"
              style={{
                background:
                  step.systemStatus === "resolved"
                    ? "rgba(52,211,153,0.06)"
                    : "rgba(251,191,36,0.06)",
                border: `1px solid ${step.systemStatus === "resolved" ? "rgba(52,211,153,0.2)" : "rgba(251,191,36,0.2)"}`,
                animation: "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
              }}
            >
              <div
                className={`status-dot ${step.systemStatus === "resolved" ? "status-dot-success" : "status-dot-warning"}`}
              />
              <p
                className="text-sm font-medium"
                style={{
                  color: step.systemStatus === "resolved" ? "#34D399" : "#FBBF24",
                }}
              >
                {step.label}
              </p>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                —
              </span>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {step.description}
              </p>
            </div>
          )}

          {/* ─── Bento Grid ─────────────────────────────────────── */}
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "200px 1fr 260px",
              gridTemplateRows: "auto auto 1fr",
              minHeight: "calc(100vh - 180px)",
            }}
          >
            {/* ── Col 1, Row 1-2: Athena Core ── */}
            <div
              className="glass-card p-5 flex flex-col items-center justify-center gap-2 row-span-2"
              style={{ gridColumn: "1", gridRow: "1 / 3" }}
            >
              <AthenaCore status={step.systemStatus} stepIndex={step.activeAgent >= 0 ? step.activeAgent + 1 : 0} />
            </div>

            {/* ── Col 2, Row 1: Agent Graph ── */}
            <div
              className="glass-card p-5 flex flex-col gap-3"
              style={{ gridColumn: "2", gridRow: "1" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="font-semibold"
                    style={{ fontSize: 13, color: "var(--text-primary)", letterSpacing: "-0.01em" }}
                  >
                    Agent Orchestration Pipeline
                  </h2>
                  <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: 2 }}>
                    LangGraph sequential workflow · {step.agents.filter((a) => a.status === "complete").length}/6 complete
                  </p>
                </div>
                <span className="label-tag label-tag-brand">LangGraph</span>
              </div>
              <AgentGraph agents={step.agents} activeAgent={step.activeAgent} />
            </div>

            {/* ── Col 3, Row 1-3: KPI Cards ── */}
            <div
              className="glass-card p-4 flex flex-col gap-3 row-span-3"
              style={{ gridColumn: "3", gridRow: "1 / 4" }}
            >
              <div>
                <h2
                  className="font-semibold"
                  style={{ fontSize: 13, color: "var(--text-primary)", letterSpacing: "-0.01em" }}
                >
                  Financial Intelligence
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: 2 }}>
                  Real-time exposure metrics
                </p>
              </div>
              <KPICards kpis={step.kpis} />
              <div className="divider" />
              <DecisionCard step={step} onApprove={nextStep} />
            </div>

            {/* ── Col 2, Row 2: Step Context ── */}
            <div
              className="glass-card px-4 py-3 flex items-center gap-4"
              style={{ gridColumn: "2", gridRow: "2" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    step.systemStatus === "resolved"
                      ? "rgba(52,211,153,0.1)"
                      : step.systemStatus === "alert"
                      ? "rgba(251,191,36,0.1)"
                      : step.systemStatus === "processing"
                      ? "rgba(96,165,250,0.1)"
                      : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    step.systemStatus === "resolved"
                      ? "rgba(52,211,153,0.25)"
                      : step.systemStatus === "alert"
                      ? "rgba(251,191,36,0.25)"
                      : step.systemStatus === "processing"
                      ? "rgba(96,165,250,0.2)"
                      : "var(--border-subtle)"
                  }`,
                }}
              >
                <span style={{ fontSize: 14 }}>
                  {step.systemStatus === "resolved" ? "✓" : step.systemStatus === "alert" ? "⚠" : step.systemStatus === "processing" ? "⬡" : "◎"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium leading-none"
                  style={{ fontSize: 13, color: "var(--text-primary)" }}
                >
                  {step.label}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)", fontSize: 11 }}
                >
                  {step.description}
                </p>
              </div>
              {step.activeAgent >= 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="status-dot status-dot-processing" />
                  <span className="mono text-xs" style={{ color: "#93C5FD", fontSize: 10 }}>
                    {step.agents[step.activeAgent]?.name} Agent
                  </span>
                </div>
              )}
            </div>

            {/* ── Col 1+2, Row 3: Agent Feed ── */}
            <div
              className="glass-card flex flex-col overflow-hidden"
              style={{
                gridColumn: "1 / 3",
                gridRow: "3",
                maxHeight: 220,
              }}
            >
              <AgentFeed logs={step.feedLogs} />
            </div>
          </div>
        </main>

        {/* ─── Step Simulation Controls ─────────────────────────── */}
        <footer
          className="flex-shrink-0 border-t px-5 py-3 flex items-center gap-4"
          style={{
            borderColor: "var(--border-subtle)",
            background: "rgba(15,23,42,0.9)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Step breadcrumb */}
          <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
            {STEP_LABELS.map((label, idx) => (
              <button
                key={idx}
                onClick={() => goToStep(idx)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-300 flex-shrink-0"
                style={{
                  background: idx === currentStep ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${idx === currentStep ? "rgba(96,165,250,0.3)" : "var(--border-subtle)"}`,
                  color: idx === currentStep ? "#93C5FD" : idx < currentStep ? "var(--text-secondary)" : "var(--text-muted)",
                  cursor: "pointer",
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {idx < currentStep ? (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4L3 6L7 2" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <span
                    className="mono"
                    style={{
                      fontSize: 9,
                      color: idx === currentStep ? "#60A5FA" : "var(--text-muted)",
                    }}
                  >
                    {idx + 1}
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: idx === currentStep ? 500 : 400 }}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Keyboard hint */}
            {keyboardHint && (
              <span
                className="mono text-xs hidden lg:block"
                style={{
                  color: "var(--text-muted)",
                  fontSize: 10,
                  opacity: 0.6,
                  animation: "fade-in 0.5s ease both",
                }}
              >
                ← → or Space to navigate
              </span>
            )}

            <button
              onClick={resetWorkflow}
              disabled={isFirst}
              className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-subtle)",
                color: isFirst ? "var(--text-muted)" : "var(--text-secondary)",
                cursor: isFirst ? "not-allowed" : "pointer",
                opacity: isFirst ? 0.4 : 1,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 5a4 4 0 1 1 .7 2.3M1 2.5v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Reset
            </button>

            <button
              onClick={prevStep}
              disabled={isFirst}
              className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-subtle)",
                color: isFirst ? "var(--text-muted)" : "var(--text-secondary)",
                cursor: isFirst ? "not-allowed" : "pointer",
                opacity: isFirst ? 0.4 : 1,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M6 2L3 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Prev
            </button>

            <button
              onClick={nextStep}
              disabled={isLast}
              className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: isLast ? "rgba(255,255,255,0.03)" : "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(129,140,248,0.15))",
                border: `1px solid ${isLast ? "var(--border-subtle)" : "rgba(96,165,250,0.35)"}`,
                color: isLast ? "var(--text-muted)" : "#93C5FD",
                cursor: isLast ? "not-allowed" : "pointer",
                opacity: isLast ? 0.4 : 1,
                boxShadow: isLast ? "none" : "0 0 12px rgba(96,165,250,0.1)",
              }}
            >
              {isLast ? "Workflow Complete" : `Next: ${STEP_LABELS[currentStep + 1]}`}
              {!isLast && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M4 2L7 5l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Progress indicator */}
          <div
            className="flex items-center gap-2 flex-shrink-0"
            style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: 16 }}
          >
            <div
              className="relative h-1 rounded-full overflow-hidden"
              style={{ width: 64, background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  background: "linear-gradient(90deg, #60A5FA, #818CF8)",
                  width: `${(currentStep / (totalSteps - 1)) * 100}%`,
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
            <span
              className="mono text-xs"
              style={{ color: "var(--text-muted)", fontSize: 10, minWidth: 32 }}
            >
              {currentStep}/{totalSteps - 1}
            </span>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes ring-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}