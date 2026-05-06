"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Github,
  Loader2,
  Share2,
  XCircle,
} from "lucide-react";

type Risk = "low" | "medium" | "high" | "critical";

interface BreakdownData {
  velocity: number;
  responsiveness: number;
  community: number;
  freshness: number;
  trust: number;
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
}

const MAX: Record<keyof BreakdownData, number> = {
  velocity: 30,
  responsiveness: 25,
  community: 20,
  freshness: 15,
  trust: 10,
};

const LABELS: Record<keyof BreakdownData, string> = {
  velocity: "Vélocité",
  responsiveness: "Réactivité",
  community: "Communauté",
  freshness: "Fraîcheur",
  trust: "Confiance",
};

const RISK_STYLES: Record<
  Risk,
  { label: string; border: string; text: string; bg: string }
> = {
  low: {
    label: "LOW",
    border: "border-[#00FF88]",
    text: "text-[#00FF88]",
    bg: "bg-[#00FF88]/10",
  },
  medium: {
    label: "MEDIUM",
    border: "border-yellow-500",
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  high: {
    label: "HIGH",
    border: "border-orange-500",
    text: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  critical: {
    label: "CRITICAL",
    border: "border-[#FF4444]",
    text: "text-[#FF4444]",
    bg: "bg-[#FF4444]/10",
  },
};

function scoreColor(score: number): string {
  if (score >= 80) return "#00FF88";
  if (score >= 60) return "#EAB308";
  if (score >= 35) return "#F97316";
  return "#FF4444";
}

function classifySignal(s: string): "critical" | "warning" | "healthy" {
  if (
    /archivé|désactivé|abandonné|Aucun commit récent détectable|Aucune activité de commit/i.test(
      s
    )
  ) {
    return "critical";
  }
  const longGap = s.match(/Aucun commit depuis (\d+)\s*mois/);
  if (longGap && Number(longGap[1]) >= 12) return "critical";
  if (/en hausse|très réactifs|contributeurs actifs/i.test(s)) return "healthy";
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

  useEffect(() => {
    let cancelled = false;
    setReport(null);
    setError(null);
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner, repo }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(
            (json as { error?: string }).error ?? "Erreur inconnue."
          );
        }
        return json as Report;
      })
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 antialiased">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 hover:text-zinc-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> retour
        </Link>
        {!report && !error && <Loading owner={owner} repo={repo} />}
        {error && <ErrorState message={error} owner={owner} repo={repo} />}
        {report && <Results report={report} />}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-mono text-sm font-semibold">
          DriftLogg
        </Link>
        <Link
          href="/#pricing"
          className="font-mono text-xs text-zinc-400 hover:text-[#00FF88]"
        >
          pricing
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-900">
      <div className="mx-auto max-w-5xl px-6 py-8 font-mono text-xs text-zinc-500">
        Built for engineering teams who&apos;ve been burned before.
      </div>
    </footer>
  );
}

function Loading({ owner, repo }: { owner: string; repo: string }) {
  const lines = [
    "fetching repository metadata",
    "analyzing commit cadence (90d window)",
    "sampling issue triage response",
    "computing drift score",
  ];
  const [step, setStep] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => (s < lines.length - 1 ? s + 1 : s)),
      650
    );
    return () => clearInterval(id);
  }, [lines.length]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 4), 380);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-10 rounded-xl border border-zinc-900 bg-zinc-950 p-6 md:p-8">
      <p className="font-mono text-sm md:text-base">
        <span className="text-[#00FF88]">$</span> scanning{" "}
        <span className="font-semibold text-zinc-100">
          {owner}/{repo}
        </span>
        <span className="text-[#00FF88]">{".".repeat(tick)}</span>
      </p>
      <div className="mt-6 space-y-2 font-mono text-xs text-zinc-500">
        {lines.map((line, i) => {
          if (i > step) return null;
          const isCurrent = i === step;
          return (
            <p key={line} className="flex items-center gap-2">
              {isCurrent ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF88]" />
              )}
              <span>{line}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
}

function ErrorState({
  message,
  owner,
  repo,
}: {
  message: string;
  owner: string;
  repo: string;
}) {
  return (
    <div className="mt-10 rounded-xl border border-[#FF4444]/40 bg-[#FF4444]/5 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#FF4444]" />
        <div>
          <p className="font-semibold">
            Impossible de scanner {owner}/{repo}
          </p>
          <p className="mt-1 text-sm text-zinc-400">{message}</p>
        </div>
      </div>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#00FF88] px-4 font-mono text-sm font-semibold text-black hover:bg-[#00FF88]/90"
        >
          Scanner un autre repo
        </Link>
      </div>
    </div>
  );
}

function Results({ report }: { report: Report }) {
  return (
    <div className="mt-10 space-y-10">
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
      <div>
        <h1 className="font-mono text-2xl font-bold tracking-tight md:text-3xl">
          {data.fullName}
        </h1>
        {data.description && (
          <p className="mt-2 max-w-2xl text-zinc-400">{data.description}</p>
        )}
        <p className="mt-2 font-mono text-xs text-zinc-600">
          scanné le {new Date(scannedAt).toLocaleString("fr-FR")}
        </p>
      </div>
      <a
        href={data.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-800 px-4 font-mono text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
      >
        <Github className="h-4 w-4" /> View on GitHub
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function ScoreSection({ report }: { report: Report }) {
  return (
    <section className="grid gap-8 rounded-xl border border-zinc-900 bg-zinc-950 p-8 md:grid-cols-[auto,1fr] md:items-center">
      <div className="flex justify-center md:justify-start">
        <ScoreRing score={report.score} />
      </div>
      <div>
        <RiskBadge risk={report.risk} />
        <p className="mt-5 text-lg leading-relaxed text-zinc-200 md:text-xl">
          {report.prediction}
        </p>
      </div>
    </section>
  );
}

function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(score));
    return () => cancelAnimationFrame(id);
  }, [score]);

  const color = scoreColor(score);
  const size = 200;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1a1a1a"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition:
              "stroke-dashoffset 1100ms cubic-bezier(0.22, 1, 0.36, 1), stroke 400ms ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono text-5xl font-bold tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          / 100
        </span>
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: Risk }) {
  const s = RISK_STYLES[risk];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-semibold ${s.border} ${s.text} ${s.bg}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "currentColor" }}
      />
      {s.label} DRIFT RISK
    </span>
  );
}

