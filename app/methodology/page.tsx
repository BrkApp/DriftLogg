import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/shared/Layout";

export const metadata: Metadata = {
  title: "Methodology — How DriftLogg scores open source health",
  description:
    "DriftLogg's drift score is a deterministic, reproducible function of public GitHub and npm data. This page documents the 6 signals, their weights, thresholds, and override rules in full detail.",
  openGraph: {
    title: "DriftLogg Methodology",
    description:
      "How DriftLogg's 6 signals add up to a 0–100 health score — formulas, thresholds, data sources.",
    url: "https://driftlogg.dev/methodology",
    type: "article",
  },
  alternates: {
    canonical: "https://driftlogg.dev/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">

        {/* ── Header ────────────────────────────────────────────────── */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dl-green">
          {"// methodology"}
        </p>
        <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-dl-fg md:text-[44px]">
          How DriftLogg scores open source health
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-dl-fg-muted">
          DriftLogg assigns each public GitHub repository a health score from
          0 to 100. The score is a deterministic, reproducible function of
          public GitHub and npm registry data — no opaque ML, no proprietary
          signals. This page documents exactly how it&apos;s computed so you
          can audit it against your own intuition before trusting our verdicts.
        </p>

        {/* ── The six signals overview ──────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            The six signals
          </h2>
          <p className="mt-3 text-base leading-relaxed text-dl-fg-muted">
            The 100-point score breaks down across six dimensions, each
            independently capped. Adding them yields the final score.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-dl-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-dl-border bg-dl-surface">
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Signal</th>
                  <th className="px-4 py-3 text-right font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Max</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Captures</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Velocity",       25, "Recent commit cadence vs. prior 60-day baseline"],
                  ["Responsiveness", 20, "Average first-response time on issues"],
                  ["Community",      15, "Active contributors + fork/star ratio"],
                  ["Freshness",      15, "Days since last commit + last release"],
                  ["Trust",          10, "License, SECURITY.md, FUNDING.yml"],
                  ["Social",         15, "Sponsorships, discussions, npm downloads, badges"],
                ].map(([name, max, what], i) => (
                  <tr key={i} className={`border-b border-dl-border/50 last:border-0 ${i % 2 ? "bg-dl-surface/40" : ""}`}>
                    <td className="px-4 py-3 text-sm font-bold text-dl-fg">{name}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-dl-green tabular-nums">{max}</td>
                    <td className="px-4 py-3 text-sm text-dl-fg-muted">{what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Velocity ──────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Velocity <span className="font-mono text-base text-dl-green">/ 25</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-dl-fg-muted">
            Compares commit cadence in the last 30 days against the prior 60-day
            baseline. The ratio determines the score:
          </p>
          <ul className="mt-4 space-y-1.5 font-mono text-sm text-dl-fg-muted">
            <li>ratio ≥ 1.0  →  <span className="text-dl-fg">25 pts</span></li>
            <li>0.7 ≤ ratio &lt; 1.0  →  <span className="text-dl-fg">21 pts</span></li>
            <li>0.5 ≤ ratio &lt; 0.7  →  <span className="text-dl-fg">15 pts</span></li>
            <li>0.3 ≤ ratio &lt; 0.5  →  <span className="text-dl-fg">8 pts</span></li>
            <li>ratio &lt; 0.3  →  <span className="text-dl-fg">3 pts</span></li>
          </ul>
          <p className="mt-4 text-base leading-relaxed text-dl-fg-muted">
            Hard caps prevent inflated scores when raw volume is genuinely low:
            a single commit in 30 days caps velocity at 5; up to 3 commits at 10;
            up to 8 at 18. Long-established repos (5+ years old, 25k+ stars, not
            archived, no deprecated badge) get a 12-point baseline even at zero
            commits, reflecting accepted &quot;stable&quot; stewardship.
          </p>
        </section>

        {/* ── Responsiveness ────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Responsiveness <span className="font-mono text-base text-dl-green">/ 20</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-dl-fg-muted">
            Based on the average first-response time to issues over the recent window:
          </p>
          <ul className="mt-4 space-y-1.5 font-mono text-sm text-dl-fg-muted">
            <li>≤ 1 day   →  <span className="text-dl-fg">20 pts</span></li>
            <li>≤ 3 days  →  <span className="text-dl-fg">17 pts</span></li>
            <li>≤ 7 days  →  <span className="text-dl-fg">12 pts</span></li>
            <li>≤ 14 days →  <span className="text-dl-fg">6 pts</span></li>
            <li>&gt; 14 days →  <span className="text-dl-fg">0 pts</span></li>
            <li>no data  →  <span className="text-dl-fg">10 pts (neutral)</span></li>
          </ul>
        </section>

        {/* ── Community ─────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Community <span className="font-mono text-base text-dl-green">/ 15</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-dl-fg-muted">
            Sum of two sub-scores. First, active contributors in the last 30 days:
          </p>
          <ul className="mt-4 space-y-1.5 font-mono text-sm text-dl-fg-muted">
            <li>10+  →  <span className="text-dl-fg">9 pts</span></li>
            <li>5–9  →  <span className="text-dl-fg">7 pts</span></li>
            <li>2–4  →  <span className="text-dl-fg">4 pts</span></li>
            <li>1    →  <span className="text-dl-fg">2 pts</span></li>
            <li>0    →  <span className="text-dl-fg">0 pts</span></li>
          </ul>
          <p className="mt-4 text-base leading-relaxed text-dl-fg-muted">
            Second, fork-to-star ratio. A balanced ratio (5–40%) is rewarded.
            Very high ratios (&gt;70%) often signal community fragmentation
            (everyone forks instead of contributing).
          </p>
        </section>

        {/* ── Freshness ─────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Freshness <span className="font-mono text-base text-dl-green">/ 15</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-dl-fg-muted">
            Combines time since last commit and last release. Recent commits
            score 7 pts max; recent releases score 8 pts max. To prevent
            cosmetic releases masking dead repos, release points are capped at
            4 when the last commit is older than 30 days.
          </p>
        </section>

        {/* ── Trust ─────────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Trust <span className="font-mono text-base text-dl-green">/ 10</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-dl-fg-muted">
            Three boolean signals — flat additions:
          </p>
          <ul className="mt-4 space-y-1.5 font-mono text-sm text-dl-fg-muted">
            <li>License detected  →  <span className="text-dl-fg">+4 pts</span></li>
            <li>SECURITY.md       →  <span className="text-dl-fg">+3 pts</span></li>
            <li>FUNDING.yml       →  <span className="text-dl-fg">+3 pts</span></li>
          </ul>
        </section>

        {/* ── Social ────────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Social <span className="font-mono text-base text-dl-green">/ 15</span>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-dl-fg-muted">
            Heterogeneous bucket reflecting community vitality and funding:
          </p>
          <ul className="mt-4 space-y-1.5 font-mono text-sm text-dl-fg-muted">
            <li>Discord/Slack community badge   →  <span className="text-dl-fg">+4</span></li>
            <li>GitHub Sponsors / Open Collective →  <span className="text-dl-fg">+3</span></li>
            <li>&quot;help wanted&quot; issues open      →  <span className="text-dl-fg">+3</span></li>
            <li>GitHub Discussions enabled       →  <span className="text-dl-fg">+3</span></li>
            <li>Maintenance-mode README signal   →  <span className="text-dl-fg">+3</span></li>
            <li>Deprecated badge in README       →  <span className="text-dl-red">−10</span></li>
            <li>npm downloads (when active)      →  <span className="text-dl-fg">+1 to +3</span></li>
            <li>High stale/wontfix share + low contrib  →  <span className="text-dl-red">−5</span></li>
          </ul>
        </section>

        {/* ── Cross-cutting overrides ───────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Cross-cutting overrides
          </h2>
          <p className="mt-3 text-base leading-relaxed text-dl-fg-muted">
            These rules prevent gameable scores or stale-but-licensed repos
            looking healthy:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-dl-fg-muted">
            <li>If velocity &lt; 5 (near-zero commits), responsiveness is capped at 5 and trust at 4. You can&apos;t pad your score with a SECURITY.md when nobody&apos;s committing.</li>
            <li>If velocity &lt; 10, responsiveness is capped at 12 and trust at 7.</li>
            <li>Large established projects (10k+ stars, active contributors) get a social floor at 10, since community vitality is hard to evaluate via individual signals at that scale.</li>
            <li>Archived or disabled repos always classify as <code className="rounded bg-dl-surface px-1.5 py-0.5 font-mono text-[13px] text-dl-fg">critical</code>, regardless of the numerical score.</li>
            <li>Maintenance-mode or deprecated repos bump from <code className="rounded bg-dl-surface px-1.5 py-0.5 font-mono text-[13px] text-dl-fg">low</code>/<code className="rounded bg-dl-surface px-1.5 py-0.5 font-mono text-[13px] text-dl-fg">medium</code> to <code className="rounded bg-dl-surface px-1.5 py-0.5 font-mono text-[13px] text-dl-fg">high</code>, since the README signal trumps the numerical score.</li>
          </ul>
        </section>

        {/* ── Risk levels ───────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Risk classification
          </h2>
          <div className="mt-6 overflow-x-auto rounded-xl border border-dl-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-dl-border bg-dl-surface">
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Score</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Risk</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["80–100", "Low",      "text-dl-green"],
                  ["60–79",  "Medium",   "text-dl-amber"],
                  ["35–59",  "High",     "text-dl-orange"],
                  ["0–34",   "Critical", "text-dl-red"],
                ].map(([range, risk, color], i) => (
                  <tr key={i} className={`border-b border-dl-border/50 last:border-0 ${i % 2 ? "bg-dl-surface/40" : ""}`}>
                    <td className="px-4 py-3 font-mono text-sm text-dl-fg">{range}</td>
                    <td className={`px-4 py-3 font-mono text-sm font-bold ${color}`}>{risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Data sources ──────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Data sources
          </h2>
          <p className="mt-3 text-base leading-relaxed text-dl-fg-muted">
            All inputs are pulled from public APIs:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-dl-fg-muted">
            <li><strong className="text-dl-fg">GitHub REST API</strong> via Octokit: commits, issues, releases, contributors, repo metadata, README content, SECURITY/FUNDING file detection.</li>
            <li><strong className="text-dl-fg">npm registry</strong>: weekly download counts (when applicable).</li>
          </ul>
          <p className="mt-4 text-base leading-relaxed text-dl-fg-muted">
            No proprietary scrapers, no third-party data brokers. The score is
            fully reproducible from publicly available information.
          </p>
        </section>

        {/* ── Refresh ───────────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Refresh cadence
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-dl-fg-muted">
            <li><code className="rounded bg-dl-surface px-1.5 py-0.5 font-mono text-[13px] text-dl-fg">/scan/[owner]/[repo]</code>: live scan on each visit, cached server-side for 10 minutes to absorb traffic bursts.</li>
            <li><code className="rounded bg-dl-surface px-1.5 py-0.5 font-mono text-[13px] text-dl-fg">/is/[name]-maintained</code> pages: regenerated every 24 hours via Next.js Incremental Static Regeneration.</li>
            <li>Weekly risk reports: snapshotted to git every Monday by a scheduled GitHub Action.</li>
          </ul>
        </section>

        {/* ── Open source ───────────────────────────────────────────── */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Open source
          </h2>
          <p className="mt-3 text-base leading-relaxed text-dl-fg-muted">
            DriftLogg&apos;s scoring algorithm is publicly available. The exact
            implementation lives at{" "}
            <a
              href="https://github.com/BrkApp/DriftLogg/blob/master/lib/scoring.ts"
              target="_blank"
              rel="noreferrer"
              className="text-dl-green hover:underline"
            >
              lib/scoring.ts
            </a>
            . If you disagree with a weight or threshold, open an issue —
            we&apos;ll talk it through.
          </p>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section className="mt-16 rounded-xl border border-dl-green/40 bg-dl-green/5 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-dl-fg sm:text-xl">
            Try it on your stack
          </h2>
          <p className="mt-2 text-sm text-dl-fg-muted">
            Run a free scan on any public GitHub repository to see the
            methodology applied in practice.
          </p>
          <Link
            href="/scan"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-dl-green px-4 font-mono text-sm font-semibold text-black transition-colors hover:bg-dl-green/90"
          >
            Scan a repo <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

      </article>
    </Layout>
  );
}
