import { Progress } from "@/components/ui/progress";
import type { ScoreBreakdown } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Record<keyof ScoreBreakdown, string> = {
  commits: "Commit cadence",
  issues: "Issue triage",
  releases: "Release health",
  maintenance: "Maintenance status",
  community: "Community vitality",
};

function indicatorColor(value: number) {
  if (value >= 75) return "bg-emerald-500";
  if (value >= 55) return "bg-lime-500";
  if (value >= 35) return "bg-amber-500";
  if (value >= 15) return "bg-orange-500";
  return "bg-red-500";
}

export function Breakdown({ breakdown }: { breakdown: ScoreBreakdown }) {
  const entries = Object.entries(breakdown) as [keyof ScoreBreakdown, number][];
  return (
    <div className="space-y-5">
      {entries.map(([key, value]) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{LABELS[key]}</span>
            <span className="tabular-nums text-muted-foreground">{value} / 100</span>
          </div>
          <Progress
            value={value}
            indicatorClassName={cn(indicatorColor(value))}
          />
        </div>
      ))}
    </div>
  );
}
