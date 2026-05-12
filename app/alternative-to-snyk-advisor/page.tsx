import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { Layout } from "@/components/shared/Layout";

export const metadata: Metadata = {
  title: "Snyk Advisor Alternative — DriftLogg",
  description:
    "Snyk Advisor sunset in January 2026. DriftLogg is the drop-in replacement — health score 0–100, continuous monitoring, Slack alerts, and alternative package recommendations.",
  openGraph: {
    title: "Snyk Advisor Alternative — DriftLogg",
    description:
      "Snyk Advisor sunset in January 2026. DriftLogg is the drop-in replacement with continuous monitoring and alternative recommendations.",
    type: "website",
    url: "https://driftlogg.dev/alternative-to-snyk-advisor",
  },
};

const COMPARISON = [
  { feature: "Health score 0–100",         driftlogg: true,  snyk: false },
  { feature: "Free on-demand scan",         driftlogg: true,  snyk: false },
  { feature: "Continuous monitoring",       driftlogg: true,  snyk: false },
  { feature: "Email & Slack digest",        driftlogg: true,  snyk: false },
  { feature: "Alternative recommendations", driftlogg: true,  snyk: false },
  { feature: "Still maintained in 2026",    driftlogg: true,  snyk: false },
];

export default function AlternativeToSnykAdvisorPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dl-green">
          {"// snyk advisor alternative"}
        </p>
        <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-dl-fg sm:text-[46px]">
          The Snyk Advisor replacement
          <br className="hidden sm:block" /> your team actually needs.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dl-fg-muted">
          Snyk Advisor shut down in January 2026. If you relied on it to check
          whether a package was still maintained, DriftLogg is the direct
          replacement — free health check, continuous monitoring, and
          recommendations when a dependency starts to decline.
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

        {/* ── What happened ────────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            What happened to Snyk Advisor?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-dl-fg-muted">
            Snyk Advisor was a free tool that assigned a health score to npm,
            Python, Go, and Ruby packages. In late 2025, Snyk announced it would
            sunset the product on{" "}
            <strong className="text-dl-fg">15 January 2026</strong>. The service
            is no longer accessible and existing links return 404.
          </p>
          <p className="mt-4 text-base leading-relaxed text-dl-fg-muted">
            Thousands of engineering teams used it as a quick sanity check before
            adding a dependency. That workflow now has no obvious replacement —
            until DriftLogg.
          </p>
        </section>

        {/* ── Comparison table ─────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            DriftLogg vs Snyk Advisor
          </h2>
          <p className="mt-3 text-base text-dl-fg-muted">
            Feature-for-feature comparison for teams migrating from Snyk Advisor.
          </p>
          <div className="mt-8 overflow-x-auto rounded-xl border border-dl-border">
            <table className="w-full border-collapse text-sm">
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
                    Snyk Advisor
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-dl-border/50 last:border-0 ${
                      i % 2 === 0 ? "" : "bg-dl-surface/40"
                    }`}
                  >
                    <td className="py-3.5 pl-5 pr-4 text-sm text-dl-fg">
                      {row.feature}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {row.driftlogg ? (
                        <Check className="mx-auto h-4 w-4 text-dl-green" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-dl-fg-muted/40" />
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {row.snyk ? (
                        <Check className="mx-auto h-4 w-4 text-dl-green" />
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-dl-red">
                          sunset
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            How to check a package with DriftLogg
          </h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                n: "1",
                title: "Paste the GitHub URL or owner/repo slug",
                body: "DriftLogg works with any public GitHub repository. No account required for a one-off check.",
              },
              {
                n: "2",
                title: "Read the health score and signal breakdown",
                body: "Six signals scored 0–100: commit velocity, issue responsiveness, community health, release freshness, trust signals, and social presence.",
              },
              {
                n: "3",
                title: "Get alternative recommendations (Pro)",
                body: "When a dependency shows decline, DriftLogg suggests maintained alternatives with their own health scores and migration difficulty ratings.",
              },
            ].map((step) => (
              <li key={step.n} className="flex gap-5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dl-green/40 font-mono text-sm font-bold text-dl-green">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-base font-bold text-dl-fg">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-dl-fg-muted">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="rounded-xl border border-dl-green/40 bg-dl-green/5 p-8 text-center shadow-[0_0_60px_-20px_rgba(0,255,136,0.3)]">
            <h2 className="text-2xl font-bold text-dl-fg sm:text-[28px]">
              Try it now — it&apos;s free
            </h2>
            <p className="mt-3 text-base text-dl-fg-muted">
              No signup. Paste a repo, get a score in under 30 seconds.
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
