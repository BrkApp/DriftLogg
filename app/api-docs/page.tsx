import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/shared/Layout";

export const metadata: Metadata = {
  title: "API Reference — DriftLogg",
  description:
    "DriftLogg public read-only API. Score any public GitHub repository in one HTTP call. Free, no API key required.",
  openGraph: {
    title: "DriftLogg API Reference",
    description: "Score any public GitHub repository with one HTTP call. Free, no API key required.",
    type: "website",
    url: "https://driftlogg.dev/api-docs",
  },
};

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-dl-border bg-[#0a0a0a] p-5 font-mono text-sm leading-relaxed text-dl-fg">
      <code>{children}</code>
    </pre>
  );
}

function Badge({ children, color = "green" }: { children: string; color?: "green" | "amber" | "muted" }) {
  const cls =
    color === "green"
      ? "border-dl-green/40 bg-dl-green/10 text-dl-green"
      : color === "amber"
      ? "border-dl-amber/40 bg-dl-amber/10 text-dl-amber"
      : "border-dl-border bg-dl-surface text-dl-fg-muted";
  return (
    <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

export default function ApiDocsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28">

        {/* ── Header ───────────────────────────────────────────────── */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dl-green">
          {"// public api — read-only"}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-dl-fg sm:text-[46px]">
          API Reference
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-dl-fg-muted">
          Score any public GitHub repository with a single HTTP call.
          No API key required. Free tier: 10 requests per IP per 15 minutes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Badge>Free</Badge>
          <Badge color="muted">No auth required</Badge>
          <Badge color="muted">Read-only</Badge>
        </div>

        {/* ── Base URL ─────────────────────────────────────────────── */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg">Base URL</h2>
          <div className="mt-4">
            <Code>{"https://driftlogg.dev/api"}</Code>
          </div>
        </section>

        {/* ── Endpoint: GET /scan ──────────────────────────────────── */}
        <section className="mt-16">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-dl-green/10 px-2.5 py-1 font-mono text-sm font-bold text-dl-green">
              GET
            </span>
            <h2 className="font-mono text-xl font-bold text-dl-fg">/scan</h2>
          </div>
          <p className="mt-3 text-base text-dl-fg-muted">
            Returns a full health report for a public GitHub repository — score,
            risk level, and the six signal breakdowns.
          </p>

          {/* Parameters */}
          <h3 className="mt-8 text-lg font-bold text-dl-fg">Query parameters</h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-dl-border">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-dl-border bg-dl-surface">
                  <th className="py-3 pl-5 pr-4 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Parameter</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Type</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Required</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "owner", type: "string", required: "Yes", desc: "GitHub username or org (max 39 chars)" },
                  { name: "repo",  type: "string", required: "Yes", desc: "Repository name (max 100 chars)" },
                ].map((row, i) => (
                  <tr key={row.name} className={`border-b border-dl-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-dl-surface/40"}`}>
                    <td className="py-3 pl-5 pr-4 font-mono text-sm text-dl-green">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-sm text-dl-fg-muted">{row.type}</td>
                    <td className="px-4 py-3 text-sm text-dl-fg-muted">{row.required}</td>
                    <td className="px-4 py-3 text-sm text-dl-fg-muted">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Examples */}
          <h3 className="mt-8 text-lg font-bold text-dl-fg">Examples</h3>

          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-dl-fg-muted">curl</p>
          <div className="mt-2">
            <Code>{`curl "https://driftlogg.dev/api/scan?owner=vercel&repo=next.js"`}</Code>
          </div>

          <p className="mt-6 font-mono text-xs uppercase tracking-wider text-dl-fg-muted">JavaScript (fetch)</p>
          <div className="mt-2">
            <Code>{`const res = await fetch(
  "https://driftlogg.dev/api/scan?owner=vercel&repo=next.js"
);
const report = await res.json();

console.log(report.score);  // 0–100
console.log(report.risk);   // "low" | "medium" | "high" | "critical"`}</Code>
          </div>

          <p className="mt-6 font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Python</p>
          <div className="mt-2">
            <Code>{`import httpx

r = httpx.get(
    "https://driftlogg.dev/api/scan",
    params={"owner": "vercel", "repo": "next.js"},
)
report = r.json()
print(report["score"], report["risk"])`}</Code>
          </div>

          {/* POST variant */}
          <h3 className="mt-8 text-lg font-bold text-dl-fg">POST variant</h3>
          <p className="mt-2 text-sm text-dl-fg-muted">
            Prefer a POST body? Same endpoint, same response.
          </p>
          <div className="mt-4">
            <Code>{`curl -X POST https://driftlogg.dev/api/scan \\
  -H "Content-Type: application/json" \\
  -d '{"owner":"vercel","repo":"next.js"}'`}</Code>
          </div>
        </section>

        {/* ── Response shape ───────────────────────────────────────── */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg">Response</h2>
          <p className="mt-3 text-base text-dl-fg-muted">
            All responses are JSON. Successful responses return HTTP 200.
          </p>
          <div className="mt-6">
            <Code>{`{
  "score": 87,
  "risk": "low",
  "signals": [
    "342 commits in the last 90 days",
    "Last release 3 days ago",
    "Active contributors: 48 in 90 days",
    ...
  ],
  "subScores": {
    "commits":     { "score": 95, "weight": 0.30 },
    "issues":      { "score": 80, "weight": 0.15 },
    "releases":    { "score": 90, "weight": 0.15 },
    "maintenance": { "score": 85, "weight": 0.25 },
    "community":   { "score": 78, "weight": 0.15 }
  },
  "data": { ... },
  "scannedAt": "2026-05-17T12:00:00.000Z",
  "fromCache": false
}`}</Code>
          </div>

          <h3 className="mt-8 text-lg font-bold text-dl-fg">Risk levels</h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-dl-border">
            <table className="w-full min-w-[400px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-dl-border bg-dl-surface">
                  <th className="py-3 pl-5 pr-4 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Value</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Score range</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { value: "low",      range: "≥ 80",  meaning: "Healthy, actively maintained" },
                  { value: "medium",   range: "60–79", meaning: "Some signals to watch" },
                  { value: "high",     range: "35–59", meaning: "Clear decline indicators" },
                  { value: "critical", range: "< 35",  meaning: "Likely abandoned or archived" },
                ].map((row, i) => (
                  <tr key={row.value} className={`border-b border-dl-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-dl-surface/40"}`}>
                    <td className="py-3 pl-5 pr-4 font-mono text-sm text-dl-green">{row.value}</td>
                    <td className="px-4 py-3 font-mono text-sm text-dl-fg-muted">{row.range}</td>
                    <td className="px-4 py-3 text-sm text-dl-fg-muted">{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Errors ───────────────────────────────────────────────── */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg">Error responses</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-dl-border">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-dl-border bg-dl-surface">
                  <th className="py-3 pl-5 pr-4 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Status</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-dl-fg-muted">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { status: "400", meaning: "Missing or invalid owner/repo parameter" },
                  { status: "403", meaning: "Repository is private" },
                  { status: "404", meaning: "Repository not found" },
                  { status: "429", meaning: "Rate limit hit — retry after the Retry-After header value (seconds)" },
                  { status: "503", meaning: "GitHub rate limit reached server-side — retry in a few minutes" },
                ].map((row, i) => (
                  <tr key={row.status} className={`border-b border-dl-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-dl-surface/40"}`}>
                    <td className="py-3 pl-5 pr-4 font-mono text-sm text-dl-fg-muted">{row.status}</td>
                    <td className="px-4 py-3 text-sm text-dl-fg-muted">{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-dl-fg-muted">
            All error responses have the shape{" "}
            <code className="rounded bg-dl-surface px-1.5 py-0.5 font-mono text-xs text-dl-fg">
              {`{ "error": "message" }`}
            </code>
            .
          </p>
        </section>

        {/* ── Rate limits ──────────────────────────────────────────── */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-dl-fg">Rate limits</h2>
          <p className="mt-3 text-base text-dl-fg-muted">
            The free tier allows <strong className="text-dl-fg">10 requests per IP per 15 minutes</strong>.
            Results are cached for 10 minutes server-side, so repeated scans of the same
            repo are instant and don&apos;t count against your quota.
          </p>
          <p className="mt-3 text-base text-dl-fg-muted">
            Need higher limits for CI pipelines or internal tooling?{" "}
            <a href="mailto:hi@driftlogg.dev" className="text-dl-green underline-offset-2 hover:underline">
              Get in touch.
            </a>
          </p>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="rounded-xl border border-dl-green/40 bg-dl-green/5 p-8 text-center shadow-[0_0_60px_-20px_rgba(0,255,136,0.3)]">
            <h2 className="text-2xl font-bold text-dl-fg">Try it now</h2>
            <p className="mt-3 text-base text-dl-fg-muted">
              Or use the web UI — paste a repo, get a score in 30 seconds.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/scan"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-dl-green px-6 font-mono text-sm font-bold text-black transition-colors hover:bg-dl-green/90"
              >
                Open web scanner <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/methodology"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-dl-border px-5 font-mono text-sm text-dl-fg transition-colors hover:border-dl-fg-muted/40"
              >
                Read the methodology
              </Link>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
