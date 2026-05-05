import { NextResponse } from "next/server";
import {
  fetchCommitActivity,
  fetchIssueActivity,
  fetchReleaseActivity,
  fetchRepoMetadata,
  parseRepoInput,
} from "@/lib/github";
import { buildSignals, classifyRisk, computeScore } from "@/lib/scoring";
import type { HealthReport } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { input?: string; owner?: string; repo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let owner = body.owner?.trim();
  let repo = body.repo?.trim();

  if (!owner || !repo) {
    if (!body.input) {
      return NextResponse.json(
        { error: "Provide a GitHub repo URL or owner/repo slug." },
        { status: 400 }
      );
    }
    const parsed = parseRepoInput(body.input);
    if (!parsed) {
      return NextResponse.json(
        { error: "Could not parse the repo. Try `owner/repo` or a github.com URL." },
        { status: 400 }
      );
    }
    owner = parsed.owner;
    repo = parsed.repo;
  }

  return runScan(owner, repo);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const owner = url.searchParams.get("owner");
  const repo = url.searchParams.get("repo");
  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing `owner` or `repo` query param." },
      { status: 400 }
    );
  }
  return runScan(owner, repo);
}

async function runScan(owner: string, repo: string) {
  try {
    const metadata = await fetchRepoMetadata(owner, repo);
    const [commits, issues, releases] = await Promise.all([
      fetchCommitActivity(owner, repo),
      fetchIssueActivity(owner, repo),
      fetchReleaseActivity(owner, repo),
    ]);

    const { score, breakdown } = computeScore(metadata, commits, issues, releases);
    const risk = classifyRisk(score, metadata);
    const signals = buildSignals(metadata, commits, issues, releases);

    const report: HealthReport = {
      metadata,
      commits,
      issues,
      releases,
      score,
      breakdown,
      risk,
      signals,
      scannedAt: new Date().toISOString(),
    };

    return NextResponse.json(report, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
      },
    });
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 404) {
      return NextResponse.json(
        { error: `Repository ${owner}/${repo} not found or is private.`, status: 404 },
        { status: 404 }
      );
    }
    if (status === 403) {
      return NextResponse.json(
        {
          error:
            "GitHub API rate limit hit. Set GITHUB_TOKEN in your env to unlock 5000 req/h.",
          status: 403,
        },
        { status: 403 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Unexpected error while scanning repo.";
    return NextResponse.json({ error: message, status: status ?? 500 }, { status: 500 });
  }
}
