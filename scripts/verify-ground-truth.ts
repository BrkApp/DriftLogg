#!/usr/bin/env npx tsx
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RepoEntry {
  owner: string;
  repo: string;
  expectedRisk: string;
  expectedScoreRange: [number, number];
}

interface ResultRow {
  slug: string;
  score: number | null;
  velocity: number | null;
  responsiveness: number | null;
  community: number | null;
  freshness: number | null;
  trust: number | null;
  social: number | null;
  signals: string[];
  expectedRange: [number, number];
  match: boolean;
  error: string | null;
}

interface RepoReview {
  batch: string;
  slug: string;
  expectedRange: [number, number];
  score: number | null;
  gap: number;
  direction: "match" | "too_high" | "too_low" | "error";
  velocity: number | null;
  breakdown: string;
  flags: string[];
  suggestions: string[];
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === "," && !inQ) {
      fields.push(cur); cur = "";
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

function parseCSV(content: string): ResultRow[] {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const rows: ResultRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const f = parseCSVLine(lines[i]);
    const [rangeMin, rangeMax] = (f[11] ?? "0-100").split("-").map(Number);
    const score = f[1] ? Number(f[1]) : null;
    rows.push({
      slug: f[0] ?? "",
      score: Number.isNaN(score) ? null : score,
      velocity: f[3] ? Number(f[3]) : null,
      responsiveness: f[4] ? Number(f[4]) : null,
      community: f[5] ? Number(f[5]) : null,
      freshness: f[6] ? Number(f[6]) : null,
      trust: f[7] ? Number(f[7]) : null,
      social: f[8] ? Number(f[8]) : null,
      signals: (f[9] ?? "").split(" | ").filter(Boolean),
      expectedRange: [rangeMin ?? 0, rangeMax ?? 100],
      match: f[12] === "true",
      error: f[13] || null,
    });
  }
  return rows;
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  "0-15":   "DEAD",
  "15-40":  "DECLINING",
  "40-65":  "AT_RISK",
  "65-85":  "STABLE",
  "85-100": "HEALTHY",
};

function categoryFromRange([min, max]: [number, number]): string {
  return CATEGORY_LABELS[`${min}-${max}`] ?? `[${min}-${max}]`;
}

function suggestCategory(score: number): string {
  if (score <= 15)  return "DEAD [0-15]";
  if (score <= 40)  return "DECLINING [15-40]";
  if (score <= 65)  return "AT_RISK [40-65]";
  if (score <= 85)  return "STABLE [65-85]";
  return "HEALTHY [85-100]";
}

