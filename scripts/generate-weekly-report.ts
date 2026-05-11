/**
 * Weekly risk report generator.
 * Run with: npx tsx scripts/generate-weekly-report.ts
 * Requires GITHUB_TOKEN in .env.local or the environment.
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import * as githubLib from "../lib/github";
import * as scoringLib from "../lib/scoring";
import type { Risk } from "../lib/scoring";
const { fetchRepoHealth } = githubLib;
const { computeHealthScore } = scoringLib;

// ── Load .env.local before first API call (Octokit reads GITHUB_TOKEN lazily)
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim();
    const raw = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = raw;
  }
}

// ── Package list (50 most depended-on npm packages) ──────────────────────────
const PACKAGES = [
  "react",        "next",          "vue",          "@angular/core", "express",
  "axios",        "lodash",        "moment",       "webpack",       "vite",
  "typescript",   "tailwindcss",   "prisma",       "jest",          "mocha",
  "cypress",      "eslint",        "prettier",     "@babel/core",   "sass",
  "pnpm",         "gulp",          "socket.io",    "redux",         "mobx",
  "zustand",      "pinia",         "sequelize",    "mongoose",      "typeorm",
  "drizzle-orm",  "fastify",       "@nestjs/core", "nuxt",          "svelte",
  "remix",        "astro",         "cheerio",      "puppeteer",     "playwright",
  "chalk",        "commander",     "inquirer",     "dotenv",        "cors",
  "helmet",       "morgan",        "nodemon",      "pm2",           "date-fns",
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScanResult {
  pkg: string;
  owner: string;
  repo: string;
  score: number;
  risk: Risk;
  signals: string[];
}

interface NpmRegistryResponse {
  repository?: { url?: string; type?: string };
}

// ── Utilities ─────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function parseGitHubRepo(url: string | null | undefined): { owner: string; repo: string } | null {
  if (!url) return null;
  // "github:owner/repo" shorthand
  const short = url.match(/^github:([^/]+)\/([^/#.]+)/);
  if (short) return { owner: short[1], repo: short[2] };
  // Full URL: https://github.com/owner/repo.git or git://...
  const full = url.match(/github\.com[:/]([^/]+)\/([^/\s.#]+?)(?:\.git)?(?:[/#].*)?$/);
  if (!full) return null;
  return { owner: full[1], repo: full[2] };
}

async function resolveNpmToGitHub(pkg: string): Promise<{ owner: string; repo: string } | null> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as NpmRegistryResponse;
    return parseGitHubRepo(data.repository?.url ?? null);
  } catch {
    return null;
  }
}

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatReadableDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ── Key signal picker ─────────────────────────────────────────────────────────
// Priority list for negative signals (ordered: most alarming first)
const NEG_PRIORITY: RegExp[] = [
  /archived/i,
  /disabled/i,
  /deprecated/i,
  /no commit activity in the last/i,
  /no commits in the last/i,
  /no human commits/i,
  /maintenance mode.*no new features/i,
  /maintenance mode/i,
  /commit velocity down/i,
  /no release in the last/i,
  /no releases published/i,
  /maintainer.*stepped back/i,
  /single maintainer risk/i,
  /bus factor/i,
  /unanswered/i,
  /stale.*limited/i,
];

// Priority list for positive signals
const POS_PRIORITY: RegExp[] = [
  /active contributors/i,
  /very responsive/i,
  /commit velocity up/i,
  /community platform/i,
  /financially supported/i,
  /discussions enabled/i,
  /weekly npm downloads/i,
];

function pickKeySignal(signals: string[], risk: Risk): string {
  const clean = (s: string) => !s.startsWith("⚠️") && !s.startsWith("✅");

  if (risk === "critical" || risk === "high") {
    for (const re of NEG_PRIORITY) {
      const found = signals.find((s) => re.test(s) && clean(s));
      if (found) return cap(found, 72);
    }
  } else {
    for (const re of POS_PRIORITY) {
      const found = signals.find((s) => re.test(s));
      if (found) return cap(found, 72);
    }
    for (const re of NEG_PRIORITY) {
      const found = signals.find((s) => re.test(s) && clean(s));
      if (found) return cap(found, 72);
    }
  }

  const fallback = signals.find(clean);
  return fallback ? cap(fallback, 72) : "—";
}

function cap(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

// ── Previous report comparison ────────────────────────────────────────────────
function loadPreviousScores(todaySlug: string): Record<string, number> | null {
  const dir = path.join(process.cwd(), "content", "reports");
  if (!fs.existsSync(dir)) return null;

  const prev = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== `${todaySlug}.md`)
    .sort()
    .at(-1); // most recent

  if (!prev) return null;

  const { data } = matter(fs.readFileSync(path.join(dir, prev), "utf8"));
  if (data.packageScores && typeof data.packageScores === "object") {
    return data.packageScores as Record<string, number>;
  }
  return null;
}

// ── Markdown table builder ────────────────────────────────────────────────────
function buildTable(results: ScanResult[]): string {
  if (results.length === 0) return "_None this week. ✅_\n";
  const rows = results.map((r) => {
    const signal = pickKeySignal(r.signals, r.risk);
    return `| \`${r.pkg}\` | ${r.score} | ${signal} |`;
  });
  return ["| Package | Score | Key Signal |", "|---------|-------|------------|", ...rows].join("\n") + "\n";
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const today = getTodayISO();
  const todaySlug = `${today}-weekly-risk-report`;

  console.log(`\nDriftLogg — Weekly Risk Report Generator`);
  console.log(`Date : ${today}`);
  console.log(`Output : content/reports/${todaySlug}.md\n`);

  if (!process.env.GITHUB_TOKEN) {
    console.warn("⚠️  GITHUB_TOKEN non défini — rate limit : 60 req/h. Définir dans .env.local pour scanner 50 repos.\n");
  }

  const results: ScanResult[] = [];
  const errors: Array<{ pkg: string; reason: string }> = [];

  for (let i = 0; i < PACKAGES.length; i++) {
    const pkg = PACKAGES[i];
    process.stdout.write(`Scanning ${i + 1}/${PACKAGES.length}: ${pkg}... `);

    try {
      const coords = await resolveNpmToGitHub(pkg);
      if (!coords) {
        console.log("⚠️  No GitHub repo found, skipping.");
        errors.push({ pkg, reason: "No GitHub repository URL in npm registry" });
        continue;
      }

      const { owner, repo } = coords;
      process.stdout.write(`→ github.com/${owner}/${repo} `);

      const health = await fetchRepoHealth(owner, repo);
      const { score, risk, signals } = computeHealthScore(health);

      results.push({ pkg, owner, repo, score, risk, signals });
      console.log(`✓ ${score} (${risk})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`✗ ${msg}`);
      errors.push({ pkg, reason: msg });
    }

    if (i < PACKAGES.length - 1) await sleep(2000);
  }

  console.log(`\nScanned : ${results.length} packages, ${errors.length} errors.\n`);

  // Sort: worst (lowest score) first within each bucket
  results.sort((a, b) => a.score - b.score);

  const critical = results.filter((r) => r.risk === "critical");
  const high     = results.filter((r) => r.risk === "high");
  const medium   = results.filter((r) => r.risk === "medium");
  const healthy  = results.filter((r) => r.risk === "low");

  const description = `This week's riskiest npm packages: ${critical.length} critical, ${high.length} high risk, ${medium.length} medium, ${healthy.length} healthy out of ${results.length} scanned.`;

  // ── Biggest Movers ──────────────────────────────────────────────────────────
  const prevScores = loadPreviousScores(todaySlug);
  let moversSection: string;

  if (!prevScores) {
    moversSection = "_First report — no comparison data yet._\n";
  } else {
    const movers = results
      .flatMap((r) => {
        const prev = prevScores[r.pkg];
        if (prev === undefined) return [];
        const delta = r.score - prev;
        if (Math.abs(delta) < 5) return [];
        return [{ pkg: r.pkg, current: r.score, prev, delta, signals: r.signals, risk: r.risk }];
      })
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    if (movers.length === 0) {
      moversSection = "_No significant score changes this week (threshold: ±5 points)._\n";
    } else {
      moversSection =
        movers
          .map((m) => {
            const arrow = m.delta > 0 ? "⬆️" : "⬇️";
            const sign  = m.delta > 0 ? "+" : "";
            const reason = pickKeySignal(m.signals, m.delta < 0 ? "high" : "low");
            return `- ${arrow} \`${m.pkg}\`: ${m.prev} → ${m.current} (${sign}${m.delta}) — ${reason}`;
          })
          .join("\n") + "\n";
    }
  }

  // ── Build packageScores for next-report comparison ──────────────────────────
  const packageScores: Record<string, number> = Object.fromEntries(
    results.map((r) => [r.pkg, r.score])
  );

  const readableDate = formatReadableDate(today);

  // ── Markdown body ────────────────────────────────────────────────────────────
  const body = `
# Weekly Risk Report — ${readableDate}

DriftLogg scanned the 50 most depended-on npm packages this week. Here's what we found.

**Summary:** ${critical.length} critical · ${high.length} high risk · ${medium.length} medium · ${healthy.length} healthy

## 🔴 Critical Risk (score < 35)

${buildTable(critical)}
## 🟠 High Risk (score 35–59)

${buildTable(high)}
## 🟡 Medium Risk (score 60–79)

${buildTable(medium)}
## 🟢 Healthy (score ≥ 80)

${buildTable(healthy)}
## Biggest Movers

${moversSection}
## What Should You Do?

If you depend on a critical or high-risk package, start evaluating alternatives now. Run a free scan on your own repo to see your full dependency risk profile.

**[Scan your repo for free →](/scan)**
`;

  const frontmatter = {
    title: `Weekly Risk Report — ${readableDate}`,
    date: today,
    description,
    tags: ["weekly", "npm", "risk"],
    packageScores,
  };

  const output = matter.stringify(body, frontmatter);

  const outDir = path.join(process.cwd(), "content", "reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${todaySlug}.md`);
  fs.writeFileSync(outPath, output, "utf8");

  console.log(`Report generated : content/reports/${todaySlug}.md`);
  console.log(`Critical: ${critical.length}, High: ${high.length}, Medium: ${medium.length}, Healthy: ${healthy.length}`);

  if (errors.length > 0) {
    console.log(`\nFailed packages (${errors.length}):`);
    for (const e of errors) console.log(`  - ${e.pkg}: ${e.reason}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
