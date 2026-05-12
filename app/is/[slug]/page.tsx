import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { Layout } from "@/components/shared/Layout";
import { ScoreGauge } from "@/components/shared/ScoreGauge";
import { RiskBadge } from "@/components/shared/RiskBadge";
import {
  findPackageBySlug,
  KNOWN_PACKAGES,
  type KnownPackage,
} from "@/lib/packages-list";
import { getAlternativesFor, type Alternative } from "@/lib/alternatives";
import { resolveNpmToGithub } from "@/lib/npm";
import { fetchRepoHealth } from "@/lib/github";
import { computeHealthScore } from "@/lib/scoring";
import { BREAKDOWN_MAX, BREAKDOWN_LABELS } from "@/lib/constants";
import type { Risk, ScoreBreakdown } from "@/lib/types";

// ── Build-time settings ──────────────────────────────────────────────────────
export const revalidate = 86400; // ISR: refresh once per day
export const dynamicParams = false; // 404 for slugs not in generateStaticParams

const SUFFIX = "-maintained";

interface PageProps {
  params: { slug: string };
}

// ── Static params: one page per known package ───────────────────────────────
export function generateStaticParams(): Array<{ slug: string }> {
  return KNOWN_PACKAGES.map((p) => ({ slug: `${p.slug}${SUFFIX}` }));
}

function parsePackageSlug(slug: string): KnownPackage | null {
  if (!slug.endsWith(SUFFIX)) return null;
  const base = slug.slice(0, -SUFFIX.length);
  return findPackageBySlug(base) ?? null;
}

// ── Data fetching ────────────────────────────────────────────────────────────
interface PageData {
  pkg: KnownPackage;
  owner: string;
  repo: string;
  score: number;
  risk: Risk;
  breakdown: ScoreBreakdown;
  signals: string[];
  alternatives: Alternative[];
}

async function loadPageData(pkg: KnownPackage): Promise<PageData | null> {
  try {
    const gh = await resolveNpmToGithub(pkg.name);
    if (!gh) return null;
    const data = await fetchRepoHealth(gh.owner, gh.repo);
    const result = computeHealthScore(data);
    return {
      pkg,
      owner: gh.owner,
      repo: gh.repo,
      score: result.score,
      risk: result.risk,
      breakdown: result.breakdown,
      signals: result.signals,
      alternatives: getAlternativesFor(pkg.slug),
    };
  } catch (err) {
    console.warn(`[/is/${pkg.slug}-maintained] fetch failed:`, err);
    return null;
  }
}

// ── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const pkg = parsePackageSlug(params.slug);
  if (!pkg) return {};
  const title = `Is ${pkg.name} maintained? — DriftLogg`;
  const description = `Health analysis of the ${pkg.name} npm package: score, commit activity, maintainer responsiveness, and alternatives if it has declined.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://driftlogg.dev/is/${params.slug}`,
      type: "article",
    },
    alternates: {
      canonical: `https://driftlogg.dev/is/${params.slug}`,
    },
  };
}

// ── Verdict generator ───────────────────────────────────────────────────────
function getVerdict(
  score: number,
  name: string
): { headline: string; body: string } {
  if (score >= 80)
    return {
      headline: `Yes — ${name} is actively maintained.`,
      body: "Recent commit cadence, responsive maintainers, and healthy community signals. Safe to depend on for new projects in 2026.",
    };
  if (score >= 60)
    return {
      headline: `${name} is being maintained, with caveats.`,
      body: "Some warning signals: slower velocity, fewer active contributors, or aging releases. Audit the specific signals below before committing to this package long-term.",
    };
  if (score >= 35)
    return {
      headline: `${name} has slowed down significantly.`,
      body: "Reduced activity and weak community signals. Consider whether maintained alternatives can meet the same need before adding it to a new project.",
    };
  return {
    headline: `No — ${name} appears abandoned or critically slow.`,
    body: "No recent commits, unanswered issues, and weak community signals. Migration to a maintained alternative is strongly recommended.",
  };
}

