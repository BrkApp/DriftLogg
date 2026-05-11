import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { classifySignal } from "@/lib/utils";

interface SignalItemProps {
  signal: string;
  index: number;
}

function SignalItem({ signal, index }: SignalItemProps) {
  const level = classifySignal(signal);

  const meta =
    level === "critical"
      ? { Icon: XCircle, color: "text-dl-red", border: "border-dl-red/30", bg: "bg-dl-red/5" }
      : level === "warning"
      ? {
          Icon: AlertTriangle,
          color: "text-dl-amber",
          border: "border-dl-amber/30",
          bg: "bg-dl-amber/5",
        }
      : {
          Icon: CheckCircle2,
          color: "text-dl-green",
          border: "border-dl-green/30",
          bg: "bg-dl-green/5",
        };

  const Icon = meta.Icon;
  return (
    <li
      className={`flex items-start gap-3 rounded-lg border p-3 ${meta.border} ${meta.bg}`}
      style={{ animation: `fade-in 0.4s ease-out ${index * 70}ms both` }}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.color}`} />
      <span className="text-sm text-dl-fg">{signal}</span>
    </li>
  );
}

interface SignalsSectionProps {
  signals: string[];
}

export function SignalsSection({ signals }: SignalsSectionProps) {
  return (
    <section className="rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8">
      <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-dl-fg-muted">
        {"// detected signals"}
      </h2>
      {signals.length === 0 ? (
        <p className="mt-4 text-sm text-dl-fg-muted">No notable signals detected.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {signals.map((s, i) => (
            <SignalItem key={i} signal={s} index={i} />
          ))}
        </ul>
      )}
    </section>
  );
}
