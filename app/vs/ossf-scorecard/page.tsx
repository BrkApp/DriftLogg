import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X, Minus } from "lucide-react";
import { Layout } from "@/components/shared/Layout";

export const metadata: Metadata = {
  title: "DriftLogg vs OSSF Scorecard — Which tool is right for your team?",
  description:
    "OSSF Scorecard checks security practices. DriftLogg checks if a package is still alive. Compare the two tools and decide which fits your workflow.",
  openGraph: {
    title: "DriftLogg vs OSSF Scorecard",
    description:
      "OSSF Scorecard checks security practices. DriftLogg detects maintenance decay. See which tool your team actually needs.",
    type: "website",
    url: "https://driftlogg.dev/vs/ossf-scorecard",
  },
};

type Cell = "yes" | "no" | "partial";

const COMPARISON: { feature: string; driftlogg: Cell; ossf: Cell }[] = [
  { feature: "Health score 0–100",            driftlogg: "yes", ossf: "partial" },
  { feature: "Web UI — no setup required",    driftlogg: "yes", ossf: "no"      },
  { feature: "Free on-demand scan",           driftlogg: "yes", ossf: "partial" },
  { feature: "Maintenance decay detection",   driftlogg: "yes", ossf: "no"      },
  { feature: "Continuous monitoring",         driftlogg: "yes", ossf: "no"      },
  { feature: "Email & Slack alerts",          driftlogg: "yes", ossf: "no"      },
  { feature: "Alternative recommendations",   driftlogg: "yes", ossf: "no"      },
  { feature: "Security practices scoring",    driftlogg: "no",  ossf: "yes"     },
  { feature: "No GitHub token required",      driftlogg: "yes", ossf: "no"      },
];

function Cell({ value }: { value: Cell }) {
  if (value === "yes") return <Check className="mx-auto h-4 w-4 text-dl-green" aria-label="Yes" />;
  if (value === "no") return <X className="mx-auto h-4 w-4 text-dl-fg-muted/40" aria-label="No" />;
  return <Minus className="mx-auto h-4 w-4 text-dl-amber" aria-label="Partial" />;
}

export default function VsOssfScorecardPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dl-green">
          {"// driftlogg vs ossf scorecard"}
        </p>
        <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-dl-fg sm:text-[46px]">
          OSSF Scorecard tells you if a repo
          <br className="hidden sm:block" /> is secure. DriftLogg tells you
          <br className="hidden sm:block" /> if it&apos;s still alive.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dl-fg-muted">
          Both tools score open source projects — but they answer fundamentally
          different questions. OSSF Scorecard measures security hygiene.
          DriftLogg measures maintenance health and predicts decline before it
          breaks your build.
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

        {/* ── What is OSSF Scorecard ───────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            What is OSSF Scorecard?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-dl-fg-muted">
            OSSF Scorecard is an open source CLI tool built by the Open Source
            Security Foundation. It runs a set of automated checks against a
            GitHub repository and produces a score based on security practices —
            things like branch protection, signed releases, CI/CD pipelines, and
            dependency pinning.
          </p>
          <p className="mt-4 text-base leading-relaxed text-dl-fg-muted">
            It&apos;s a great tool for security engineers who want to audit whether a
            project follows supply chain best practices. It requires a GitHub
            token, runs as a CLI, and produces a JSON or text report. There is
            no hosted UI, no monitoring, and no alerting.
          </p>
        </section>

        {/* ── The key difference ──────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            The question each tool answers
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-dl-border bg-dl-surface p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-dl-fg-muted">
                OSSF Scorecard asks
              </p>
              <p className="mt-3 text-base font-bold text-dl-fg">
                &ldquo;Does this project follow security best practices?&rdquo;
              </p>
              <p className="mt-3 text-sm leading-relaxed text-dl-fg-muted">
                Branch protection, SAST, pinned dependencies, signed releases,
                vulnerability disclosure policy.
              </p>
            </div>
            <div className="rounded-xl border border-dl-green/40 bg-dl-green/5 p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-dl-green">
                DriftLogg asks
              </p>
              <p className="mt-3 text-base font-bold text-dl-fg">
                &ldquo;Is this project still actively maintained?&rdquo;
              </p>
              <p className="mt-3 text-sm leading-relaxed text-dl-fg-muted">
                Commit velocity, release cadence, maintainer responsiveness,
                community size, bus factor risk.
              </p>
            </div>
          </div>
          <p className="mt-6 text-base leading-relaxed text-dl-fg-muted">
            A project can score 10/10 on OSSF Scorecard and still be silently
            dying — no new commits, one maintainer who hasn&apos;t responded to issues
            in six months. DriftLogg catches that. OSSF Scorecard doesn&apos;t.
          </p>
        </section>

        {/* ── Comparison table ─────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Feature comparison
          </h2>
          <div className="mt-8 overflow-x-auto rounded-xl border border-dl-border">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-dl-border bg-dl-surface">
                  <th scope="col" className="py-4 pl-5 pr-4 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted" />
                  <th scope="col" className="px-5 py-4 text-center font-mono text-xs font-bold uppercase tracking-wider text-dl-green">
                    DriftLogg
                  </th>
                  <th scope="col" className="px-5 py-4 text-center font-mono text-xs uppercase tracking-wider text-dl-fg-muted">
                    OSSF Scorecard
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-dl-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-dl-surface/40"}`}>
                    <td className="py-3.5 pl-5 pr-4 text-sm text-dl-fg">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center"><Cell value={row.driftlogg} /></td>
                    <td className="px-5 py-3.5 text-center"><Cell value={row.ossf} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-mono text-xs text-dl-fg-muted">
            Partial (–) = OSSF Scorecard has a web viewer at deps.dev but the CLI is the primary interface.
          </p>
        </section>

        {/* ── When to use which ───────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            When to use each tool
          </h2>
          <div className="mt-8 space-y-5">
            {[
              {
                title: "Use OSSF Scorecard when…",
                points: [
                  "You're auditing a dependency for security practices before adopting it",
                  "Your team runs supply chain security reviews",
                  "You need a machine-readable JSON report for compliance",
                ],
              },
              {
                title: "Use DriftLogg when…",
                points: [
                  "You want to know if a dependency is still actively maintained",
                  "You want a continuous watch on your stack — not a one-off audit",
                  "You want to catch declining packages before they become incidents",
                  "You need Slack or email alerts without writing a script",
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
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="rounded-xl border border-dl-green/40 bg-dl-green/5 p-8 text-center shadow-[0_0_60px_-20px_rgba(0,255,136,0.3)]">
            <h2 className="text-2xl font-bold text-dl-fg sm:text-[28px]">
              Try DriftLogg — it&apos;s free
            </h2>
            <p className="mt-3 text-base text-dl-fg-muted">
              No signup. No GitHub token. Paste a repo, get a score in 30 seconds.
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
