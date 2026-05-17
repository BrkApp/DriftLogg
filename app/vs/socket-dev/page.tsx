import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { Layout } from "@/components/shared/Layout";

export const metadata: Metadata = {
  title: "DriftLogg vs Socket.dev — Maintenance health vs supply chain security",
  description:
    "Socket.dev protects against malicious packages. DriftLogg detects when maintained packages start to decay. Learn when you need each — or both.",
  openGraph: {
    title: "DriftLogg vs Socket.dev",
    description:
      "Socket.dev catches malicious packages. DriftLogg catches dying ones. Two different threats, two different tools.",
    type: "website",
    url: "https://driftlogg.dev/vs/socket-dev",
  },
};

const COMPARISON: { feature: string; driftlogg: boolean; socket: boolean }[] = [
  { feature: "Health score 0–100",                driftlogg: true,  socket: false },
  { feature: "Maintenance decay detection",        driftlogg: true,  socket: false },
  { feature: "Commit velocity tracking",           driftlogg: true,  socket: false },
  { feature: "Continuous monitoring",              driftlogg: true,  socket: true  },
  { feature: "Email & Slack alerts",               driftlogg: true,  socket: true  },
  { feature: "Alternative recommendations",        driftlogg: true,  socket: false },
  { feature: "Free on-demand scan (no account)",   driftlogg: true,  socket: false },
  { feature: "Malicious package detection",        driftlogg: false, socket: true  },
  { feature: "Supply chain attack prevention",     driftlogg: false, socket: true  },
  { feature: "Typosquatting detection",            driftlogg: false, socket: true  },
];

export default function VsSocketDevPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dl-green">
          {"// driftlogg vs socket.dev"}
        </p>
        <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-dl-fg sm:text-[46px]">
          Socket catches malicious packages.
          <br className="hidden sm:block" /> DriftLogg catches dying ones.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dl-fg-muted">
          These tools protect against different threats. Socket.dev guards against
          supply chain attacks — compromised packages slipping into your build.
          DriftLogg guards against dependency decay — maintained packages that
          quietly stop being maintained.
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

        {/* ── Two different threats ────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Two different threats
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-dl-border bg-dl-surface p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-dl-fg-muted">
                Socket.dev protects against
              </p>
              <p className="mt-3 text-base font-bold text-dl-fg">
                Malicious packages entering your supply chain
              </p>
              <p className="mt-3 text-sm leading-relaxed text-dl-fg-muted">
                Typosquatting, compromised maintainer accounts, hidden crypto
                miners, data exfiltration, dependency confusion attacks.
              </p>
            </div>
            <div className="rounded-xl border border-dl-green/40 bg-dl-green/5 p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-dl-green">
                DriftLogg protects against
              </p>
              <p className="mt-3 text-base font-bold text-dl-fg">
                Maintained packages quietly becoming unmaintained
              </p>
              <p className="mt-3 text-sm leading-relaxed text-dl-fg-muted">
                Commit velocity drops, maintainer burn-out, no releases in 12+
                months, issues going unanswered, silent deprecation.
              </p>
            </div>
          </div>
          <p className="mt-6 text-base leading-relaxed text-dl-fg-muted">
            Both threats are real. A package can be perfectly legitimate today and
            abandoned in six months — that&apos;s where DriftLogg lives. Socket catches
            the moment a package turns hostile. They solve different problems, and
            the best teams run both.
          </p>
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
                    Socket.dev
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
                      {row.socket
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
                title: "Use Socket.dev when…",
                points: [
                  "You need to detect supply chain attacks in real time",
                  "You want to block malicious packages at install time via the npm proxy",
                  "You're worried about compromised maintainer accounts or typosquatting",
                ],
              },
              {
                title: "Use DriftLogg when…",
                points: [
                  "You want to know if your dependencies are still actively maintained",
                  "You need early warning before a popular package goes dark",
                  "You want continuous monitoring with a weekly email digest per repo",
                  "You need alternative package recommendations when a dependency declines",
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
              No signup. Paste a repo, get a health score in 30 seconds.
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
