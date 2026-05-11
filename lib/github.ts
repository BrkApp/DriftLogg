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

const DAY_MS = 1000 * 60 * 60 * 24;

// ─── Bot / automation detection ───────────────────────────────────────────────

const BOT_LOGINS = new Set([
  "dependabot[bot]",
  "dependabot-preview[bot]",
  "renovate[bot]",
  "renovate-bot",
  "github-actions[bot]",
  "snyk-bot",
  "snyk-io[bot]",
  "greenkeeper[bot]",
  "imgbot[bot]",
  "allcontributors[bot]",
  "semantic-release-bot",
  "release-please[bot]",
  "changesets-bot[bot]",
  "kodiak[bot]",
  "mergify[bot]",
]);

function isBot(login: string | null | undefined): boolean {
  if (!login) return false;
  const l = login.toLowerCase();
  return BOT_LOGINS.has(l) || l.endsWith("[bot]");
}

// ─── Maintenance-mode commit detection ───────────────────────────────────────

const MAINT_PATTERNS = [
  /^(chore|deps|build|ci)(\([^)]+\))?\s*:\s*(bump|update|upgrade|release|version)/i,
  /^bump \S+ from \S+ to \S+/i,
  /^(update|upgrade)\s+(dep(endenc(ies|y))?|package[s]?|lib(rarie)?s?)/i,
  /^(release|cut)\s+v?\d+\.\d+/i,
  /^v?\d+\.\d+\.\d+\s*$/,
  /^chore(release)?\s*:/i,
];