function analyzeRepo(
  batch: string,
  entry: RepoEntry,
  row: ResultRow | undefined
): RepoReview {
  const slug = `${entry.owner}/${entry.repo}`;
  const [min, max] = entry.expectedScoreRange;
  const midpoint = (min + max) / 2;
  const flags: string[] = [];
  const suggestions: string[] = [];

  if (!row || row.error) {
    return {
      batch, slug,
      expectedRange: entry.expectedScoreRange,
      score: null,
      gap: 0,
      direction: "error",
      velocity: null,
      breakdown: "N/A",
      flags: [row?.error ? `Scan error: ${row.error}` : "No scan result found"],
      suggestions: [],
    };
  }

  const { score, velocity } = row;
  if (score === null) {
    return {
      batch, slug,
      expectedRange: entry.expectedScoreRange,
      score: null,
      gap: 0,
      direction: "error",
      velocity: null,
      breakdown: "N/A",
      flags: ["Missing score"],
      suggestions: [],
    };
  }

  const gap = Math.abs(score - midpoint);
  const direction: RepoReview["direction"] =
    score < min ? "too_low" : score > max ? "too_high" : "match";

  const breakdown = [
    `V:${row.velocity ?? "?"}`,
    `R:${row.responsiveness ?? "?"}`,
    `C:${row.community ?? "?"}`,
    `F:${row.freshness ?? "?"}`,
    `T:${row.trust ?? "?"}`,
    `S:${row.social ?? "?"}`,
  ].join("  ");

  // Flag: DEAD but shows recent commit activity
  if (max <= 15 && (velocity ?? 0) > 0) {
    flags.push("⚠️  Classification may be wrong — repo shows recent activity (velocity > 0)");
    suggestions.push(`Consider reclassifying to ${suggestCategory(score)}`);
  }

  // Flag: DEAD/DECLINING but score far above expected max
  if (max <= 40 && score > max + 15) {
    flags.push(`⚠️  Score ${score} is ${score - max} pts above expected max ${max}`);
    if (!suggestions.length) suggestions.push(`Consider reclassifying to ${suggestCategory(score)}`);
  }

  // Flag: HEALTHY but low velocity
  if (min >= 85 && (velocity ?? 10) < 5) {
    flags.push("⚠️  Classification may be wrong — repo appears dormant (velocity < 5)");
    suggestions.push(`Consider reclassifying to ${suggestCategory(score)}`);
  }

  // Flag: HEALTHY/STABLE but score far below expected min
  if (min >= 65 && score < min - 15) {
    flags.push(`⚠️  Score ${score} is ${min - score} pts below expected min ${min}`);
    if (!suggestions.length) suggestions.push(`Consider reclassifying to ${suggestCategory(score)}`);
  }

  return {
    batch, slug,
    expectedRange: entry.expectedScoreRange,
    score, gap, direction, velocity,
    breakdown, flags, suggestions,
  };
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function renderMarkdown(reviews: RepoReview[]): string {
  const ts = new Date().toUTCString();
  const lines: string[] = [
    `# Ground Truth Review`,
    ``,
    `_Generated on ${ts}_`,
    ``,
  ];

  const errors    = reviews.filter((r) => r.direction === "error");
  const tooHigh   = reviews.filter((r) => r.direction === "too_high");
  const tooLow    = reviews.filter((r) => r.direction === "too_low");
  const matched   = reviews.filter((r) => r.direction === "match");
  const flagged   = reviews.filter((r) => r.flags.length > 0 && r.direction !== "error");

  const total = reviews.length;
  const successful = total - errors.length;
  const matchPct = successful > 0 ? Math.round((matched.length / successful) * 100) : 0;

  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total repos | ${total} |`);
  lines.push(`| Successful  | ${successful} |`);
  lines.push(`| Errors      | ${errors.length} |`);
  lines.push(`| Matched ✓   | ${matched.length} (${matchPct}%) |`);
  lines.push(`| Too high ↑  | ${tooHigh.length} |`);
  lines.push(`| Too low ↓   | ${tooLow.length} |`);
  lines.push(`| Flagged ⚠️  | ${flagged.length} |`);
  lines.push(``);

  if (errors.length) {
    lines.push(`## Errors`);
    lines.push(``);
    for (const r of errors) {
      lines.push(`- **${r.slug}**: ${r.flags[0] ?? "unknown error"}`);
    }
    lines.push(``);
  }

  if (flagged.length) {
    lines.push(`## ⚠️ Suspected mis-classifications (${flagged.length})`);
    lines.push(``);
    lines.push(`These repos have a mismatch AND a classification flag. Review and update \`repos.json\` or \`repos-v2.json\` accordingly.`);
    lines.push(``);
    for (const r of flagged) {
      const cat = categoryFromRange(r.expectedRange);
      lines.push(`### ${r.slug} \`[${r.batch}]\``);
      lines.push(``);
      lines.push(`- **Category**: ${cat} (expected ${r.expectedRange[0]}–${r.expectedRange[1]})`);
      lines.push(`- **Actual score**: ${r.score} → ${r.direction === "too_high" ? "↑ too high" : "↓ too low"}`);
      lines.push(`- **Breakdown**: ${r.breakdown}`);
      for (const f of r.flags) lines.push(`- ${f}`);
      for (const s of r.suggestions) lines.push(`- 💡 ${s}`);
      lines.push(``);
    }
  }

  // Full score table sorted by gap desc (mismatches first)
  lines.push(`## Full Score Table`);
  lines.push(``);
  lines.push(`Sorted by gap (largest mismatch first). \`V\`=velocity \`R\`=responsiveness \`C\`=community \`F\`=freshness \`T\`=trust \`S\`=social`);
  lines.push(``);
  lines.push(`| Batch | Repo | Expected | Score | Δ | Dir | Breakdown |`);
  lines.push(`|-------|------|----------|-------|---|-----|-----------|`);

  const sorted = [...reviews].sort((a, b) => {
    if (a.direction !== "match" && b.direction === "match") return -1;
    if (a.direction === "match" && b.direction !== "match") return 1;
    return b.gap - a.gap;
  });

  for (const r of sorted) {
    const dir = r.direction === "match" ? "✓" : r.direction === "too_high" ? "↑" : r.direction === "error" ? "✗" : "↓";
    const delta = r.score !== null ? Math.round(r.score - (r.expectedRange[0] + r.expectedRange[1]) / 2) : "—";
    lines.push(
      `| ${r.batch} | ${r.slug} | ${r.expectedRange[0]}–${r.expectedRange[1]} | ${r.score ?? "ERR"} | ${delta} | ${dir} | ${r.breakdown} |`
    );
  }

  lines.push(``);
  lines.push(`---`);
  lines.push(`_Review and correct \`scripts/repos.json\` and \`scripts/repos-v2.json\` before re-running mass-scan._`);

  return lines.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const dir = join(process.cwd(), "scripts");

  const batches: Array<{ reposFile: string; csvFile: string; label: string }> = [
    { reposFile: "repos.json",    csvFile: "results.csv",    label: "v1" },
    { reposFile: "repos-v2.json", csvFile: "results-v2.csv", label: "v2" },
  ];

  const allReviews: RepoReview[] = [];

  for (const { reposFile, csvFile, label } of batches) {
    const reposPath = join(dir, reposFile);
    const csvPath   = join(dir, csvFile);

    if (!existsSync(reposPath)) {
      console.log(`⏭  ${reposFile} not found — skipping batch ${label}`);
      continue;
    }

    const repos: RepoEntry[] = JSON.parse(readFileSync(reposPath, "utf-8"));
    const rows: ResultRow[] = existsSync(csvPath)
      ? parseCSV(readFileSync(csvPath, "utf-8"))
      : [];

    const rowMap = new Map<string, ResultRow>(rows.map((r) => [r.slug, r]));

    for (const entry of repos) {
      const slug = `${entry.owner}/${entry.repo}`;
      const row = rowMap.get(slug);
      allReviews.push(analyzeRepo(label, entry, row));
    }

    console.log(`✓  Batch ${label}: ${repos.length} repos loaded from ${reposFile}`);
  }

  if (allReviews.length === 0) {
    console.error("❌ No repos found. Make sure repos.json or repos-v2.json exists.");
    process.exit(1);
  }

  const flagged   = allReviews.filter((r) => r.flags.length > 0 && r.direction !== "error");
  const matched   = allReviews.filter((r) => r.direction === "match");
  const errors    = allReviews.filter((r) => r.direction === "error");
  const total     = allReviews.length;
  const successful = total - errors.length;

  console.log(`\n══════════════════════════════════════════`);
  console.log(`  GROUND TRUTH REVIEW`);
  console.log(`══════════════════════════════════════════`);
  console.log(`  Total repos  : ${total}`);
  console.log(`  Successful   : ${successful}`);
  console.log(`  Matched ✓    : ${matched.length} (${successful > 0 ? Math.round((matched.length / successful) * 100) : 0}%)`);
  console.log(`  Flagged ⚠️   : ${flagged.length}`);
  if (flagged.length > 0) {
    console.log(``);
    console.log(`  Flagged repos:`);
    for (const r of flagged) {
      console.log(`    ⚠️  ${r.slug} [${r.batch}] — ${r.flags[0]}`);
    }
  }
  console.log(`══════════════════════════════════════════\n`);

  const md = renderMarkdown(allReviews);
  const outPath = join(dir, "ground-truth-review.md");
  writeFileSync(outPath, md, "utf-8");
  console.log(`📄  Report written → scripts/ground-truth-review.md\n`);
}

main();
