"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentState } from "@/hooks/useWorkflowSim";

interface AgentGraphProps {
  agents: AgentState[];
  activeAgent: number;
}

const AGENT_COLORS = {
  idle: { node: "#334155", border: "#475569", text: "#64748B", glow: "transparent" },
  processing: { node: "#172554", border: "#60A5FA", text: "#93C5FD", glow: "rgba(96,165,250,0.25)" },
  complete: { node: "#052e16", border: "#34D399", text: "#6EE7B7", glow: "rgba(52,211,153,0.2)" },
  error: { node: "#3B0764", border: "#FB7185", text: "#FDA4AF", glow: "rgba(251,113,133,0.2)" },
};

const AGENT_ICONS = ["◉", "⬡", "◈", "⬢", "◆", "▣"];

interface Particle {
  id: number;
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
  born: number;
}

export default function AgentGraph({ agents, activeAgent }: AgentGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const lastParticleRef = useRef<number>(0);
  const particleCountRef = useRef(0);
  const [, forceUpdate] = useState(0);

  // Spawn particles for active connection
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (activeAgent <= 0) {
        particlesRef.current = particlesRef.current.filter(
          (p) => p.progress < 1
        );
        return;
      }

      const now = Date.now();
      if (now - lastParticleRef.current > 400) {
        const colors = ["#60A5FA", "#818CF8", "#A78BFA", "#93C5FD"];
        particlesRef.current.push({
          id: particleCountRef.current++,
          fromIdx: activeAgent - 1,
          toIdx: activeAgent,
          progress: 0,
          speed: 0.008 + Math.random() * 0.006,
          size: 2 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.6 + Math.random() * 0.4,
          born: now,
        });
        lastParticleRef.current = now;
      }

      // Clean up completed particles
      particlesRef.current = particlesRef.current.filter((p) => p.progress < 1.05);
    }, 80);

    return () => clearInterval(spawnInterval);
  }, [activeAgent]);

  // Animation loop
  useEffect(() => {
    let frameCount = 0;
    const animate = () => {
      particlesRef.current = particlesRef.current.map((p) => ({
        ...p,
        progress: p.progress + p.speed,
      }));

      frameCount++;
      if (frameCount % 2 === 0) {
        forceUpdate((n) => n + 1);
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const nodePositions = agents.map((_, i) => ({
    x: 60 + i * 130,
    y: 60,
  }));

  const SVG_WIDTH = 60 + (agents.length - 1) * 130 + 60;
  const SVG_HEIGHT = 120;

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative" style={{ minWidth: SVG_WIDTH }}>
        {/* SVG for connections and particles */}
        <svg
          ref={svgRef}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <defs>
            <filter id="particle-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {agents.map((_, i) => (
              <radialGradient key={i} id={`node-grad-${i}`} cx="50%" cy="40%" r="60%">
                <stop
                  offset="0%"
                  stopColor={AGENT_COLORS[agents[i].status].border}
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor={AGENT_COLORS[agents[i].status].border}
                  stopOpacity="0.05"
                />
              </radialGradient>
            ))}
          </defs>

          {/* Connection lines */}
          {agents.slice(0, -1).map((agent, i) => {
            const from = nodePositions[i];
            const to = nodePositions[i + 1];
            const isActive = i === activeAgent - 1;
            const isPast = i < activeAgent - 1 || agents[i].status === "complete";

            return (
              <g key={`conn-${i}`}>
                {/* Base line */}
                <line
                  x1={from.x + 28}
                  y1={from.y}
                  x2={to.x - 28}
                  y2={to.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
                {/* Active/completed line */}
                {isPast && (
                  <line
                    x1={from.x + 28}
                    y1={from.y}
                    x2={to.x - 28}
                    y2={to.y}
                    stroke="#34D399"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                )}
                {isActive && (
                  <>
                    <line
                      x1={from.x + 28}
                      y1={from.y}
                      x2={to.x - 28}
                      y2={to.y}
                      stroke="#60A5FA"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                    {/* Animated dashes */}
                    <line
                      x1={from.x + 28}
                      y1={from.y}
                      x2={to.x - 28}
                      y2={to.y}
                      stroke="#60A5FA"
                      strokeWidth="1.5"
                      opacity="0.5"
                      strokeDasharray="6 8"
                      style={{
                        animation: "dash-flow 1s linear infinite",
                        strokeDashoffset: 0,
                      }}
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* Particles */}
          {particlesRef.current.map((p) => {
            if (p.fromIdx < 0 || p.toIdx >= agents.length) return null;
            const from = nodePositions[p.fromIdx];
            const to = nodePositions[p.toIdx];
            const startX = from.x + 28;
            const endX = to.x - 28;
            const t = Math.max(0, Math.min(1, p.progress));
            const x = startX + (endX - startX) * t;
            const opacity = t < 0.1 ? t * 10 * p.opacity : t > 0.85 ? (1 - t) * (1 / 0.15) * p.opacity : p.opacity;

            return (
              <circle
                key={p.id}
                cx={x}
                cy={from.y}
                r={p.size}
                fill={p.color}
                opacity={opacity}
                filter="url(#particle-glow)"
              />
            );
          })}
        </svg>

        {/* Agent Nodes */}
        <div className="relative flex items-start justify-between px-0" style={{ zIndex: 2 }}>
          {agents.map((agent, i) => {
            const colors = AGENT_COLORS[agent.status];
            const isActive = agent.status === "processing";
            const isComplete = agent.status === "complete";

            return (
              <div
                key={agent.id}
                className="flex flex-col items-center gap-2 transition-all duration-700"
                style={{
                  opacity: agent.status === "idle" && i > activeAgent + 1 ? 0.4 : 1,
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Node Circle */}
                <div
                  className="relative flex items-center justify-center rounded-full transition-all duration-700"
                  style={{
                    width: 56,
                    height: 56,
                    background: colors.node,
                    border: `1.5px solid ${colors.border}`,
                    boxShadow: colors.glow !== "transparent"
                      ? `0 0 16px ${colors.glow}, 0 0 32px ${colors.glow.replace("0.2", "0.08").replace("0.25", "0.1")}, inset 0 1px 0 rgba(255,255,255,0.08)`
                      : "inset 0 1px 0 rgba(255,255,255,0.04)",
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {/* Processing pulse rings */}
                  {isActive && (
                    <>
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: `1px solid ${colors.border}`,
                          animation: "node-pulse 1.5s ease-out infinite",
                        }}
                      />
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: `1px solid ${colors.border}`,
                          animation: "node-pulse 1.5s ease-out 0.5s infinite",
                        }}
                      />
                    </>
                  )}

                  {/* Complete checkmark overlay */}
                  {isComplete ? (
                    <div className="flex flex-col items-center gap-0">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M4 10L8 14L16 6"
                          stroke={colors.border}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-0">
                      <span
                        className="mono text-base leading-none transition-colors duration-500"
                        style={{ color: colors.text, fontSize: 18 }}
                      >
                        {AGENT_ICONS[i]}
                      </span>
                    </div>
                  )}

                  {/* Active spinner arc */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(from 0deg, transparent 75%, ${colors.border}50 100%)`,
                        animation: "ring-rotate 1.5s linear infinite",
                      }}
                    />
                  )}
                </div>

                {/* Agent Label */}
                <div className="flex flex-col items-center gap-0.5 text-center" style={{ maxWidth: 80 }}>
                  <span
                    className="mono text-xs font-medium tracking-widest transition-colors duration-500"
                    style={{ color: colors.text, fontSize: 9, letterSpacing: "0.1em" }}
                  >
                    {agent.label}
                  </span>
                  <span
                    className="text-center transition-colors duration-500"
                    style={{ color: "var(--text-muted)", fontSize: 10, lineHeight: 1.3 }}
                  >
                    {agent.name}
                  </span>
                  {agent.status !== "idle" && (
                    <span
                      className="text-center transition-all duration-300"
                      style={{
                        color: isComplete ? "var(--success)" : isActive ? "#93C5FD" : "var(--text-muted)",
                        fontSize: 9,
                        lineHeight: 1.3,
                        opacity: 0.8,
                      }}
                    >
                      {agent.detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes node-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes dash-flow {
          0% { stroke-dashoffset: 14; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}