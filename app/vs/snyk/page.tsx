import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { Layout } from "@/components/shared/Layout";

export const metadata: Metadata = {
  title: "DriftLogg vs Snyk — Vulnerability scanning vs dependency health monitoring",
  description:
    "Snyk scans for known CVEs. DriftLogg detects dependency decay before vulnerabilities even appear. See which tool closes the gap your security scanner misses.",
  openGraph: {
    title: "DriftLogg vs Snyk",
    description:
      "Snyk finds known vulnerabilities. DriftLogg finds packages heading toward abandonment. Both gaps are real — here's how they differ.",
    type: "website",
    url: "https://driftlogg.dev/vs/snyk",
  },
};

const COMPARISON: { feature: string; driftlogg: boolean; snyk: boolean }[] = [
  { feature: "Maintenance health score 0–100",     driftlogg: true,  snyk: false },
  { feature: "Dependency decay detection",          driftlogg: true,  snyk: false },
  { feature: "Free on-demand scan (no account)",    driftlogg: true,  snyk: false },
  { feature: "Alternative recommendations",         driftlogg: true,  snyk: false },
  { feature: "Continuous monitoring",               driftlogg: true,  snyk: true  },
  { feature: "Email & Slack alerts",                driftlogg: true,  snyk: true  },
  { feature: "Known CVE / vulnerability scanning",  driftlogg: false, snyk: true  },
  { feature: "License compliance checks",           driftlogg: false, snyk: true  },
  { feature: "Container & IaC scanning",            driftlogg: false, snyk: true  },
  { feature: "Pricing under $30/mo for small teams",driftlogg: true,  snyk: false },
];

export default function VsSnykPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dl-green">
          {"// driftlogg vs snyk"}
        </p>
        <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-dl-fg sm:text-[46px]">
          Snyk tells you a package has a CVE.
          <br className="hidden sm:block" /> DriftLogg tells you it&apos;s heading
          <br className="hidden sm:block" /> toward abandonment.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dl-fg-muted">
          Snyk is a powerful security scanner. But it reacts to known
          vulnerabilities — it can&apos;t tell you that a maintainer stopped
          responding six months ago, or that commit velocity dropped 80% since
          last year. DriftLogg fills that gap.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/scan"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-dl-green px-5 font-mono text-sm font-bold text-black transition-colors hover:bg-dl-green/90"
          >
            Scan a repo — it&apos;s free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/#pricing"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-dl-border px-5 font-mono text-sm text-dl-fg transition-colors hover:border-dl-fg-muted/40"
          >
            See pricing
          </Link>
        </div>

        {/* ── The gap Snyk doesn't cover ──────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            The gap Snyk doesn&apos;t cover
          </h2>
          <p className="mt-4 text-base leading-relaxed text-dl-fg-muted">
            Snyk scans your dependencies against known vulnerability databases
            (NVD, GitHub Advisory, Snyk&apos;s own database). It&apos;s excellent at its
            job: it will catch a published CVE within hours and tell you exactly
            which version to upgrade to.
          </p>
          <p className="mt-4 text-base leading-relaxed text-dl-fg-muted">
            What it won&apos;t catch: the package that has no published CVEs yet but
            whose maintainer burned out, stopped shipping releases, and left 200
            issues unanswered. By the time Snyk flags it, there&apos;s no patch —
            because no one is writing patches anymore. That&apos;s the decay that
            DriftLogg detects months earlier.
          </p>
          <blockquote className="mt-8 border-l-2 border-dl-green pl-5">
            <p className="text-base italic leading-relaxed text-dl-fg-muted">
              &ldquo;moment.js had zero unpatched CVEs when it announced deprecation.
              Snyk wouldn&apos;t have flagged it. DriftLogg&apos;s signals would have shown
              the decay 18 months earlier.&rdquo;
            </p>
          </blockquote>
        </section>

        {/* ── Comparison table ─────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Feature comparison
          </h2>
          <div className="mt-8 overflow-x-auto rounded-xl border border-dl-border">
            <table className="w-full min-w-[440px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-dl-border bg-dl-surface">
                  <th scope="col" className="py-4 pl-5 pr-4 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted" />
                  <th scope="col" className="px-5 py-4 text-center font-mono text-xs font-bold uppercase tracking-wider text-dl-green">
                    DriftLogg
                  </th>
                  <th scope="col" className="px-5 py-4 text-center font-mono text-xs uppercase tracking-wider text-dl-fg-muted">
                    Snyk
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-dl-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-dl-surface/40"}`}>
                    <td className="py-3.5 pl-5 pr-4 text-sm text-dl-fg">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center">
                      {row.driftlogg
                        ? <Check className="mx-auto h-4 w-4 text-dl-green" />
                        : <X className="mx-auto h-4 w-4 text-dl-fg-muted/40" />}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {row.snyk
                        ? <Check className="mx-auto h-4 w-4 text-dl-fg-muted" />
                        : <X className="mx-auto h-4 w-4 text-dl-fg-muted/40" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── When to use which ───────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            When to use each tool
          </h2>
          <div className="mt-8 space-y-5">
            {[
              {
                title: "Use Snyk when…",
                points: [
                  "You need to detect and remediate known CVEs across your stack",
                  "You need license compliance scanning for legal or procurement requirements",
                  "You run container or infrastructure-as-code security reviews",
                ],
              },
              {
                title: "Use DriftLogg when…",
                points: [
                  "You want to know if a dependency is still actively maintained",
                  "You want early warning before a package goes into maintenance mode",
                  "You need continuous monitoring without enterprise pricing",
                  "You want actionable alternatives when a dependency starts to decline",
                ],
              },
            ].map((block) => (
              <div key={block.title} className="rounded-xl border border-dl-border bg-dl-surface p-6">
                <h3 className="text-base font-bold text-dl-fg">{block.title}</h3>
                <ul className="mt-4 space-y-2">
                  {block.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm text-dl-fg-muted">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-dl-green" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-base leading-relaxed text-dl-fg-muted">
            The two tools are complementary. Snyk handles the reactive layer —
            known vulnerabilities with patches. DriftLogg handles the proactive
            layer — packages heading toward a state where no patches will come.
          </p>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="rounded-xl border border-dl-green/40 bg-dl-green/5 p-8 text-center shadow-[0_0_60px_-20px_rgba(0,255,136,0.3)]">
            <h2 className="text-2xl font-bold text-dl-fg sm:text-[28px]">
              Try DriftLogg — it&apos;s free
            </h2>
            <p className="mt-3 text-base text-dl-fg-muted">
              No signup. No credit card. Get a dependency health score in 30 seconds.
            </p>
            <Link
              href="/scan"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-dl-green px-6 font-mono text-sm font-bold text-black transition-colors hover:bg-dl-green/90"
            >
              Scan your first repo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </div>
    </Layout>
  );
}
