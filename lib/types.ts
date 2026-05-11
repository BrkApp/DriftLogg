/** Canonical TypeScript types shared across the application. No business logic here. */

// ── Risk & scoring ────────────────────────────────────────────────────────────

export type Risk = "low" | "medium" | "high" | "critical";

export interface ScoreBreakdown {
  velocity: number;
  responsiveness: number;
  community: number;
  freshness: number;
  trust: number;
  social: number;
}

export interface HealthScore {
  score: number;
  risk: Risk;
  breakdown: ScoreBreakdown;
  signals: string[];
  prediction: string;
}

// ── GitHub data ───────────────────────────────────────────────────────────────

export interface SocialSignals {
  hasCommunityBadge: boolean;
  hasDeprecatedBadge: boolean;
  isMaintenanceModeReadme: boolean;
  hasSponsorsFunding: boolean;
  hasCIBadge: boolean;
  hasDiscussions: boolean;
  helpWantedCount: number;
  staleWontfixCount: number;
}

export interface RepoHealthData {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  license: string | null;
  archived: boolean;
  disabled: boolean;

  stars: number;
  forks: number;
  forkStarRatio: number;
  repoAgeYears: number;

  lastHumanCommitAt: string | null;
  daysSinceLastCommit: number;
  commitsLast30Days: number;
  commitsPrior60Days: number;
  velocityRatio: number;

  activeContributors30d: number;
  activeContributors90d: number;
  topContributorShare90d: number;
  isMaintenanceModeOnly: boolean;

  openIssues: number;
  closedIssuesLast90Days: number;
  avgFirstResponseDays: number | null;

  lastReleaseAt: string | null;
  daysSinceLastRelease: number | null;
  lastReleaseTag: string | null;

  hasSecurityPolicy: boolean;
  hasFunding: boolean;
  socialSignals: SocialSignals;
  weeklyNpmDownloads: number | null;
}

// ── Scan API response ─────────────────────────────────────────────────────────

export interface ScanRepoData {
  fullName: string;
  description: string | null;
  url: string;
  archived: boolean;
}

export interface ScanApiResponse extends HealthScore {
  data: ScanRepoData;
  scannedAt: string;
  fromCache?: boolean;
  cachedAt?: string;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export interface ReportFrontmatter {
  title: string;
  date: string;
  description: string;
  tags: string[];
}

export interface ReportMeta extends ReportFrontmatter {
  slug: string;
}

export interface Report extends ReportMeta {
  content: string;
}

// ── Cache ─────────────────────────────────────────────────────────────────────

export interface CacheEntry {
  value: unknown;
  cachedAt: number;
  expiresAt: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  driver: "memory" | "kv";
}

export interface CacheHit<T = unknown> {
  value: T;
  cachedAt: number;
}
