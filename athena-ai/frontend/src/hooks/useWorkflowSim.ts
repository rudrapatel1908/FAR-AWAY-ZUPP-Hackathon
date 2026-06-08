"use client";

import { useState, useCallback, useRef } from "react";

export type AgentStatus = "idle" | "processing" | "complete" | "error";

export interface AgentState {
  id: number;
  name: string;
  label: string;
  status: AgentStatus;
  detail: string;
  completedAt?: number;
}

export interface WorkflowStep {
  stepIndex: number;
  label: string;
  description: string;
  activeAgent: number; // 0-indexed
  agents: AgentState[];
  kpis: KPIState;
  feedLogs: FeedLog[];
  systemStatus: "idle" | "processing" | "alert" | "resolved";
}

export interface KPIState {
  revenueRisk: number;
  rootCauseConfidence: number;
  delayProbability: number;
  realizedSavings: number;
  decisionsExecuted: number;
  activeAlerts: number;
}

export interface FeedLog {
  id: string;
  timestamp: string;
  agent: string;
  level: "info" | "warn" | "success" | "system";
  message: string;
}

const INITIAL_AGENTS: AgentState[] = [
  { id: 0, name: "Observer", label: "OBS", status: "idle", detail: "Awaiting data streams" },
  { id: 1, name: "Investigation", label: "INV", status: "idle", detail: "Standing by" },
  { id: 2, name: "Prediction", label: "PRD", status: "idle", detail: "Models loaded" },
  { id: 3, name: "Strategy", label: "STR", status: "idle", detail: "Simulation engines ready" },
  { id: 4, name: "Decision Engine", label: "DEC", status: "idle", detail: "Human-in-loop active" },
  { id: 5, name: "Reporting", label: "RPT", status: "idle", detail: "PDF generator standby" },
];

