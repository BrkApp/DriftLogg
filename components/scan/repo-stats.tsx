import {
  GitCommit,
  GitFork,
  History,
  MessageSquare,
  Package,
  Star,
  Users,
} from "lucide-react";
import type { HealthReport } from "@/lib/types";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof GitCommit;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function days(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "today";
  if (n === 1) return "1d ago";
  if (n < 30) return `${n}d ago`;
  if (n < 365) return `${Math.floor(n / 30)}mo ago`;
  return `${Math.floor(n / 365)}y ago`;
}

export function RepoStats({ report }: { report: HealthReport }) {
  const { metadata, commits, issues, releases } = report;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard icon={Star} label="Stars" value={fmt(metadata.stars)} />
      <StatCard icon={GitFork} label="Forks" value={fmt(metadata.forks)} />
      <StatCard
        icon={GitCommit}
        label="Last commit"
        value={days(commits.daysSinceLastCommit)}
        hint={`${commits.commitsLast90Days} commits / 90d`}
      />
      <StatCard
        icon={Users}
        label="Contributors"
        value={String(commits.uniqueAuthorsLast90Days)}
        hint="last 90 days"
      />
      <StatCard
        icon={MessageSquare}
        label="Open issues"
        value={fmt(issues.openIssues)}
        hint={`${issues.staleIssues} stale (>180d)`}
      />
      <StatCard
        icon={History}
        label="Closed (90d)"
        value={String(issues.closedIssuesLast90Days)}
      />
      <StatCard
        icon={Package}
        label="Last release"
        value={
          releases.daysSinceLastRelease === null
            ? "—"
            : days(releases.daysSinceLastRelease)
        }
        hint={releases.lastReleaseTag ?? "no releases"}
      />
      <StatCard
        icon={Package}
        label="License"
        value={metadata.license ?? "none"}
        hint={metadata.archived ? "archived" : metadata.language ?? "—"}
      />
    </div>
  );
}
