import { Check, Minus, X } from "lucide-react";
import { Reveal } from "./Reveal";

type Cell = "yes" | "no" | "partial" | "sunset";

interface Row {
  feature: string;
  driftlogg: Cell;
  ossf: Cell;
  snyk: Cell;
}

const ROWS: Row[] = [
  { feature: "Health score 0–100",          driftlogg: "yes",     ossf: "partial", snyk: "sunset" },
  { feature: "Free on-demand scan",          driftlogg: "yes",     ossf: "yes",     snyk: "sunset" },
  { feature: "Continuous monitoring",        driftlogg: "yes",     ossf: "no",      snyk: "sunset" },
  { feature: "Email / Slack digest",         driftlogg: "yes",     ossf: "no",      snyk: "sunset" },
  { feature: "Alternative recommendations",  driftlogg: "yes",     ossf: "no",      snyk: "no"     },
  { feature: "Human-readable digest",        driftlogg: "yes",     ossf: "no",      snyk: "sunset" },
  { feature: "Still maintained",             driftlogg: "yes",     ossf: "yes",     snyk: "no"     },
];

function CellIcon({ value }: { value: Cell }) {
  if (value === "yes")
    return <Check className="mx-auto h-4 w-4 text-dl-green" aria-label="Yes" />;
  if (value === "no")
    return <X className="mx-auto h-4 w-4 text-dl-fg-muted/40" aria-label="No" />;
  if (value === "partial")
    return <Minus className="mx-auto h-4 w-4 text-dl-amber" aria-label="Partial" />;
  return (
    <span className="mx-auto block text-center font-mono text-[10px] uppercase tracking-wider text-dl-red">
      sunset
    </span>
  );
}

export function ComparisonSection() {
  return (
    <section className="border-t border-dl-border">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-dl-fg sm:text-[32px]">
            Why DriftLogg
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-3 max-w-2xl text-base text-dl-fg-muted">
            Snyk Advisor sunset in January 2026. OSSF Scorecard is a CLI for
            security engineers — not a monitoring service for teams. DriftLogg
            fills the gap.
          </p>
        </Reveal>
        <Reveal delay={160}>
          <div className="mt-10 overflow-x-auto rounded-xl border border-dl-border">
            <table className="w-full min-w-[540px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-dl-border bg-dl-surface">
                  <th
                    scope="col"
                    className="py-4 pl-5 pr-4 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted"
                  />
                  <th
                    scope="col"
                    className="px-5 py-4 text-center font-mono text-xs font-bold uppercase tracking-wider text-dl-green"
                  >
                    DriftLogg
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 text-center font-mono text-xs uppercase tracking-wider text-dl-fg-muted"
                  >
                    OSSF Scorecard
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 text-center font-mono text-xs uppercase tracking-wider text-dl-fg-muted"
                  >
                    Snyk Advisor
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-dl-border/50 last:border-0 ${
                      i % 2 === 0 ? "" : "bg-dl-surface/40"
                    }`}
                  >
                    <td className="py-3.5 pl-5 pr-4 text-sm text-dl-fg">
                      {row.feature}
                    </td>
                    <td className="px-5 py-3.5">
                      <CellIcon value={row.driftlogg} />
                    </td>
                    <td className="px-5 py-3.5">
                      <CellIcon value={row.ossf} />
                    </td>
                    <td className="px-5 py-3.5">
                      <CellIcon value={row.snyk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