function isMaintenanceMsg(msg: string): boolean {
  const first = msg.split("\n")[0].trim();
  return MAINT_PATTERNS.some((re) => re.test(first));
}

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
  lastHumanCommitAt: string | null;
  activeContributors30d: number;
  activeContributors90d: number;
  topContributorShare90d: number;
  isMaintenanceModeOnly: boolean;
}> {
  const since90 = new Date(Date.now() - 90 * DAY_MS).toISOString();
  const cutoff30 = Date.now() - 30 * DAY_MS;

  let humanLast30 = 0;
  let humanPrior60 = 0;
  let lastHumanCommitAt: string | null = null;

  const authors30 = new Set<string>();
  const authors90 = new Map<string, number>(); // login → commit count
  const humanMsgs30: string[] = [];

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
      const authorLogin = c.author?.login ?? null;
      const committerLogin = c.committer?.login ?? null;

      // Skip automated bot commits entirely
      if (isBot(authorLogin) || isBot(committerLogin)) continue;

      const date = c.commit.author?.date ?? c.commit.committer?.date ?? null;
      if (!date) continue;
      if (!lastHumanCommitAt) lastHumanCommitAt = date;

      const identity =
        authorLogin ?? c.commit.author?.email ?? c.commit.author?.name ?? "unknown";

      const t = new Date(date).getTime();
      if (t >= cutoff30) {
        humanLast30++;
        authors30.add(identity);
        humanMsgs30.push(c.commit.message ?? "");
      } else {
        humanPrior60++;
      }

      authors90.set(identity, (authors90.get(identity) ?? 0) + 1);
    }

    if (data.length < 100) break;
  }

  // If no human commit found in 90-day window, scan recent history for the last one
  if (!lastHumanCommitAt) {
    try {
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 20,
      });
      for (const c of data) {
        if (!isBot(c.author?.login) && !isBot(c.committer?.login)) {
          lastHumanCommitAt = c.commit.author?.date ?? null;
          break;
        }
      }
    } catch {
      // empty repo or no access — leave null
    }
  }

  // Bus factor: fraction of 90-day human commits from top contributor
  const total90 = humanLast30 + humanPrior60;
  let topContributorShare90d = 0;
  if (total90 > 0 && authors90.size > 0) {
    topContributorShare90d = Math.max(...authors90.values()) / total90;
  }

  // Maintenance mode: ≥70% of last-30d human commits are pure automation/version bumps
  let isMaintenanceModeOnly = false;
  if (humanMsgs30.length >= 3) {
    const maintCount = humanMsgs30.filter(isMaintenanceMsg).length;
    isMaintenanceModeOnly = maintCount / humanMsgs30.length >= 0.7;
  }

  return {
    last30: humanLast30,
    prior60: humanPrior60,
    lastHumanCommitAt,
    activeContributors30d: authors30.size,
    activeContributors90d: authors90.size,
    topContributorShare90d,
    isMaintenanceModeOnly,
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

async function fetchSocialSignals(
  octokit: Octokit,
  owner: string,
  repo: string,
  hasDiscussions: boolean
): Promise<SocialSignals> {
  const [readmeResult, userResult, helpWantedResult, staleResult] =
    await Promise.allSettled([
      octokit.rest.repos.getContent({ owner, repo, path: "README.md" }),
      octokit.rest.users.getByUsername({ username: owner }),
      octokit.rest.search.issuesAndPullRequests({
        q: `repo:${owner}/${repo} is:issue is:open label:"help wanted"`,
        per_page: 1,
      }),
      octokit.rest.search.issuesAndPullRequests({
        q: `repo:${owner}/${repo} is:issue is:open label:stale`,
        per_page: 1,
      }),
    ]);

  let hasCommunityBadge = false;
  let hasDeprecatedBadge = false;
  let isMaintenanceModeReadme = false;
  let hasSponsorsFunding = false;
  let hasCIBadge = false;

  if (readmeResult.status === "fulfilled") {
    const fileData = readmeResult.value.data;
    let content = "";
    if (
      !Array.isArray(fileData) &&
      "content" in fileData &&
      typeof fileData.content === "string"
    ) {
      content = Buffer.from(fileData.content, "base64").toString("utf-8");
    }
    if (content) {
      hasCommunityBadge =
        /discord\.gg|discord\.com\/invite|discordapp\.com|slack\.com/i.test(content);
      hasDeprecatedBadge =
        /shields\.io\/badge\/[^)]*[-(](deprecated|inactive|unmaintained)/i.test(content) ||
        /^\s*#+[^#\n]*\b(deprecated|unmaintained)\b/im.test(content) ||
        /\bthis (project|package|repo|repository) is (deprecated|unmaintained|no longer maintained)\b/i.test(
          content
        );
      isMaintenanceModeReadme =
        /\b(maintenance[- ]mode|in maintenance|no (new )?features?|bug[- ]fix(es)? only|security[- ]only|no longer actively (developed|maintained))\b/i.test(
          content
        ) ||
        /^\s*#+[^#\n]*\b(maintenance mode|end[ -]of[ -]life|eol)\b/im.test(content);
      hasSponsorsFunding =
        /opencollective\.com|github\.com\/sponsors|patreon\.com|liberapay\.com/i.test(
          content
        );
      hasCIBadge =
        /travis-ci\.(org|com)|circleci\.com|github\.com\/[^/\s]+\/[^/\s]+\/actions/i.test(
          content
        );
    }
  }

  if (userResult.status === "fulfilled") {
    const u = userResult.value.data as Record<string, unknown>;
    if (u.has_sponsors_listing) hasSponsorsFunding = true;
  }

  const helpWantedCount =
    helpWantedResult.status === "fulfilled"
      ? helpWantedResult.value.data.total_count
      : 0;

  const staleWontfixCount =
    staleResult.status === "fulfilled"
      ? staleResult.value.data.total_count
      : 0;

  return {
    hasCommunityBadge,
    hasDeprecatedBadge,
    isMaintenanceModeReadme,
    hasSponsorsFunding,
    hasCIBadge,
    hasDiscussions,
    helpWantedCount,
    staleWontfixCount,
  };
}

async function fetchNpmDownloads(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<number | null> {
  let packageName: string | null = null;
  try {
    const res = await octokit.rest.repos.getContent({ owner, repo, path: "package.json" });
    if ("content" in res.data && typeof res.data.content === "string") {
      const parsed = JSON.parse(Buffer.from(res.data.content, "base64").toString("utf-8"));
      packageName = typeof parsed.name === "string" ? parsed.name : null;
    }
  } catch {
    return null;
  }
  if (!packageName) return null;
  try {
    const r = await fetch(
      `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`
    );
    if (!r.ok) return null;
    const d = (await r.json()) as { downloads?: number };
    return typeof d.downloads === "number" ? d.downloads : null;
  } catch {
    return null;
  }
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
    const hasDiscussions =
      (base as unknown as Record<string, unknown>).has_discussions === true;

    const [commitWindow, issueCounts, avgFirstResponseDays, release, hasSecurityPolicy, hasFunding, socialSignals, weeklyNpmDownloads] =
      await Promise.all([
        fetchCommitWindow(octokit, base.owner.login, base.name),
        fetchIssueCounts(octokit, base.owner.login, base.name),
        fetchAvgFirstResponseDays(octokit, base.owner.login, base.name),
        fetchLatestRelease(octokit, base.owner.login, base.name),
        detectSecurityPolicy(octokit, base.owner.login, base.name),
        detectFunding(octokit, base.owner.login, base.name),
        fetchSocialSignals(octokit, base.owner.login, base.name, hasDiscussions),
        fetchNpmDownloads(octokit, base.owner.login, base.name),
      ]);

    const stars = base.stargazers_count;
    const forks = base.forks_count;
    const forkStarRatio = stars > 0 ? forks / stars : 0;
    const repoAgeYears = (Date.now() - new Date(base.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365.25);

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
      repoAgeYears,

      lastHumanCommitAt: commitWindow.lastHumanCommitAt,
      daysSinceLastCommit: daysSince(commitWindow.lastHumanCommitAt),
      commitsLast30Days: commitWindow.last30,
      commitsPrior60Days: commitWindow.prior60,
      velocityRatio,

      activeContributors30d: commitWindow.activeContributors30d,
      activeContributors90d: commitWindow.activeContributors90d,
      topContributorShare90d: commitWindow.topContributorShare90d,
      isMaintenanceModeOnly: commitWindow.isMaintenanceModeOnly,

      openIssues: issueCounts.open,
      closedIssuesLast90Days: issueCounts.closedLast90,
      avgFirstResponseDays,

      lastReleaseAt: release.at,
      daysSinceLastRelease: release.at === null ? null : daysSince(release.at),
      lastReleaseTag: release.tag,

      hasSecurityPolicy,
      hasFunding,
      socialSignals,
      weeklyNpmDownloads,
    };
  } catch (err) {
    throw toScanError(err);
  }
}