// ── JSON-LD ─────────────────────────────────────────────────────────────────
function buildJsonLd(d: PageData, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: d.pkg.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Cross-platform",
    url: `https://driftlogg.dev/is/${slug}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (d.score / 20).toFixed(1),
      bestRating: "5",
      worstRating: "0",
      ratingCount: "1",
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function Page({ params }: PageProps) {
  const pkg = parsePackageSlug(params.slug);
  if (!pkg) notFound();

  const data = await loadPageData(pkg);

  return (
    <Layout>
      {data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJsonLd(data, params.slug)),
          }}
        />
      )}
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dl-green">
          {"// open source health check"}
        </p>

        <h1 className="mt-3 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-dl-fg md:text-[44px]">
          Is {pkg.name} maintained?
        </h1>

        {!data ? (
          <FailedToFetch name={pkg.name} />
        ) : (
          <>
            <ScoreSection data={data} />
            <VerdictSection data={data} />
            <BreakdownGrid breakdown={data.breakdown} />
            <SignalsList signals={data.signals} />
            {data.alternatives.length > 0 && (
              <AlternativesSection alternatives={data.alternatives} />
            )}
            <CTASection owner={data.owner} repo={data.repo} />
          </>
        )}
      </article>
    </Layout>
  );
}

// ── Sub-components (all server, no client JS) ───────────────────────────────

function ScoreSection({ data }: { data: PageData }) {
  return (
    <section className="mt-10 flex flex-col items-start gap-8 rounded-xl border border-dl-border bg-dl-surface p-6 sm:flex-row sm:items-center sm:p-8">
      <ScoreGauge score={data.score} size="md" animated={false} />
      <div className="space-y-3">
        <RiskBadge risk={data.risk} />
        <p className="font-mono text-sm text-dl-fg-muted">
          GitHub:{" "}
          <a
            href={`https://github.com/${data.owner}/${data.repo}`}
            target="_blank"
            rel="noreferrer"
            className="text-dl-green hover:underline"
          >
            {data.owner}/{data.repo}
          </a>
        </p>
        <p className="text-xs text-dl-fg-muted">
          Analysis refreshed every 24 hours.
        </p>
      </div>
    </section>
  );
}

function VerdictSection({ data }: { data: PageData }) {
  const verdict = getVerdict(data.score, data.pkg.name);
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold tracking-tight text-dl-fg">
        {verdict.headline}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-dl-fg-muted">
        {verdict.body}
      </p>
    </section>
  );
}

function BreakdownGrid({ breakdown }: { breakdown: ScoreBreakdown }) {
  const keys = Object.keys(BREAKDOWN_MAX) as (keyof ScoreBreakdown)[];
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold tracking-tight text-dl-fg">
        Score breakdown
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {keys.map((key) => {
          const max = BREAKDOWN_MAX[key];
          const val = breakdown[key];
          const pct = Math.round((val / max) * 100);
          const tone =
            pct >= 80
              ? "text-dl-green"
              : pct >= 50
                ? "text-dl-amber"
                : "text-dl-red";
          return (
            <div
              key={key}
              className="rounded-lg border border-dl-border bg-dl-surface px-4 py-3"
            >
              <div className="flex items-baseline justify-between font-mono text-xs">
                <span className="text-dl-fg">{BREAKDOWN_LABELS[key]}</span>
                <span className={`tabular-nums ${tone}`}>
                  {val} / {max}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SignalsList({ signals }: { signals: string[] }) {
  if (signals.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold tracking-tight text-dl-fg">
        Detected signals
      </h2>
      <ul className="mt-5 space-y-2.5">
        {signals.slice(0, 8).map((s, i) => (
          <li
            key={i}
            className="rounded-lg border border-dl-border bg-dl-surface px-4 py-2.5 text-sm text-dl-fg-muted"
          >
            {s}
          </li>
        ))}
      </ul>
    </section>
  );
}

function AlternativesSection({
  alternatives,
}: {
  alternatives: Alternative[];
}) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold tracking-tight text-dl-fg">
        Maintained alternatives
      </h2>
      <p className="mt-2 text-sm text-dl-fg-muted">
        If this package no longer fits, here are alternatives DriftLogg also
        tracks.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {alternatives.map((alt) => (
          <Link
            key={alt.slug}
            href={`/is/${alt.slug}-maintained`}
            className="group rounded-xl border border-dl-border bg-dl-surface p-5 transition-colors hover:border-dl-green"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-bold text-dl-fg">
                {alt.name}
              </span>
              <ArrowRight className="h-4 w-4 text-dl-fg-muted transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-2 text-sm text-dl-fg-muted">{alt.why}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CTASection({ owner, repo }: { owner: string; repo: string }) {
  return (
    <section className="mt-14 rounded-xl border border-dl-green/40 bg-dl-green/5 p-6 shadow-[0_0_60px_-20px_rgba(0,255,136,0.3)] sm:p-8">
      <h2 className="text-lg font-bold text-dl-fg sm:text-xl">
        Want a deeper analysis or scan your own repo?
      </h2>
      <p className="mt-2 text-sm text-dl-fg-muted">
        Run a fresh DriftLogg scan on any public GitHub repository. Free, no
        signup.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/scan/${owner}/${repo}`}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-dl-green px-4 font-mono text-sm font-semibold text-black transition-colors hover:bg-dl-green/90"
        >
          Re-scan {owner}/{repo} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/scan"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-dl-border px-4 font-mono text-sm text-dl-fg transition-colors hover:border-dl-fg-muted/40"
        >
          Scan another repo
        </Link>
      </div>
    </section>
  );
}

function FailedToFetch({ name }: { name: string }) {
  return (
    <section className="mt-8 rounded-xl border border-dl-amber/40 bg-dl-amber/5 p-6">
      <p className="text-sm text-dl-fg">
        We couldn&apos;t reach the npm registry or GitHub for {name} during the
        last refresh. The score will be regenerated within 24 hours. In the
        meantime, you can{" "}
        <Link href="/scan" className="text-dl-green hover:underline">
          run a manual scan
        </Link>
        .
      </p>
    </section>
  );
}
