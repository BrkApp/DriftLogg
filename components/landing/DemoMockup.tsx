"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { Reveal } from "./Reveal";
import { ScoreGauge } from "@/components/shared/ScoreGauge";
import { RiskBadge } from "@/components/shared/RiskBadge";

interface DimRow {
  label: string;
  value: number;
  max: number;
  tone: "red" | "amber" | "green";
}

const ROWS: DimRow[] = [
  { label: "Velocity", value: 3, max: 25, tone: "red" },
  { label: "Responsiveness", value: 4, max: 20, tone: "red" },
  { label: "Community", value: 8, max: 15, tone: "amber" },
  { label: "Freshness", value: 2, max: 15, tone: "red" },
  { label: "Trust", value: 7, max: 10, tone: "green" },
  { label: "Social", value: 10, max: 15, tone: "amber" },
];

const TONE: Record<DimRow["tone"], string> = {
  red: "var(--dl-red)",
  amber: "var(--dl-amber)",
  green: "var(--dl-green)",
};

export function DemoMockup() {
  return (
    <section className="border-t border-dl-border">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="rounded-xl border border-dl-border bg-dl-surface p-5 shadow-[0_30px_120px_-40px_rgba(0,255,136,0.15)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-base font-medium text-dl-fg sm:text-[18px]">
                moment/moment
              </span>
              <RiskBadge risk="critical" />
            </div>

            <div className="mt-7 grid gap-8 md:grid-cols-[auto,1fr] md:gap-10">
              <div className="flex justify-center md:justify-start">
                <ScoreGauge score={34} size="md" animated />
              </div>
              <div className="space-y-4">
                {ROWS.map((row, i) => (
                  <BreakdownRow key={row.label} row={row} delay={i * 80} />
                ))}
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <SignalCard tone="red" text="No commits in 67 days" />
              <SignalCard tone="amber" text="Single maintainer — bus factor risk" />
              <SignalCard tone="amber" text="12 unresolved security issues" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BreakdownRow({ row, delay }: { row: DimRow; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setPct((row.value / row.max) * 100);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setPct((row.value / row.max) * 100), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [row.value, row.max, delay]);

  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between font-mono text-xs">
        <span className="text-dl-fg">{row.label}</span>
        <span className="tabular-nums text-dl-fg-muted">
          {row.value} / {row.max}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-dl-border">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: TONE[row.tone],
            transition: "width 900ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
    </div>
  );
}

function SignalCard({
  tone,
  text,
}: {
  tone: "red" | "amber";
  text: string;
}) {
  const Icon = tone === "red" ? XCircle : AlertTriangle;
  const color = tone === "red" ? "var(--dl-red)" : "var(--dl-amber)";
  const border = tone === "red" ? "border-dl-red/30" : "border-dl-amber/30";
  const bg = tone === "red" ? "bg-dl-red/5" : "bg-dl-amber/5";
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border p-3 ${border} ${bg}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
      <span className="text-sm text-dl-fg">{text}</span>
    </div>
  );
}

