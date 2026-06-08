"use client";

import { useEffect, useRef, useState } from "react";
import type { FeedLog } from "@/hooks/useWorkflowSim";

interface AgentFeedProps {
  logs: FeedLog[];
}

const LEVEL_CONFIG = {
  info: { color: "#94A3B8", icon: "○", accent: "rgba(148,163,184,0.08)" },
  warn: { color: "#FBBF24", icon: "◈", accent: "rgba(251,191,36,0.06)" },
  success: { color: "#34D399", icon: "◉", accent: "rgba(52,211,153,0.06)" },
  system: { color: "#818CF8", icon: "◆", accent: "rgba(129,140,248,0.08)" },
};

const AGENT_LABEL_COLORS: Record<string, string> = {
  OBS: "#60A5FA",
  INV: "#818CF8",
  PRD: "#A78BFA",
  STR: "#34D399",
  DEC: "#FBBF24",
  RPT: "#93C5FD",
  SYSTEM: "#94A3B8",
};

function TypedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setStarted(false);
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 12);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "12px",
            background: "#60A5FA",
            marginLeft: "1px",
            verticalAlign: "text-bottom",
            animation: "cursor-blink 0.7s ease-in-out infinite",
          }}
        />
      )}
    </span>
  );
}

export default function AgentFeed({ logs }: AgentFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [visibleLogs, setVisibleLogs] = useState<FeedLog[]>([]);
  const prevLogsRef = useRef<string>("");

  useEffect(() => {
    const key = logs.map((l) => l.id).join(",");
    if (key === prevLogsRef.current) return;
    prevLogsRef.current = key;
    setVisibleLogs(logs);
  }, [logs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleLogs]);

  return (
    <div className="flex flex-col h-full">
      {/* Terminal Header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40 border border-yellow-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/40 border border-green-500/30" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="mono text-xs" style={{ color: "var(--text-muted)", fontSize: 10 }}>
            athena://agent-orchestrator · stream active
          </span>
          <div className="status-dot status-dot-processing" style={{ width: 5, height: 5 }} />
        </div>
        <span className="mono text-xs" style={{ color: "var(--text-muted)", fontSize: 9 }}>
          {visibleLogs.length} events
        </span>
      </div>

      {/* Log Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1" style={{ minHeight: 0 }}>
        {visibleLogs.length === 0 ? (
          <div className="flex items-center gap-2 py-2 px-1">
            <span style={{ color: "var(--text-muted)" }} className="mono text-xs">
              Waiting for agent activity...
            </span>
          </div>
        ) : (
          visibleLogs.map((log, idx) => {
            const lc = LEVEL_CONFIG[log.level];
            const agentColor = AGENT_LABEL_COLORS[log.agent] || "#94A3B8";
            const isLatest = idx === visibleLogs.length - 1;

            return (
              <div
                key={log.id}
                className="group flex items-start gap-2.5 px-2 py-1.5 rounded-lg transition-all duration-300"
                style={{
                  background: isLatest ? lc.accent : "transparent",
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                {/* Level icon */}
                <span
                  className="mono flex-shrink-0 mt-px"
                  style={{ color: lc.color, fontSize: 10, lineHeight: "16px" }}
                >
                  {lc.icon}
                </span>

                {/* Timestamp */}
                <span
                  className="mono flex-shrink-0 text-xs"
                  style={{ color: "var(--text-muted)", fontSize: 9, lineHeight: "16px", opacity: 0.6 }}
                >
                  {log.timestamp}
                </span>

                {/* Agent tag */}
                <span
                  className="mono flex-shrink-0 text-xs font-medium"
                  style={{ color: agentColor, fontSize: 9, lineHeight: "16px" }}
                >
                  [{log.agent}]
                </span>

                {/* Message */}
                <span
                  className="mono text-xs flex-1 leading-relaxed"
                  style={{ color: isLatest ? lc.color : "var(--text-secondary)", fontSize: 11, lineHeight: 1.5 }}
                >
                  {isLatest ? (
                    <TypedText text={log.message} delay={0} />
                  ) : (
                    log.message
                  )}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}