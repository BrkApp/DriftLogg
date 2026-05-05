export interface RepoMetadata {
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  language: string | null;
  license: string | null;
  archived: boolean;
  disabled: boolean;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

export interface CommitActivity {
  totalCommits: number;
  daysSinceLastCommit: number;
  commitsLast30Days: number;
  commitsLast90Days: number;
  uniqueAuthorsLast90Days: number;
}

export interface IssueActivity {
  openIssues: number;
  closedIssuesLast90Days: number;
  averageIssueAgeDays: number | null;
  staleIssues: number;
}

export interface ReleaseActivity {
  totalReleases: number;
  daysSinceLastRelease: number | null;
  lastReleaseTag: string | null;
}

export interface ScoreBreakdown {
  commits: number;
  issues: number;
  releases: number;
  maintenance: number;
  community: number;
}

export type DriftRisk = "low" | "moderate" | "elevated" | "high" | "critical";

export interface HealthReport {
  metadata: RepoMetadata;
  commits: CommitActivity;
  issues: IssueActivity;
  releases: ReleaseActivity;
  score: number;
  breakdown: ScoreBreakdown;
  risk: DriftRisk;
  signals: HealthSignal[];
  scannedAt: string;
}

export interface HealthSignal {
  level: "positive" | "warning" | "critical";
  label: string;
  detail: string;
}

export interface ScanRequest {
  owner: string;
  repo: string;
}

export interface ScanError {
  error: string;
  status?: number;
}
