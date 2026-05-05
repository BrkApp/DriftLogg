import { Octokit } from "octokit";

export type ScanErrorKind =
  | "not_found"
  | "private"
  | "rate_limit"
  | "network"
  | "unknown";

export class ScanError extends Error {
  kind: ScanErrorKind;
  status?: number;
  constructor(kind: ScanErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ScanError";
    this.kind = kind;
    this.status = status;
  }
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

  lastCommitAt: string | null;
  daysSinceLastCommit: number;
  commitsLast30Days: number;
  commitsPrior60Days: number;
  velocityRatio: number;

  activeContributors30d: number;

  openIssues: number;
  closedIssuesLast90Days: number;
  avgFirstResponseDays: number | null;

  lastReleaseAt: string | null;
  daysSinceLastRelease: number | null;
  lastReleaseTag: string | null;

  hasSecurityPolicy: boolean;
  hasFunding: boolean;
}

const DAY_MS = 1000 * 60 * 60 * 24;

function daysSince(iso: string | null | undefined): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
}

let cached: Octokit | null = null;

function client(): Octokit {
  if (cached) return cached;
  cached = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: "driftlogg-health-check",
  });
  return cached;
}

function toScanError(err: unknown): ScanError {
  if (err instanceof ScanError) return err;
  const e = err as {
    status?: number;
    message?: string;
    response?: { data?: { message?: string } };
  };
  const status = e?.status;
  const apiMsg = e?.response?.data?.message ?? e?.message ?? "";

  if (status === 404) {
    return new ScanError(
      "not_found",
      "Repository not found. Check the owner/repo and that it is public.",
      404
    );
  }
  if (status === 403) {
    if (/rate limit/i.test(apiMsg)) {
      return new ScanError(
        "rate_limit",
        "GitHub API rate limit exceeded. Set GITHUB_TOKEN to lift the limit.",
        403
      );
    }
    return new ScanError(
      "private",
      "Access denied. The repository may be private.",
      403
    );
  }
  if (status === 401) {
    return new ScanError(
      "private",
      "Authentication failed. Repository may be private.",
      401
    );
  }
  return new ScanError(
    "unknown",
    apiMsg || "Unexpected error while contacting the GitHub API.",
    status
  );
}

async function fetchRepoBase(octokit: Octokit, owner: string, repo: string) {
  const { data } = await octokit.rest.repos.get({ owner, repo });
  return data;
}

async function fetchCommitWindow(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{
  last30: number;
  prior60: number;
  lastCommitAt: string | null;
  activeContributors30d: number;
}> {
  const since90 = new Date(Date.now() - 90 * DAY_MS).toISOString();
  const cutoff30 = Date.now() - 30 * DAY_MS;

  let last30 = 0;
  let prior60 = 0;
  let lastCommitAt: string | null = null;
  const authors30 = new Set<string>();

  for (let page = 1; page <= 5; page++) {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      since: since90,
      per_page: 100,
      page,
    });
    if (data.length === 0) break;
    for (const c of data) {
      const date = c.commit.author?.date ?? c.commit.committer?.date ?? null;
      if (!date) continue;
      if (!lastCommitAt) lastCommitAt = date;
      const t = new Date(date).getTime();
      if (t >= cutoff30) {
        last30++;
        const id =
          c.author?.login ?? c.commit.author?.email ?? c.commit.author?.name ?? null;
        if (id) authors30.add(id);
      } else {
        prior60++;
      }
    }
    if (data.length < 100) break;
  }

  if (!lastCommitAt) {
    try {
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 1,
      });
      lastCommitAt = data[0]?.commit.author?.date ?? null;
    } catch {
      // empty repo or no permission to list — leave null
    }
  }

  return {
    last30,
    prior60,
    lastCommitAt,
    activeContributors30d: authors30.size,
  };
}

async function fetchIssueCounts(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ open: number; closedLast90: number }> {
  const sinceDate = new Date(Date.now() - 90 * DAY_MS).toISOString().slice(0, 10);
  const [openRes, closedRes] = await Promise.all([
    octokit.rest.search.issuesAndPullRequests({
      q: `repo:${owner}/${repo} is:issue is:open`,
      per_page: 1,
    }),
    octokit.rest.search.issuesAndPullRequests({
      q: `repo:${owner}/${repo} is:issue is:closed closed:>=${sinceDate}`,
      per_page: 1,
    }),
  ]);
  return {
    open: openRes.data.total_count,
    closedLast90: closedRes.data.total_count,
  };
}

