import { Reveal } from "./Reveal";

interface Item {
  name: string;
  status: "Deprecated" | "Sunset" | "Maintenance mode" | "Superseded" | "Declined";
  year: string;
  pattern: string;
}

const ITEMS: Item[] = [
  {
    name: "moment",
    status: "Deprecated",
    year: "2020",
    pattern:
      "Single-maintainer contributor share above 80%, commit velocity halving year-over-year, no major releases in 24+ months before the official deprecation notice.",
  },
  {
    name: "request",
    status: "Deprecated",
    year: "2020",
    pattern:
      "Velocity below 30% of prior baseline by 2018, maintainer first-response time over 14 days, no major releases for 24 months before deprecation.",
  },
  {
    name: "bower",
    status: "Maintenance mode",
    year: "2017",
    pattern:
      "Explicit maintenance-mode README signal, sharp commit cadence drop, ecosystem migration toward npm/yarn visible through fork-to-star ratio shift.",
  },
  {
    name: "node-sass",
    status: "Sunset",
    year: "2022",
    pattern:
      "Steady velocity decline post-2020, structural dependency on node-gyp surfacing through build issue accumulation, official sunset once Dart Sass overtook adoption.",
  },
  {
    name: "underscore",
    status: "Superseded",
    year: "2018",
    pattern:
      "Stable but stagnant velocity, near-zero release cadence, npm download trajectory diverging from lodash visible through cross-package comparison.",
  },
  {
    name: "coffeescript",
    status: "Declined",
    year: "2016",
    pattern:
      "Active-contributor count below 2 in rolling 90-day windows, no major release since 2017, npm downloads down 95% from peak.",
  },
];

export function TrackRecord() {
  return (
    <section className="border-t border-dl-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-dl-green">
            {"// pattern recognition"}
          </p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-dl-fg sm:text-[32px]">
            The patterns DriftLogg flags
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-3 max-w-2xl text-base text-dl-fg-muted">
            DriftLogg doesn&apos;t predict the future — it detects abandonment
            patterns visible in public GitHub and npm data. Each case below
            matches signal combinations DriftLogg flags today.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <Reveal key={item.name} delay={140 + i * 70}>
              <article className="h-full rounded-xl border border-dl-border bg-dl-surface p-6 transition-colors duration-200 hover:border-dl-fg-muted/40">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-base font-bold text-dl-fg">
                    {item.name}
                  </span>
                  <span className="rounded-full border border-dl-red/40 bg-dl-red/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-dl-red">
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-dl-fg-muted">
                  Officially marked {item.year}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-dl-fg-muted">
                  {item.pattern}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
