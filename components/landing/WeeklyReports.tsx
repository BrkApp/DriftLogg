import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { getAllReports } from "@/lib/reports";

function formatDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    .toUpperCase();
}

export function WeeklyReports() {
  const reports = getAllReports().slice(0, 3);

  return (
    <section id="reports" className="border-t border-dl-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-dl-fg sm:text-[32px]">
            Free weekly risk reports
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-3 max-w-2xl text-base text-dl-fg-muted">
            Every Monday, we scan the 50 most popular npm packages and publish
            the results.
          </p>
        </Reveal>

        {reports.length === 0 ? (
          <p className="mt-10 font-mono text-sm text-dl-fg-muted">
            No reports published yet.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reports.map((report, i) => (
              <Reveal key={report.slug} delay={120 + i * 100}>
                <article className="group flex h-full flex-col rounded-xl border border-dl-border bg-dl-surface p-6 transition-colors duration-200 hover:border-dl-green">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-dl-fg-muted">
                      {formatDate(report.date)}
                    </span>
                    {report.tags[0] && (
                      <span className="rounded-full border border-dl-border bg-dl-surface px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-dl-fg-muted">
                        {report.tags[0]}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-bold leading-snug text-dl-fg">
                    {report.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-dl-fg-muted">
                    {report.description}
                  </p>
                  <Link
                    href={`/reports/${report.slug}`}
                    className="mt-5 inline-flex items-center gap-1 font-mono text-[13px] text-dl-green transition-colors hover:text-dl-green/80"
                  >
                    Read report
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        {reports.length > 0 && (
          <Reveal delay={400}>
            <div className="mt-10">
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 font-mono text-sm text-dl-fg-muted transition-colors hover:text-dl-fg"
              >
                See all reports <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
