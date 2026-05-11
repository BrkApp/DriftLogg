"use client";

import { useEffect, useState } from "react";
import type { ScoreBreakdown } from "@/lib/types";
import { BREAKDOWN_MAX, BREAKDOWN_LABELS } from "@/lib/constants";

interface BreakdownRowProps {
  label: string;
  value: number;
  max: number;
  delay: number;
}

function BreakdownRow({ label, value, max, delay }: BreakdownRowProps) {
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    const target = max > 0 ? (value / max) * 100 : 0;
    const id = setTimeout(() => setAnimatedPct(target), 200 + delay);
    return () => clearTimeout(id);
  }, [value, max, delay]);

  const ratio = max > 0 ? value / max : 0;
  const fillColor =
    ratio >= 0.75
      ? "var(--dl-green)"
      : ratio >= 0.5
      ? "var(--dl-amber)"
      : ratio >= 0.25
      ? "var(--dl-orange)"
      : "var(--dl-red)";

  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-xs">
        <span className="text-dl-fg">{label}</span>
        <span className="tabular-nums text-dl-fg-muted">
          {value} / {max}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-dl-border">
        <div
          className="h-full rounded-full"
          style={{
            width: `${animatedPct}%`,
            background: fillColor,
            transition: "width 900ms cubic-bezier(0.22, 1, 0.36, 1), background 400ms ease",
          }}
        />
      </div>
    </div>
  );
}

interface BreakdownSectionProps {
  breakdown: ScoreBreakdown;
}

export function BreakdownSection({ breakdown }: BreakdownSectionProps) {
  return (
    <section className="rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8">
      <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-dl-fg-muted">
        {"// breakdown"}
      </h2>
      <div className="mt-6 space-y-5">
        {(Object.keys(BREAKDOWN_MAX) as (keyof ScoreBreakdown)[]).map((key, i) => (
          <BreakdownRow
            key={key}
            label={BREAKDOWN_LABELS[key]}
            value={breakdown[key]}
            max={BREAKDOWN_MAX[key]}
            delay={i * 100}
          />
        ))}
      </div>
    </section>
  );
}
