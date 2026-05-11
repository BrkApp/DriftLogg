import type { Risk } from "@/lib/types";

export type { Risk };

const STYLES: Record<Risk, { label: string; bg: string; text: string }> = {
  critical: { label: "CRITICAL", bg: "bg-dl-red", text: "text-white" },
  high: { label: "HIGH RISK", bg: "bg-dl-orange", text: "text-white" },
  medium: { label: "MEDIUM", bg: "bg-dl-amber", text: "text-black" },
  low: { label: "HEALTHY", bg: "bg-dl-green", text: "text-black" },
};

interface RiskBadgeProps {
  risk: Risk;
  className?: string;
}

export function RiskBadge({ risk, className = "" }: RiskBadgeProps) {
  const s = STYLES[risk];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider ${s.bg} ${s.text} ${className}`}
    >
      {s.label}
    </span>
  );
}