async function fetchAvgFirstResponseDays(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<number | null> {
  const since = new Date(Date.now() - 90 * DAY_MS).toISOString();
  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "all",
    sort: "created",
    direction: "desc",
    since,
    per_page: 30,
  });
  const sample = issues
    .filter((i) => !i.pull_request && (i.comments ?? 0) > 0)
    .slice(0, 15);
  if (sample.length === 0) return null;

  const responses = await Promise.all(
    sample.map(async (issue) => {
      try {
        const { data: comments } = await octokit.rest.issues.listComments({
          owner,
          repo,
          issue_number: issue.number,
          per_page: 5,
        });
        const firstReply = comments.find(
          (c) => c.user && issue.user && c.user.login !== issue.user.login
        );
        if (!firstReply) return null;
        return (
          (new Date(firstReply.created_at).getTime() -
            new Date(issue.created_at).getTime()) /
          DAY_MS
        );
      } catch {
        return null;
      }
    })
  );

  const valid = responses.filter((n): n is number => typeof n === "number" && n >= 0);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

async function fetchLatestRelease(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ at: string | null; tag: string | null }> {
  try {
    const { data } = await octokit.rest.repos.getLatestRelease({ owner, repo });
    return { at: data.published_at ?? data.created_at, tag: data.tag_name };
  } catch (err) {
    if ((err as { status?: number })?.status === 404) {
      return { at: null, tag: null };
    }
    throw err;
  }
}

async function fileExists(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<boolean> {
  try {
    await octokit.rest.repos.getContent({ owner, repo, path });
    return true;
  } catch (err) {
    const status = (err as { status?: number })?.status;
    if (status === 404) return false;
    return false;
  }
}

async function detectSecurityPolicy(octokit: Octokit, owner: string, repo: string) {
  const candidates = ["SECURITY.md", ".github/SECURITY.md", "docs/SECURITY.md"];
  for (const path of candidates) {
    if (await fileExists(octokit, owner, repo, path)) return true;
  }
  return false;
}

async function detectFunding(octokit: Octokit, owner: string, repo: string) {
  const candidates = [".github/FUNDING.yml", ".github/FUNDING.yaml", "FUNDING.yml"];
  for (const path of candidates) {
    if (await fileExists(octokit, owner, repo, path)) return true;
  }
  return false;
}

export async function fetchRepoHealth(
  owner: string,
  repo: string
): Promise<RepoHealthData> {
  const octokit = client();

  let base: Awaited<ReturnType<typeof fetchRepoBase>>;
  try {
    base = await fetchRepoBase(octokit, owner, repo);
  } catch (err) {
    throw toScanError(err);
  }

  try {
    const [commitWindow, issueCounts, avgFirstResponseDays, release, hasSecurityPolicy, hasFunding] =
      await Promise.all([
        fetchCommitWindow(octokit, base.owner.login, base.name),
        fetchIssueCounts(octokit, base.owner.login, base.name),
        fetchAvgFirstResponseDays(octokit, base.owner.login, base.name),
        fetchLatestRelease(octokit, base.owner.login, base.name),
        detectSecurityPolicy(octokit, base.owner.login, base.name),
        detectFunding(octokit, base.owner.login, base.name),
      ]);

    const stars = base.stargazers_count;
    const forks = base.forks_count;
    const forkStarRatio = stars > 0 ? forks / stars : 0;

    const recentRate = commitWindow.last30 / 30;
    const priorRate = commitWindow.prior60 / 60;
    let velocityRatio: number;
    if (priorRate === 0 && recentRate === 0) velocityRatio = 0;
    else if (priorRate === 0) velocityRatio = Number.POSITIVE_INFINITY;
    else velocityRatio = recentRate / priorRate;

    return {
      owner: base.owner.login,
      repo: base.name,
      fullName: base.full_name,
      description: base.description,
      url: base.html_url,
      language: base.language,
      license: base.license?.spdx_id ?? base.license?.name ?? null,
      archived: base.archived,
      disabled: base.disabled,

      stars,
      forks,
      forkStarRatio,

      lastCommitAt: commitWindow.lastCommitAt,
      daysSinceLastCommit: daysSince(commitWindow.lastCommitAt),
      commitsLast30Days: commitWindow.last30,
      commitsPrior60Days: commitWindow.prior60,
      velocityRatio,

      activeContributors30d: commitWindow.activeContributors30d,

      openIssues: issueCounts.open,
      closedIssuesLast90Days: issueCounts.closedLast90,
      avgFirstResponseDays,

      lastReleaseAt: release.at,
      daysSinceLastRelease: release.at === null ? null : daysSince(release.at),
      lastReleaseTag: release.tag,

      hasSecurityPolicy,
      hasFunding,
    };
  } catch (err) {
    throw toScanError(err);
  }
}
