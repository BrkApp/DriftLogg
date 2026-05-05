import { cn } from "@/lib/utils";
import type { DriftRisk } from "@/lib/types";

const RISK_COLORS: Record<DriftRisk, { stroke: string; text: string; label: string }> = {
  low: { stroke: "stroke-emerald-500", text: "text-emerald-600", label: "Low drift risk" },
  moderate: { stroke: "stroke-lime-500", text: "text-lime-600", label: "Moderate drift" },
  elevated: { stroke: "stroke-amber-500", text: "text-amber-600", label: "Elevated drift" },
  high: { stroke: "stroke-orange-500", text: "text-orange-600", label: "High drift risk" },
  critical: { stroke: "stroke-red-500", text: "text-red-600", label: "Critical drift" },
};

interface ScoreRingProps {
  score: number;
  risk: DriftRisk;
  size?: number;
}

export function ScoreRing({ score, risk, size = 180 }: ScoreRingProps) {
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colors = RISK_COLORS[risk];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none stroke-secondary"
            strokeWidth={12}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={cn("fill-none transition-all duration-700", colors.stroke)}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-5xl font-bold tabular-nums", colors.text)}>
            {score}
          </span>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            / 100
          </span>
        </div>
      </div>
      <span className={cn("text-sm font-semibold", colors.text)}>{colors.label}</span>
    </div>
  );
}