function BreakdownSection({ breakdown }: { breakdown: BreakdownData }) {
  return (
    <section className="rounded-xl border border-zinc-900 bg-zinc-950 p-6 md:p-8">
      <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
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
    const id = setTimeout(() => setAnimatedPct(target), 60 + delay);
    return () => clearTimeout(id);
  }, [value, max, delay]);

  const ratio = max > 0 ? value / max : 0;
  const fillColor =
    ratio >= 0.75
      ? "#00FF88"
      : ratio >= 0.5
      ? "#EAB308"
      : ratio >= 0.25
      ? "#F97316"
      : "#FF4444";

  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-xs">
        <span className="text-zinc-300">{label}</span>
        <span className="tabular-nums text-zinc-500">
          {value} / {max}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-900">
        <div
          className="h-full rounded-full"
          style={{
            width: `${animatedPct}%`,
            background: fillColor,
            transition:
              "width 1000ms cubic-bezier(0.22, 1, 0.36, 1), background 400ms ease",
          }}
        />
      </div>
    </div>
  );
}

function SignalsSection({ signals }: { signals: string[] }) {
  return (
    <section className="rounded-xl border border-zinc-900 bg-zinc-950 p-6 md:p-8">
      <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
        // signaux détectés
      </h2>
      {signals.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-400">Aucun signal remarquable.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {signals.map((s, i) => (
            <SignalItem key={i} signal={s} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SignalItem({ signal }: { signal: string }) {
  const level = classifySignal(signal);
  const meta =
    level === "critical"
      ? {
          Icon: XCircle,
          color: "text-[#FF4444]",
          border: "border-[#FF4444]/30",
          bg: "bg-[#FF4444]/5",
          emoji: "🔴",
        }
      : level === "warning"
      ? {
          Icon: AlertTriangle,
          color: "text-yellow-400",
          border: "border-yellow-500/30",
          bg: "bg-yellow-500/5",
          emoji: "⚠️",
        }
      : {
          Icon: CheckCircle2,
          color: "text-[#00FF88]",
          border: "border-[#00FF88]/30",
          bg: "bg-[#00FF88]/5",
          emoji: "✅",
        };
  const Icon = meta.Icon;
  return (
    <li
      className={`flex items-start gap-3 rounded-lg border p-3 ${meta.border} ${meta.bg}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.color}`} />
      <span className="text-sm text-zinc-200">
        <span className="mr-2 font-mono text-xs text-zinc-500">
          {meta.emoji}
        </span>
        {signal}
      </span>
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
      .catch(() => {
        // clipboard may be unavailable
      });
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-[#00FF88]/40 bg-[#00FF88]/5 p-6 shadow-[0_0_60px_-20px_rgba(0,255,136,0.4)] md:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#00FF88]">
          // monitoring continu
        </p>
        <h3 className="mt-3 text-xl font-semibold md:text-2xl">
          Surveillez ce repo en continu — Team Plan $49/mois
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          Recevez une alerte Slack ou email dès que le score chute. Intégration
          CI pour bloquer les bumps risqués.
        </p>
        <Link
          href="/#pricing"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-[#00FF88] px-4 font-mono text-sm font-semibold text-black transition-colors hover:bg-[#00FF88]/90"
        >
          Voir Team Plan <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-zinc-800 font-mono text-sm text-zinc-200 transition-colors hover:border-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Scanner un autre repo
        </Link>
        <button
          type="button"
          onClick={share}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-zinc-800 font-mono text-sm text-zinc-200 transition-colors hover:border-zinc-700 hover:text-white"
        >
          <Share2 className="h-4 w-4" />
          {copied ? "URL copiée !" : "Partagez ce rapport"}
        </button>
      </div>
    </section>
  );
}
