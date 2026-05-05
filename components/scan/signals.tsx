import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthSignal } from "@/lib/types";

const ICONS = {
  positive: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
} as const;

const STYLES = {
  positive: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  critical: "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400",
} as const;

export function Signals({ signals }: { signals: HealthSignal[] }) {
  if (signals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No remarkable signals — repo looks unremarkable in either direction.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {signals.map((s, i) => {
        const Icon = ICONS[s.level];
        return (
          <li
            key={i}
            className={cn("flex gap-3 rounded-lg border p-4", STYLES[s.level])}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">{s.label}</p>
              <p className="text-sm opacity-90">{s.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
