import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

interface Report {
  date: string;
  tag: string;
  title: string;
  excerpt: string;
  href: string;
}

const REPORTS: Report[] = [
  {
    date: "MAR 03, 2026",
    tag: "npm",
    title: "Top 50 npm packages â€” week 9 risk pulse",
    excerpt:
      "Three packages crossed the high-risk threshold this week. moment/moment moved to critical after 67 days without a commit.",
    href: "#",
  },
  {
    date: "FEB 24, 2026",
    tag: "npm",
    title: "Bot-driven commits inflate health scores",
    excerpt:
      "We isolated 14 packages whose recent activity is 90%+ dependabot. Velocity scores corrected by an average of âˆ’18 pts.",
    href: "#",
  },
  {
    date: "FEB 17, 2026",
    tag: "npm",
    title: "Maintainer hand-offs â€” what we saw in February",
    excerpt:
      "Six high-traffic packages changed primary maintainer this month. Two recovered, four degraded into single-contributor risk.",
    href: "#",
  },
];

export function WeeklyReports() {
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
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {REPORTS.map((report, i) => (
            <Reveal key={report.title} delay={120 + i * 100}>
              <article className="group flex h-full flex-col rounded-xl border border-dl-border bg-dl-surface p-6 transition-colors duration-200 hover:border-dl-green">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-dl-fg-muted">
                    {report.date}
                  </span>
                  <span className="rounded-full border border-dl-border bg-dl-surface px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-dl-fg-muted">
                    {report.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold leading-snug text-dl-fg">
                  {report.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-dl-fg-muted">
                  {report.excerpt}
                </p>
                <Link
                  href={report.href}
                  className="mt-5 inline-flex items-center gap-1 font-mono text-[13px] text-dl-green transition-colors hover:text-dl-green/80"
                >
                  Read report
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

