import { ScoreGauge } from "@/components/shared/ScoreGauge";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { timeAgo } from "@/lib/utils";
import type { Risk } from "@/lib/types";

interface ScoreSectionProps {
  score: number;
  risk: Risk;
  prediction: string;
  fromCache?: boolean;
  cachedAt?: string;
}

export function ScoreSection({ score, risk, prediction, fromCache, cachedAt }: ScoreSectionProps) {
  return (
    <section className="grid gap-6 rounded-xl border border-dl-border bg-dl-surface p-6 sm:gap-8 sm:p-8 md:grid-cols-[auto,1fr] md:items-center">
      <div className="flex flex-col items-center md:items-start">
        <ScoreGauge score={score} size="lg" animated />
        {fromCache && cachedAt && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dl-fg-muted">
            cached result · scanned {timeAgo(cachedAt)}
          </p>
        )}
      </div>
      <div>
        <RiskBadge risk={risk} />
        <p className="mt-4 text-base leading-relaxed text-dl-fg sm:mt-5 sm:text-lg md:text-xl">
          {prediction}
        </p>
      </div>
    </section>
  );
}
