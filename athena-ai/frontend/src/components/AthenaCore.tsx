"use client";

import { useEffect, useRef, useState } from "react";

interface AthenaCoreProps {
  status: "idle" | "processing" | "alert" | "resolved";
  stepIndex: number;
}

const STATUS_CONFIG = {
  idle: {
    primaryColor: "#818CF8",
    secondaryColor: "#60A5FA",
    glowColor: "rgba(129, 140, 248, 0.3)",
    outerGlow: "rgba(129, 140, 248, 0.08)",
    label: "MONITORING",
    sublabel: "All systems nominal",
    pulseSpeed: "4s",
  },
  processing: {
    primaryColor: "#60A5FA",
    secondaryColor: "#34D399",
    glowColor: "rgba(96, 165, 250, 0.35)",
    outerGlow: "rgba(96, 165, 250, 0.1)",
    label: "PROCESSING",
    sublabel: "Agents active",
    pulseSpeed: "1.8s",
  },
  alert: {
    primaryColor: "#FBBF24",
    secondaryColor: "#FB7185",
    glowColor: "rgba(251, 191, 36, 0.3)",
    outerGlow: "rgba(251, 191, 36, 0.08)",
    label: "ALERT",
    sublabel: "Intervention required",
    pulseSpeed: "1.2s",
  },
  resolved: {
    primaryColor: "#34D399",
    secondaryColor: "#60A5FA",
    glowColor: "rgba(52, 211, 153, 0.35)",
    outerGlow: "rgba(52, 211, 153, 0.1)",
    label: "RESOLVED",
    sublabel: "Incident closed",
    pulseSpeed: "3s",
  },
};