function ts(): string {
  return new Date().toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const STEPS: WorkflowStep[] = [
  {
    stepIndex: 0,
    label: "System Idle",
    description: "Athena AI monitoring enterprise data streams",
    activeAgent: -1,
    systemStatus: "idle",
    agents: INITIAL_AGENTS.map((a) => ({ ...a })),
    kpis: {
      revenueRisk: 0,
      rootCauseConfidence: 0,
      delayProbability: 0,
      realizedSavings: 0,
      decisionsExecuted: 0,
      activeAlerts: 0,
    },
    feedLogs: [
      { id: "l0a", timestamp: ts(), agent: "SYSTEM", level: "system", message: "Athena AI v3.0 — All systems nominal" },
      { id: "l0b", timestamp: ts(), agent: "SYSTEM", level: "info", message: "LangGraph orchestrator online · 6 agents registered" },
      { id: "l0c", timestamp: ts(), agent: "SYSTEM", level: "info", message: "WebSocket data streams: connected · Heartbeat OK" },
    ],
  },
  {
    stepIndex: 1,
    label: "Anomaly Detected",
    description: "Observer Agent flags critical supply chain disruption",
    activeAgent: 0,
    systemStatus: "alert",
    agents: INITIAL_AGENTS.map((a, i) =>
      i === 0
        ? { ...a, status: "processing", detail: "Scanning 14 data streams..." }
        : { ...a }
    ),
    kpis: {
      revenueRisk: 1250000,
      rootCauseConfidence: 0,
      delayProbability: 0,
      realizedSavings: 0,
      decisionsExecuted: 0,
      activeAlerts: 3,
    },
    feedLogs: [
      { id: "l1a", timestamp: ts(), agent: "OBS", level: "warn", message: "⚠ Anomaly detected · Supplier node #SK-441 latency +340%" },
      { id: "l1b", timestamp: ts(), agent: "OBS", level: "warn", message: "Cross-referencing 847 historical patterns..." },
      { id: "l1c", timestamp: ts(), agent: "OBS", level: "info", message: "Confidence threshold exceeded · Escalating to Investigation Agent" },
      { id: "l1d", timestamp: ts(), agent: "SYSTEM", level: "warn", message: "Revenue exposure window: OPEN · ₹1,250,000 at risk" },
    ],
  },
  {
    stepIndex: 2,
    label: "Root Cause Analysis",
    description: "Investigation Agent isolates failure node with 91.4% confidence",
    activeAgent: 1,
    systemStatus: "processing",
    agents: INITIAL_AGENTS.map((a, i) => {
      if (i === 0) return { ...a, status: "complete", detail: "3 anomalies flagged" };
      if (i === 1) return { ...a, status: "processing", detail: "Causal graph traversal..." };
      return { ...a };
    }),
    kpis: {
      revenueRisk: 1250000,
      rootCauseConfidence: 91.4,
      delayProbability: 0,
      realizedSavings: 0,
      decisionsExecuted: 0,
      activeAlerts: 3,
    },
    feedLogs: [
      { id: "l2a", timestamp: ts(), agent: "INV", level: "info", message: "Causal graph initialized · 2,341 nodes mapped" },
      { id: "l2b", timestamp: ts(), agent: "INV", level: "info", message: "Bayesian inference: running 40,000 simulations..." },
      { id: "l2c", timestamp: ts(), agent: "INV", level: "success", message: "Root cause isolated: Port congestion at Nhava Sheva" },
      { id: "l2d", timestamp: ts(), agent: "INV", level: "success", message: "Confidence score: 91.4% · Secondary factor: Customs delay +72hr" },
    ],
  },
  {
    stepIndex: 3,
    label: "Risk Forecasting",
    description: "Prediction Agent models 5-day financial exposure trajectory",
    activeAgent: 2,
    systemStatus: "processing",
    agents: INITIAL_AGENTS.map((a, i) => {
      if (i <= 1) return { ...a, status: "complete", detail: i === 0 ? "3 anomalies flagged" : "Root cause: 91.4% confidence" };
      if (i === 2) return { ...a, status: "processing", detail: "Running LSTM forecast..." };
      return { ...a };
    }),
    kpis: {
      revenueRisk: 1250000,
      rootCauseConfidence: 91.4,
      delayProbability: 78,
      realizedSavings: 0,
      decisionsExecuted: 0,
      activeAlerts: 3,
    },
    feedLogs: [
      { id: "l3a", timestamp: ts(), agent: "PRD", level: "info", message: "LSTM model loaded · 18-month training window active" },
      { id: "l3b", timestamp: ts(), agent: "PRD", level: "info", message: "Forecasting 5-day delay probability distribution..." },
      { id: "l3c", timestamp: ts(), agent: "PRD", level: "warn", message: "P(delay > 3 days) = 78% · High confidence interval" },
      { id: "l3d", timestamp: ts(), agent: "PRD", level: "warn", message: "Cascading risk: 4 downstream SKUs affected · ₹1.25M exposure confirmed" },
    ],
  },
  {
    stepIndex: 4,
    label: "Strategy Simulation",
    description: "Strategy Agent evaluates 3 alternative execution paths",
    activeAgent: 3,
    systemStatus: "processing",
    agents: INITIAL_AGENTS.map((a, i) => {
      if (i <= 2) return { ...a, status: "complete", detail: ["3 anomalies flagged", "Root cause: 91.4% confidence", "Delay risk: 78%"][i] };
      if (i === 3) return { ...a, status: "processing", detail: "Monte Carlo: 10k simulations" };
      return { ...a };
    }),
    kpis: {
      revenueRisk: 1250000,
      rootCauseConfidence: 91.4,
      delayProbability: 78,
      realizedSavings: 0,
      decisionsExecuted: 0,
      activeAlerts: 3,
    },
    feedLogs: [
      { id: "l4a", timestamp: ts(), agent: "STR", level: "info", message: "Simulating Option A: Air freight diversion · ₹380,000 cost" },
      { id: "l4b", timestamp: ts(), agent: "STR", level: "info", message: "Simulating Option B: Secondary supplier activation · ₹210,000 cost" },
      { id: "l4c", timestamp: ts(), agent: "STR", level: "info", message: "Simulating Option C: Partial air + buffer stock draw · ₹155,000 cost" },
      { id: "l4d", timestamp: ts(), agent: "STR", level: "success", message: "Optimal path identified: Option C · Net savings ₹870,000 vs exposure" },
    ],
  },
  {
    stepIndex: 5,
    label: "Decision Pending",
    description: "Decision Engine awaits human override — auto-executes in 30s",
    activeAgent: 4,
    systemStatus: "alert",
    agents: INITIAL_AGENTS.map((a, i) => {
      if (i <= 3) return { ...a, status: "complete", detail: ["3 anomalies flagged", "Root cause: 91.4%", "Delay risk: 78%", "Option C selected"][i] };
      if (i === 4) return { ...a, status: "processing", detail: "Awaiting human approval..." };
      return { ...a };
    }),
    kpis: {
      revenueRisk: 1250000,
      rootCauseConfidence: 91.4,
      delayProbability: 78,
      realizedSavings: 0,
      decisionsExecuted: 0,
      activeAlerts: 3,
    },
    feedLogs: [
      { id: "l5a", timestamp: ts(), agent: "DEC", level: "system", message: "🔔 Human-in-loop checkpoint triggered" },
      { id: "l5b", timestamp: ts(), agent: "DEC", level: "info", message: "Recommended action: Execute Option C · Confidence 94.1%" },
      { id: "l5c", timestamp: ts(), agent: "DEC", level: "warn", message: "Auto-execution countdown: 30 seconds · Override available" },
      { id: "l5d", timestamp: ts(), agent: "DEC", level: "info", message: "Awaiting executive sign-off — Dhruv Malhotra (COO)" },
    ],
  },
  {
    stepIndex: 6,
    label: "Executed & Resolved",
    description: "Action executed — ₹870,000 in losses prevented. Report generating.",
    activeAgent: 5,
    systemStatus: "resolved",
    agents: INITIAL_AGENTS.map((a, i) => {
      if (i <= 4) return { ...a, status: "complete", detail: ["3 anomalies flagged", "Root cause: 91.4%", "Delay risk: 78%", "Option C selected", "Executed 09:42 IST"][i] };
      return { ...a, status: "processing", detail: "Compiling executive PDF..." };
    }),
    kpis: {
      revenueRisk: 380000,
      rootCauseConfidence: 91.4,
      delayProbability: 22,
      realizedSavings: 870000,
      decisionsExecuted: 1,
      activeAlerts: 1,
    },
    feedLogs: [
      { id: "l6a", timestamp: ts(), agent: "DEC", level: "success", message: "✓ Decision approved by COO · Execution authorized" },
      { id: "l6b", timestamp: ts(), agent: "DEC", level: "success", message: "Option C dispatched: Air cargo booked · Supplier B activated" },
      { id: "l6c", timestamp: ts(), agent: "RPT", level: "info", message: "Compiling executive summary: 6 pages · 14 charts..." },
      { id: "l6d", timestamp: ts(), agent: "RPT", level: "success", message: "✓ PDF report ready · Dispatched to board distribution list" },
      { id: "l6e", timestamp: ts(), agent: "SYSTEM", level: "success", message: "🎯 Incident resolved · Net savings: ₹870,000 · Athena returning to monitor mode" },
    ],
  },
];

export function useWorkflowSim() {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = STEPS.length;

  const step = STEPS[currentStep];

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const resetWorkflow = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const goToStep = useCallback((idx: number) => {
    setCurrentStep(Math.max(0, Math.min(idx, totalSteps - 1)));
  }, [totalSteps]);

  return {
    step,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    resetWorkflow,
    goToStep,
    isFirst: currentStep === 0,
    isLast: currentStep === totalSteps - 1,
  };
}