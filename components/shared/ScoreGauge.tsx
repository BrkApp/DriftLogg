"use client";

import { useEffect, useRef, useState } from "react";

type Size = "sm" | "md" | "lg";

interface ScoreGaugeProps {
  score: number;
  size?: Size;
  animated?: boolean;
}

const DIMENSIONS: Record<Size, { px: number; stroke: number; numClass: string }> = {
  sm: { px: 80, stroke: 6, numClass: "text-xl" },
  md: { px: 140, stroke: 10, numClass: "text-3xl" },
  lg: { px: 200, stroke: 14, numClass: "text-5xl" },
};

function colorForScore(score: number): string {
  if (score >= 80) return "var(--dl-green)";
  if (score >= 60) return "var(--dl-amber)";
  if (score >= 35) return "var(--dl-orange)";
  return "var(--dl-red)";
}

export function ScoreGauge({ score, size = "lg", animated = true }: ScoreGaugeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) {
      setShown(score);
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(score);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 1200;
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setShown(Math.round(score * eased));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      },
      { threshold: 0.4 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [score, animated]);

  const { px, stroke, numClass } = DIMENSIONS[size];
  const radius = (px - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = colorForScore(score);
  const offset = circumference - (shown / 100) * circumference;

  return (
    <div ref={ref} className="relative" style={{ width: px, height: px }}>
      <svg width={px} height={px} className="-rotate-90">
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke="var(--dl-border)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition:
              "stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1), stroke 500ms ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-mono font-bold tabular-nums leading-none ${numClass}`}
          style={{ color }}
        >
          {shown}
        </span>
        {size !== "sm" && (
          <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-dl-fg-muted">
            / 100
          </span>
        )}
      </div>
    </div>
  );
}
