import { Octokit } from "octokit";
import type {
  CommitActivity,
  IssueActivity,
  ReleaseActivity,
  RepoMetadata,
} from "./types";

export { parseRepoInput } from "./parse-repo";

let cachedClient: Octokit | null = null;

function getClient(): Octokit {
  if (cachedClient) return cachedClient;
  cachedClient = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: "driftlogg-health-check",
  });
  return cachedClient;
}

const DAY_MS = 1000 * 60 * 60 * 24;

function daysSince(iso: string | null | undefined): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
}

export async function fetchRepoMetadata(
  owner: string,
  repo: string
): Promise<RepoMetadata> {
  const octokit = getClient();
  const { data } = await octokit.rest.repos.get({ owner, repo });

  return {
    owner: data.owner.login,
    repo: data.name,
    fullName: data.full_name,
    description: data.description,
    url: data.html_url,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    watchers: data.subscribers_count ?? data.watchers_count,
    language: data.language,
    license: data.license?.spdx_id ?? data.license?.name ?? null,
    archived: data.archived,
    disabled: data.disabled,
    defaultBranch: data.default_branch,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pushedAt: data.pushed_at ?? data.updated_at,
  };
}

export async function fetchCommitActivity(
  owner: string,
  repo: string
): Promise<CommitActivity> {
  const octokit = getClient();
  const since30 = new Date(Date.now() - 30 * DAY_MS).toISOString();
  const since90 = new Date(Date.now() - 90 * DAY_MS).toISOString();

  const [latest, last30, last90] = await Promise.all([
    octokit.rest.repos.listCommits({ owner, repo, per_page: 1 }),
    octokit.rest.repos.listCommits({ owner, repo, since: since30, per_page: 100 }),
    octokit.rest.repos.listCommits({ owner, repo, since: since90, per_page: 100 }),
  ]);

  const lastCommitDate = latest.data[0]?.commit.author?.date ?? null;
  const authors = new Set<string>();
  for (const c of last90.data) {
    const id = c.author?.login ?? c.commit.author?.email ?? c.commit.author?.name;
    if (id) authors.add(id);
  }

  return {
    totalCommits: latest.data.length > 0 ? -1 : 0,
    daysSinceLastCommit: daysSince(lastCommitDate),
    commitsLast30Days: last30.data.length,
    commitsLast90Days: last90.data.length,
    uniqueAuthorsLast90Days: authors.size,
  };
}

export async function fetchIssueActivity(
  owner: string,
  repo: string
): Promise<IssueActivity> {
  const octokit = getClient();
  const since90 = new Date(Date.now() - 90 * DAY_MS).toISOString();

  const [open, closedRecent] = await Promise.all([
    octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: "open",
      per_page: 100,
      filter: "all",
    }),
    octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: "closed",
      since: since90,
      per_page: 100,
    }),
  ]);

  const realOpenIssues = open.data.filter((i) => !i.pull_request);
  const realClosedIssues = closedRecent.data.filter((i) => !i.pull_request);

  const now = Date.now();
  const ages = realOpenIssues.map((i) => (now - new Date(i.created_at).getTime()) / DAY_MS);
  const avgAge =
    ages.length === 0 ? null : Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);
  const stale = ages.filter((a) => a > 180).length;

  return {
    openIssues: realOpenIssues.length,
    closedIssuesLast90Days: realClosedIssues.length,
    averageIssueAgeDays: avgAge,
    staleIssues: stale,
  };
}

export async function fetchReleaseActivity(
  owner: string,
  repo: string
): Promise<ReleaseActivity> {
  const octokit = getClient();
  try {
    const releases = await octokit.rest.repos.listReleases({
      owner,
      repo,
      per_page: 10,
    });
    const last = releases.data[0];
    return {
      totalReleases: releases.data.length,
      daysSinceLastRelease: last ? daysSince(last.published_at ?? last.created_at) : null,
      lastReleaseTag: last?.tag_name ?? null,
    };
  } catch {
    return { totalReleases: 0, daysSinceLastRelease: null, lastReleaseTag: null };
  }
}
