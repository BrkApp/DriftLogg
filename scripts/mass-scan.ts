#!/usr/bin/env npx tsx
/**
 * mass-scan.ts — scans repos via the local DriftLogg API (/api/scan).
 * Requires: npm run dev (http://localhost:3000) to be running.
 *
 * Usage: npx tsx scripts/mass-scan.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const BASE_URL = process.env.DRIFTLOGG_URL ?? "http://localhost:3000";
const DELAY_MS = 2_000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RepoEntry {
  owner: string;
  repo: string;
  expectedRisk: string;
  expectedScoreRange: [number, number];
}

interface ApiReport {
  score: number;
  risk: string;
  breakdown: {
    velocity: number;
    responsiveness: number;
    community: number;
    freshness: number;
    trust: number;
    social: number;
  };
  signals: string[];
  prediction: string;
}

interface ScanResult {
  slug: string;
  score: number | null;
  risk: string | null;
  velocity: number | null;
  responsiveness: number | null;
  community: number | null;
  freshness: number | null;
  trust: number | null;
  social: number | null;
  signals: string[];
  expectedRisk: string;
  expectedScoreRange: [number, number];
  match: boolean;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function csvEscape(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

async function preflight(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(4000) });
  } catch {
    console.error(`\n❌  Cannot reach ${BASE_URL}`);
    console.error("    Start the dev server first:  npm run dev\n");
    process.exit(1);
  }
}

async function scanRepo(
  owner: string,
  repo: string
): Promise<ApiReport> {
  const res = await fetch(`${BASE_URL}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner, repo }),
    signal: AbortSignal.timeout(30_000),
  });

  const json = (await res.json()) as { error?: string } & Partial<ApiReport>;

  if (!res.ok) {
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }

  return json as ApiReport;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await preflight();

  const reposFile = process.argv[2] ?? "repos.json";
  const csvFile = reposFile.replace(/^repos/, "results").replace(/\.json$/, ".csv");
  const reposPath = join(process.cwd(), "scripts", reposFile);
  if (!existsSync(reposPath)) {
    console.error(`❌  ${reposFile} not found at ${reposPath}`);
    process.exit(1);
  }

  const repos: RepoEntry[] = JSON.parse(readFileSync(reposPath, "utf-8"));
  const total = repos.length;
  const results: ScanResult[] = [];

  console.log(`\n🔍  Mass scanning ${total} repositories via ${BASE_URL}/api/scan …\n`);

  for (let i = 0; i < repos.length; i++) {
    const { owner, repo, expectedRisk, expectedScoreRange } = repos[i];
    const slug = `${owner}/${repo}`;
    process.stdout.write(`  ${String(i + 1).padStart(2)}/${total}  ${slug.padEnd(35)} `);

    let result: ScanResult;

    try {
      const report = await scanRepo(owner, repo);
      const { score, risk, breakdown, signals } = report;
      const [min, max] = expectedScoreRange;
      const match = score >= min && score <= max;

      result = {
        slug,
        score,
        risk,
        velocity: breakdown.velocity,
        responsiveness: breakdown.responsiveness,
        community: breakdown.community,
        freshness: breakdown.freshness,
        trust: breakdown.trust,
        social: breakdown.social,
        signals,
        expectedRisk,
        expectedScoreRange,
        match,
        error: null,
      };

      const tag = match ? "✓" : "✗ MISMATCH";
      process.stdout.write(`score=${String(score).padStart(3)}  risk=${risk.padEnd(8)}  ${tag}\n`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(`ERROR: ${msg}\n`);
      result = {
        slug,
        score: null,
        risk: null,
        velocity: null,
        responsiveness: null,
        community: null,
        freshness: null,
        trust: null,
        social: null,
        signals: [],
        expectedRisk,
        expectedScoreRange,
        match: false,
        error: msg,
      };
    }

    results.push(result);

    if (i < repos.length - 1) await sleep(DELAY_MS);
  }

  // ── Write CSV
  const csvPath = join(process.cwd(), "scripts", csvFile);
  const header = [
    "owner/repo", "score", "risk",
    "velocity", "responsiveness", "community", "freshness", "trust", "social",
    "signals", "expectedRisk", "expectedScoreRange", "match", "error",
  ].join(",");

  const rows = results.map((r) =>
    [
      csvEscape(r.slug),
      csvEscape(r.score),
      csvEscape(r.risk),
      csvEscape(r.velocity),
      csvEscape(r.responsiveness),
      csvEscape(r.community),
      csvEscape(r.freshness),
      csvEscape(r.trust),
      csvEscape(r.social),
      csvEscape(r.signals.join(" | ")),
      csvEscape(r.expectedRisk),
      csvEscape(`${r.expectedScoreRange[0]}-${r.expectedScoreRange[1]}`),
      csvEscape(r.match),
      csvEscape(r.error),
    ].join(",")
  );

  writeFileSync(csvPath, [header, ...rows].join("\n"), "utf-8");
  console.log(`\n📄  Results written → scripts/${csvFile}`);

  // ── Summary
  const errored = results.filter((r) => r.error !== null).length;
  const successful = results.length - errored;
  const matched = results.filter((r) => r.match).length;
  const matchPct = successful > 0 ? Math.round((matched / successful) * 100) : 0;
  const mismatches = results.filter((r) => r.error === null && !r.match);

  console.log("\n══════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("══════════════════════════════════════════════════");
  console.log(`  Total scanned  : ${results.length}`);
  console.log(`  Successful     : ${successful}`);
  console.log(`  Errors         : ${errored}`);
  console.log(`  Match rate     : ${matched}/${successful} (${matchPct}%)`);

  if (mismatches.length > 0) {
    console.log(`\n  Mismatches (${mismatches.length}):`);
    for (const r of mismatches) {
      const arrow = r.score! > r.expectedScoreRange[1] ? "↑" : "↓";
      console.log(
        `  ${arrow}  ${r.slug.padEnd(35)} score=${r.score}  expected=[${r.expectedScoreRange[0]}-${r.expectedScoreRange[1]}]`
      );
    }
  } else {
    console.log("\n  All scores within expected ranges. ✓");
  }

  console.log("══════════════════════════════════════════════════\n");
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
