import type {
  CommitActivity,
  DriftRisk,
  HealthSignal,
  IssueActivity,
  ReleaseActivity,
  RepoMetadata,
  ScoreBreakdown,
} from "./types";

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function scoreCommits(c: CommitActivity): number {
  if (!Number.isFinite(c.daysSinceLastCommit)) return 0;
  let score = 100;
  if (c.daysSinceLastCommit > 365) score -= 70;
  else if (c.daysSinceLastCommit > 180) score -= 50;
  else if (c.daysSinceLastCommit > 90) score -= 30;
  else if (c.daysSinceLastCommit > 30) score -= 10;

  if (c.commitsLast90Days === 0) score -= 30;
  else if (c.commitsLast90Days < 5) score -= 15;
  else if (c.commitsLast90Days < 15) score -= 5;

  return clamp(score);
}

function scoreIssues(i: IssueActivity): number {
  let score = 100;
  if (i.closedIssuesLast90Days === 0 && i.openIssues > 10) score -= 30;
  else if (i.closedIssuesLast90Days < 3 && i.openIssues > 20) score -= 15;

  if (i.staleIssues > 50) score -= 30;
  else if (i.staleIssues > 20) score -= 15;
  else if (i.staleIssues > 5) score -= 5;

  if (i.averageIssueAgeDays !== null) {
    if (i.averageIssueAgeDays > 365) score -= 15;
    else if (i.averageIssueAgeDays > 180) score -= 8;
  }

  return clamp(score);
}

function scoreReleases(r: ReleaseActivity): number {
  if (r.totalReleases === 0) return 60;
  if (r.daysSinceLastRelease === null) return 60;
  let score = 100;
  if (r.daysSinceLastRelease > 540) score -= 60;
  else if (r.daysSinceLastRelease > 365) score -= 40;
  else if (r.daysSinceLastRelease > 180) score -= 20;
  else if (r.daysSinceLastRelease > 90) score -= 10;
  return clamp(score);
}

function scoreMaintenance(m: RepoMetadata): number {
  if (m.archived) return 0;
  if (m.disabled) return 5;
  let score = 100;
  if (!m.license) score -= 15;
  if (!m.description) score -= 5;
  const daysSincePush = (Date.now() - new Date(m.pushedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePush > 365) score -= 40;
  else if (daysSincePush > 180) score -= 20;
  else if (daysSincePush > 90) score -= 10;
  return clamp(score);
}

function scoreCommunity(m: RepoMetadata, c: CommitActivity): number {
  let score = 50;
  if (m.stars > 10000) score += 25;
  else if (m.stars > 1000) score += 20;
  else if (m.stars > 100) score += 10;
  else if (m.stars < 10) score -= 10;

  if (c.uniqueAuthorsLast90Days >= 10) score += 25;
  else if (c.uniqueAuthorsLast90Days >= 5) score += 15;
  else if (c.uniqueAuthorsLast90Days >= 2) score += 5;
  else if (c.uniqueAuthorsLast90Days <= 1) score -= 15;

  return clamp(score);
}

const WEIGHTS = {
  commits: 0.3,
  issues: 0.15,
  releases: 0.15,
  maintenance: 0.25,
  community: 0.15,
} as const;

export function computeScore(
  metadata: RepoMetadata,
  commits: CommitActivity,
  issues: IssueActivity,
  releases: ReleaseActivity
): { score: number; breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    commits: scoreCommits(commits),
    issues: scoreIssues(issues),
    releases: scoreReleases(releases),
    maintenance: scoreMaintenance(metadata),
    community: scoreCommunity(metadata, commits),
  };

  const weighted =
    breakdown.commits * WEIGHTS.commits +
    breakdown.issues * WEIGHTS.issues +
    breakdown.releases * WEIGHTS.releases +
    breakdown.maintenance * WEIGHTS.maintenance +
    breakdown.community * WEIGHTS.community;

  return { score: Math.round(weighted), breakdown };
}

export function classifyRisk(score: number, metadata: RepoMetadata): DriftRisk {
  if (metadata.archived) return "critical";
  if (score >= 80) return "low";
  if (score >= 65) return "moderate";
  if (score >= 45) return "elevated";
  if (score >= 25) return "high";
  return "critical";
}

export function buildSignals(
  metadata: RepoMetadata,
  commits: CommitActivity,
  issues: IssueActivity,
  releases: ReleaseActivity
): HealthSignal[] {
  const signals: HealthSignal[] = [];

  if (metadata.archived) {
    signals.push({
      level: "critical",
      label: "Repository is archived",
      detail: "The maintainer has explicitly archived this repo. No further updates will ship.",
    });
  }

  if (commits.daysSinceLastCommit > 365) {
    signals.push({
      level: "critical",
      label: "No commits in over a year",
      detail: `Last commit was ${commits.daysSinceLastCommit} days ago. Strong drift signal.`,
    });
  } else if (commits.daysSinceLastCommit > 180) {
    signals.push({
      level: "warning",
      label: "Commit activity has stalled",
      detail: `Last commit was ${commits.daysSinceLastCommit} days ago.`,
    });
  } else if (commits.daysSinceLastCommit < 14) {
    signals.push({
      level: "positive",
      label: "Active commit cadence",
      detail: `Last commit was only ${commits.daysSinceLastCommit} day${commits.daysSinceLastCommit === 1 ? "" : "s"} ago.`,
    });
  }

  if (commits.uniqueAuthorsLast90Days <= 1) {
    signals.push({
      level: "warning",
      label: "Bus factor of 1",
      detail: "Only one contributor active in the last 90 days. Sustainability risk.",
    });
  } else if (commits.uniqueAuthorsLast90Days >= 5) {
    signals.push({
      level: "positive",
      label: "Healthy contributor base",
      detail: `${commits.uniqueAuthorsLast90Days} unique contributors in the last 90 days.`,
    });
  }

  if (issues.openIssues > 50 && issues.closedIssuesLast90Days < 5) {
    signals.push({
      level: "warning",
      label: "Issue triage is lagging",
      detail: `${issues.openIssues} open issues, only ${issues.closedIssuesLast90Days} closed in 90 days.`,
    });
  }

  if (issues.staleIssues > 20) {
    signals.push({
      level: "warning",
      label: "Stale issue backlog",
      detail: `${issues.staleIssues} issues open for more than 6 months.`,
    });
  }

  if (releases.totalReleases > 0 && releases.daysSinceLastRelease !== null) {
    if (releases.daysSinceLastRelease > 365) {
      signals.push({
        level: "warning",
        label: "No release in over a year",
        detail: `Last release ${releases.lastReleaseTag ?? ""} was ${releases.daysSinceLastRelease} days ago.`,
      });
    } else if (releases.daysSinceLastRelease < 90) {
      signals.push({
        level: "positive",
        label: "Recent release shipped",
        detail: `${releases.lastReleaseTag} was published ${releases.daysSinceLastRelease} days ago.`,
      });
    }
  }

  if (!metadata.license) {
    signals.push({
      level: "warning",
      label: "No license detected",
      detail: "Adoption risk: ambiguous legal status for downstream users.",
    });
  }

  return signals;
}
