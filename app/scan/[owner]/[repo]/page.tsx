"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Github,
  RefreshCw,
  Share2,
  XCircle,
} from "lucide-react";
import { Layout } from "@/components/shared/Layout";
import { ScoreGauge } from "@/components/shared/ScoreGauge";
import { RiskBadge, type Risk } from "@/components/shared/RiskBadge";
import { EmailCapture } from "@/components/shared/EmailCapture";
import { Skeleton } from "@/components/ui/skeleton";

interface BreakdownData {
  velocity: number;
  responsiveness: number;
  community: number;
  freshness: number;
  trust: number;
  social: number;
}

interface RepoData {
  fullName: string;
  description: string | null;
  url: string;
  archived: boolean;
}

interface Report {
  score: number;
  risk: Risk;
  breakdown: BreakdownData;
  signals: string[];
  prediction: string;
  data: RepoData;
  scannedAt: string;
  fromCache?: boolean;
  cachedAt?: string;
}

const MAX: Record<keyof BreakdownData, number> = {
  velocity: 25,
  responsiveness: 20,
  community: 15,
  freshness: 15,
  trust: 10,
  social: 15,
};

const LABELS: Record<keyof BreakdownData, string> = {
  velocity: "Velocity",
  responsiveness: "Responsiveness",
  community: "Community",
  freshness: "Freshness",
  trust: "Trust",
  social: "Social Signals",
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  return `${hr} hour${hr === 1 ? "" : "s"} ago`;
}

function classifySignal(s: string): "critical" | "warning" | "healthy" {
  if (
    /archived|disabled|abandoned|No recent commits|No commit activity|explicitly marks this project as deprecated/i.test(
      s
    )
  ) {
    return "critical";
  }
  const longGap = s.match(/No commits in the last (\d+) months/);
  if (longGap && Number(longGap[1]) >= 12) return "critical";
  if (
    /velocity up|very responsive|active contributors|community platform|Financially supported|Discussions enabled|help wanted/i.test(
      s
    )
  )
    return "healthy";
  return "warning";
}

export default function ScanResultsPage({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  const { owner, repo } = params;
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const runScan = useCallback(() => {
    const OWNER_RE = /^[A-Za-z0-9-]+$/;
    const REPO_RE = /^[A-Za-z0-9._-]+$/;
    if (owner.length > 39 || !OWNER_RE.test(owner) || repo.length > 100 || !REPO_RE.test(repo)) {
      setError("Invalid repository path.");
      setLoading(false);
      return;
    }
    setReport(null);
    setError(null);
    setLoading(true);
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner, repo }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error((json as { error?: string }).error ?? "Erreur inconnue.");
        }
        return json as Report;
      })
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [owner, repo]);

  useEffect(() => {
    runScan();
  }, [runScan]);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-dl-fg-muted hover:text-dl-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> back
        </Link>
        {loading && <ScanSkeleton owner={owner} repo={repo} />}
        {!loading && error && (
          <ErrorState message={error} owner={owner} repo={repo} onRetry={runScan} />
        )}
        {!loading && report && <Results report={report} />}
      </div>
    </Layout>
  );
}