export default function AthenaCore({ status, stepIndex }: AthenaCoreProps) {
  const config = STATUS_CONFIG[status];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Canvas particle ring effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 200;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const cx = SIZE / 2;
    const cy = SIZE / 2;

    const particles: {
      angle: number;
      radius: number;
      speed: number;
      size: number;
      opacity: number;
      layer: number;
    }[] = Array.from({ length: 32 }, (_, i) => ({
      angle: (i / 32) * Math.PI * 2,
      radius: 60 + Math.random() * 20,
      speed: 0.003 + Math.random() * 0.004,
      size: 1 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.6,
      layer: i % 3,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Inner glow
      const breathe = Math.sin(t * (status === "processing" ? 2.8 : status === "alert" ? 4 : 1.2)) * 0.15 + 0.85;
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 38 * breathe);
      innerGrad.addColorStop(0, hexToRgba(config.primaryColor, 0.25));
      innerGrad.addColorStop(0.6, hexToRgba(config.primaryColor, 0.08));
      innerGrad.addColorStop(1, "transparent");
      ctx.fillStyle = innerGrad;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Orbit particles
      particles.forEach((p) => {
        const speedMultiplier = status === "processing" ? 2 : status === "alert" ? 3 : 1;
        p.angle += p.speed * speedMultiplier;
        const jitter = Math.sin(t * 2 + p.angle * 3) * 3;
        const r = p.radius + jitter;
        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle) * r;
        const pulseOpacity = p.opacity * (0.7 + Math.sin(t * 3 + p.angle) * 0.3);

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(p.layer === 0 ? config.primaryColor : p.layer === 1 ? config.secondaryColor : "#A78BFA", pulseOpacity);
        ctx.fill();
      });

      // Outer ring arcs
      const arcAlpha = 0.15 + Math.sin(t * 1.5) * 0.08;
      ctx.strokeStyle = hexToRgba(config.primaryColor, arcAlpha);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, 78, t * 0.3, t * 0.3 + Math.PI * 1.4);
      ctx.stroke();

      ctx.strokeStyle = hexToRgba(config.secondaryColor, arcAlpha * 0.7);
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 12]);
      ctx.beginPath();
      ctx.arc(cx, cy, 86, -t * 0.2, -t * 0.2 + Math.PI * 1.1);
      ctx.stroke();

      ctx.setLineDash([]);
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [status, config.primaryColor, config.secondaryColor]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Core Container */}
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        {/* Outer ambient glow */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${config.outerGlow} 0%, transparent 70%)`,
            transform: "scale(1.4)",
          }}
        />

        {/* Canvas particles */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ width: 200, height: 200 }}
        />

        {/* Central Orb */}
        <div
          className="relative z-10 flex items-center justify-center rounded-full transition-all duration-700"
          style={{
            width: 80,
            height: 80,
            background: `radial-gradient(circle at 35% 35%, ${config.primaryColor}22, ${config.secondaryColor}11)`,
            border: `1px solid ${config.primaryColor}40`,
            boxShadow: `
              0 0 30px ${config.glowColor},
              0 0 60px ${config.outerGlow},
              inset 0 1px 0 ${config.primaryColor}30,
              inset 0 0 20px ${config.primaryColor}10
            `,
            animation: `orb-breathe ${config.pulseSpeed} ease-in-out infinite`,
          }}
        >
          {/* Inner iris */}
          <div
            className="relative flex items-center justify-center rounded-full transition-all duration-700"
            style={{
              width: 48,
              height: 48,
              background: `radial-gradient(circle at 40% 30%, ${config.primaryColor}30, transparent 70%)`,
              border: `1px solid ${config.primaryColor}25`,
            }}
          >
            {/* Athena A icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3L20 19H4L12 3Z"
                stroke={config.primaryColor}
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
                opacity="0.9"
              />
              <path
                d="M8.5 14H15.5"
                stroke={config.primaryColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>

            {/* Center dot */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-500"
              style={{
                width: 4,
                height: 4,
                background: config.primaryColor,
                boxShadow: `0 0 8px ${config.primaryColor}`,
              }}
            />
          </div>
        </div>

        {/* Processing ring */}
        {status === "processing" && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `1px solid ${config.primaryColor}20`,
              animation: "ring-rotate 3s linear infinite",
              background: `conic-gradient(from 0deg, transparent 70%, ${config.primaryColor}30 100%)`,
            }}
          />
        )}

        {/* Alert pulse rings */}
        {status === "alert" && (
          <>
            <div
              className="absolute rounded-full"
              style={{
                width: 110,
                height: 110,
                border: `1px solid ${config.primaryColor}25`,
                animation: "alert-ring 1.5s ease-out infinite",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 110,
                height: 110,
                border: `1px solid ${config.primaryColor}15`,
                animation: "alert-ring 1.5s ease-out 0.5s infinite",
              }}
            />
          </>
        )}
      </div>

      {/* State Label */}
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2">
          <div
            className="status-dot transition-all duration-500"
            style={{
              background: config.primaryColor,
              boxShadow: `0 0 8px ${config.glowColor}`,
              animation: status !== "idle" ? `dot-pulse-brand 1.5s ease-in-out infinite` : "none",
            }}
          />
          <span
            className="mono text-xs font-medium tracking-[0.12em] transition-colors duration-500"
            style={{ color: config.primaryColor }}
          >
            {config.label}
          </span>
        </div>
        <p className="text-xs text-muted" style={{ color: "var(--text-muted)" }}>
          {config.sublabel}
        </p>
        {stepIndex > 0 && (
          <div
            className="label-tag label-tag-brand mt-1 transition-all duration-300"
            style={{ animationDelay: "0.2s" }}
          >
            Step {stepIndex} of 6
          </div>
        )}
      </div>

      <style>{`
        @keyframes alert-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes orb-breathe {
          0%, 100% {
            box-shadow: 0 0 30px ${config.glowColor}, 0 0 60px ${config.outerGlow}, inset 0 1px 0 ${config.primaryColor}30, inset 0 0 20px ${config.primaryColor}10;
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 50px ${config.glowColor}, 0 0 100px ${config.outerGlow}, inset 0 1px 0 ${config.primaryColor}40, inset 0 0 35px ${config.primaryColor}18;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}