function ScanSkeleton({ owner, repo }: { owner: string; repo: string }) {
  return (
    <div className="mt-10 space-y-6 sm:space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-xs text-dl-fg-muted">
            Scanning{" "}
            <span className="text-dl-fg">
              {owner}/{repo}
            </span>
            …
          </p>
          <Skeleton className="h-7 w-56 sm:h-8 sm:w-72" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
        <Skeleton className="h-10 w-36 shrink-0" />
      </div>

      <div className="grid gap-6 rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8 md:grid-cols-[auto,1fr] md:items-center">
        <div className="flex justify-center">
          <Skeleton className="h-40 w-40 rounded-full sm:h-[200px] sm:w-[200px]" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      <div className="rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8">
        <Skeleton className="mb-6 h-3 w-20" />
        <div className="space-y-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8">
        <Skeleton className="mb-6 h-3 w-32" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  owner,
  repo,
  onRetry,
}: {
  message: string;
  owner: string;
  repo: string;
  onRetry: () => void;
}) {
  const isRateLimit = /rate limit|retry in|429/i.test(message);
  return (
    <div className="mt-10 animate-fade-in rounded-xl border border-dl-red/40 bg-dl-red/5 p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-dl-red" />
        <div>
          <p className="font-semibold text-dl-fg">
            Impossible de scanner {owner}/{repo}
          </p>
          <p className="mt-1 text-sm text-dl-fg-muted">{message}</p>
          {isRateLimit && (
            <p className="mt-2 font-mono text-xs text-dl-fg-muted">
              💡 Set{" "}
              <code className="rounded bg-dl-bg px-1 py-0.5">GITHUB_TOKEN</code>{" "}
              server-side to raise the limit to 5,000 req/h.
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-dl-border px-4 font-mono text-sm text-dl-fg transition-colors hover:border-dl-fg-muted/40"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-dl-green px-4 font-mono text-sm font-semibold text-black hover:bg-dl-green/90"
        >
          Scanner un autre repo
        </Link>
      </div>
    </div>
  );
}

function Results({ report }: { report: Report }) {
  return (
    <div className="mt-10 animate-fade-in space-y-6 sm:space-y-10">
      <RepoHeader data={report.data} scannedAt={report.scannedAt} />
      <ScoreSection report={report} />
      <BreakdownSection breakdown={report.breakdown} />
      <SignalsSection signals={report.signals} />
      <CtaSection />
    </div>
  );
}

function RepoHeader({
  data,
  scannedAt,
}: {
  data: RepoData;
  scannedAt: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="break-words font-mono text-xl font-bold tracking-tight text-dl-fg sm:text-2xl md:text-3xl">
          {data.fullName}
        </h1>
        {data.description && (
          <p className="mt-2 max-w-2xl text-sm text-dl-fg-muted sm:text-base">
            {data.description}
          </p>
        )}
        <p className="mt-2 font-mono text-xs text-dl-fg-muted">
          scanned on {new Date(scannedAt).toLocaleString("en-US")}
        </p>
      </div>
      <a
        href={data.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-dl-border px-4 font-mono text-xs text-dl-fg transition-colors hover:border-dl-fg-muted/40"
      >
        <Github className="h-4 w-4" /> View on GitHub
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function ScoreSection({ report }: { report: Report }) {
  return (
    <section className="grid gap-6 rounded-xl border border-dl-border bg-dl-surface p-6 sm:gap-8 sm:p-8 md:grid-cols-[auto,1fr] md:items-center">
      <div className="flex flex-col items-center md:items-start">
        <ScoreGauge score={report.score} size="lg" animated />
        {report.fromCache && report.cachedAt && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dl-fg-muted">
            cached result · scanned {timeAgo(report.cachedAt)}
          </p>
        )}
      </div>
      <div>
        <RiskBadge risk={report.risk} />
        <p className="mt-4 text-base leading-relaxed text-dl-fg sm:mt-5 sm:text-lg md:text-xl">
          {report.prediction}
        </p>
      </div>
    </section>
  );
}

function BreakdownSection({ breakdown }: { breakdown: BreakdownData }) {
  return (
    <section className="rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8">
      <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-dl-fg-muted">
        // breakdown
      </h2>
      <div className="mt-6 space-y-5">
        {(Object.keys(MAX) as (keyof BreakdownData)[]).map((key, i) => (
          <BreakdownRow
            key={key}
            label={LABELS[key]}
            value={breakdown[key]}
            max={MAX[key]}
            delay={i * 100}
          />
        ))}
      </div>
    </section>
  );
}

function BreakdownRow({
  label,
  value,
  max,
  delay,
}: {
  label: string;
  value: number;
  max: number;
  delay: number;
}) {
  const [animatedPct, setAnimatedPct] = useState(0);
  useEffect(() => {
    const target = max > 0 ? (value / max) * 100 : 0;
    const id = setTimeout(() => setAnimatedPct(target), 200 + delay);
    return () => clearTimeout(id);
  }, [value, max, delay]);

  const ratio = max > 0 ? value / max : 0;
  const fillColor =
    ratio >= 0.75
      ? "var(--dl-green)"
      : ratio >= 0.5
      ? "var(--dl-amber)"
      : ratio >= 0.25
      ? "var(--dl-orange)"
      : "var(--dl-red)";

  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-xs">
        <span className="text-dl-fg">{label}</span>
        <span className="tabular-nums text-dl-fg-muted">
          {value} / {max}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-dl-border">
        <div
          className="h-full rounded-full"
          style={{
            width: `${animatedPct}%`,
            background: fillColor,
            transition:
              "width 900ms cubic-bezier(0.22, 1, 0.36, 1), background 400ms ease",
          }}
        />
      </div>
    </div>
  );
}

function SignalsSection({ signals }: { signals: string[] }) {
  return (
    <section className="rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8">
      <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-dl-fg-muted">
        // detected signals
      </h2>
      {signals.length === 0 ? (
        <p className="mt-4 text-sm text-dl-fg-muted">Aucun signal remarquable.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {signals.map((s, i) => (
            <SignalItem key={i} signal={s} index={i} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SignalItem({ signal, index }: { signal: string; index: number }) {
  const level = classifySignal(signal);
  const meta =
    level === "critical"
      ? {
          Icon: XCircle,
          color: "text-dl-red",
          border: "border-dl-red/30",
          bg: "bg-dl-red/5",
        }
      : level === "warning"
      ? {
          Icon: AlertTriangle,
          color: "text-dl-amber",
          border: "border-dl-amber/30",
          bg: "bg-dl-amber/5",
        }
      : {
          Icon: CheckCircle2,
          color: "text-dl-green",
          border: "border-dl-green/30",
          bg: "bg-dl-green/5",
        };
  const Icon = meta.Icon;
  return (
    <li
      className={`flex items-start gap-3 rounded-lg border p-3 ${meta.border} ${meta.bg}`}
      style={{
        animation: `fade-in 0.4s ease-out ${index * 70}ms both`,
      }}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.color}`} />
      <span className="text-sm text-dl-fg">{signal}</span>
    </li>
  );
}

function CtaSection() {
  const [copied, setCopied] = useState(false);

  function share() {
    if (typeof window === "undefined") return;
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-dl-green/40 bg-dl-green/5 p-6 shadow-[0_0_60px_-20px_rgba(0,255,136,0.4)] sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-dl-green">
          // continuous monitoring
        </p>
        <h3 className="mt-3 text-lg font-bold text-dl-fg sm:text-xl md:text-2xl">
          Monitor this repo continuously — Team Plan $49/mo
        </h3>
        <p className="mt-2 text-sm text-dl-fg-muted">
          Get a Slack or email alert the moment the score drops. CI integration
          to block risky dependency bumps.
        </p>
        <Link
          href="/#pricing"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-dl-green px-4 font-mono text-sm font-semibold text-black transition-colors hover:bg-dl-green/90"
        >
          See Team Plan <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-dl-fg-muted">
          // early access
        </p>
        <h3 className="mt-3 text-lg font-bold text-dl-fg">
          Get notified when it launches.
        </h3>
        <p className="mt-1 text-sm text-dl-fg-muted">
          Continuous monitoring, Slack alerts, CI integration — coming soon.
        </p>
        <div className="mt-5">
          <EmailCapture variant="inline" />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-dl-border font-mono text-sm text-dl-fg transition-colors hover:border-dl-fg-muted/40"
        >
          <ArrowLeft className="h-4 w-4" /> Scan another repo
        </Link>
        <button
          type="button"
          onClick={share}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-dl-border font-mono text-sm text-dl-fg transition-colors hover:border-dl-fg-muted/40"
        >
          <Share2 className="h-4 w-4" />
          {copied ? "Copied!" : "Share this report"}
        </button>
      </div>
    </section>
  );
}
