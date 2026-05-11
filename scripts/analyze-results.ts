#!/usr/bin/env npx tsx
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

const MAX_DIMS = {
  velocity: 25,
  responsiveness: 20,
  community: 15,
  freshness: 15,
  trust: 10,
  social: 15,
} as const;

type Dim = keyof typeof MAX_DIMS;

interface Row {
  slug: string;
  score: number;
  risk: string;
  velocity: number;
  responsiveness: number;
  community: number;
  freshness: number;
  trust: number;
  social: number;
  signals: string[];
  expectedRisk: string;
  expectedRange: [number, number];
  match: boolean;
  error: string | null;
}

interface DimStat {
  dim: Dim;
  val: number;
  max: number;
  ratio: number; // can be negative for social
}

interface Diagnostic {
  row: Row;
  direction: "too_high" | "too_low";
  culprit: Dim;
  culpritVal: number;
  culpritMax: number;
  problem: string;
  fix: string;
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

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

function parseCSV(content: string): Row[] {
  const lines = content.split("\n").filter(Boolean);
  if (lines.length <= 1) return [];
  const rows: Row[] = [];

  for (let i = 1; i < lines.length; i++) {
    const f = parseCSVLine(lines[i]);
    if (f.length < 12) continue;

    // Columns: owner/repo, score, risk, velocity, responsiveness, community,
    //          freshness, trust, social, signals, expectedRisk, expectedScoreRange, match, error
    const num = (s: string) => (s === "" ? 0 : Number(s));
    const rangeParts = (f[11] ?? "").split("-");

    rows.push({
      slug: f[0],
      score: num(f[1]),
      risk: f[2] || "unknown",
      velocity: num(f[3]),
      responsiveness: num(f[4]),
      community: num(f[5]),
      freshness: num(f[6]),
      trust: num(f[7]),
      social: f[8] === "" ? 0 : Number(f[8]),
      signals: f[9] ? f[9].split(" | ").filter(Boolean) : [],
      expectedRisk: f[10] || "unknown",
      expectedRange: [Number(rangeParts[0] ?? 0), Number(rangeParts[1] ?? 100)],
      match: f[12] === "true",
      error: f[13] || null,
    });
  }

  return rows;
}

// ─── Diagnostic Engine ────────────────────────────────────────────────────────

const TOO_HIGH_PROBLEMS: Record<Dim, (val: number, max: number, signals: string[]) => string> = {
  velocity: (v, m, sigs) => {
    const botHint = sigs.some((s) => /velocity up/i.test(s))
      ? " — recent velocity spike may be automated commits (dependabot, renovate)"
      : " — recent commit count is disproportionately high vs prior period";
    return `velocity score (${v}/${m}) is inflating the total${botHint}`;
  },
  responsiveness: (v, m) =>
    `responsiveness score (${v}/${m}) is high, but fast response time may come from bot auto-labeling or auto-close actions, not actual maintainer engagement`,
  community: (v, m, sigs) => {
    const forkHint = sigs.some((s) => /fork/i.test(s))
      ? " — high fork-to-star ratio awarded points despite possible fragmentation"
      : "";
    return `community score (${v}/${m}) is elevated${forkHint}, but human contributor count may be very low`;
  },
  freshness: (v, m) =>
    `freshness score (${v}/${m}) is high — the most recent commit or release may be an automated dependency bump, not real maintenance`,
  trust: (v, m) =>
    `trust score (${v}/${m}) — license/SECURITY files are present, but their existence alone does not indicate an active project`,
  social: (v, m) =>
    `social score (${v}/${m}) — community badge (Discord/Slack) or CI badge detected in README, but these links may be stale from years ago`,
};

const TOO_LOW_PROBLEMS: Record<Dim, (val: number, max: number, signals: string[]) => string> = {
  velocity: (v, m) =>
    `velocity score (${v}/${m}) is penalizing a intentionally slow-moving but stable project — low commit cadence ≠ abandonment for mature libraries`,
  responsiveness: (v, m) =>
    `responsiveness score (${v}/${m}) is low — a mature project with few open issues gets a 0 because there are no recent issues to sample from`,
  community: (v, m) =>
    `community score (${v}/${m}) — large popular project with millions of users scores low because few PRs landed in the 30-day window`,
  freshness: (v, m) =>
    `freshness score (${v}/${m}) — intentionally stable library (semver locked) penalized for not releasing frequently`,
  trust: (v, m) =>
    `trust score (${v}/${m}) — missing FUNDING.yml or SECURITY.md despite being well-funded and security-conscious`,
  social: (v, m) =>
    `social score (${v}/${m}) — possible false positive on deprecated badge detection OR no Discord/Sponsors link in README despite active community on other platforms`,
};

const TOO_HIGH_FIXES: Record<Dim, string> = {
  velocity:
    "Filter out commits by known bot accounts (dependabot[bot], renovate[bot], github-actions[bot]) before computing velocity and activeContributors30d",
  responsiveness:
    "Verify first responder is a human maintainer — skip comments from users whose login ends with '[bot]' when computing avgFirstResponseDays",
  community:
    "Require activeContributors30d ≥ 2 before awarding more than 5/15 community points; cap fork-to-star ratio contribution to 4 pts instead of 6",
  freshness:
    "Check commit/release author before awarding freshness points — commits from bots should count as 0 days of 'real' activity",
  trust:
    "For archived/disabled repos, override trust score to 0 regardless of file presence — trust signals are meaningless on a dead project",
  social:
    "Parse README badge dates or last-updated timestamp; a community badge link that returns 404 or an invite that's expired should not award points",
};

const TOO_LOW_FIXES: Record<Dim, string> = {
  velocity:
    "Add a 'stable project' bonus: if the repo is > 3 years old, has > 1k stars, and commit rate is < 2/month but > 0, award partial velocity credit (12/25 floor)",
  responsiveness:
    "Return neutral score (10/20) instead of 0 when openIssues < 5 — a mature project with few bugs should not be penalized for having nothing to respond to",
  community:
    "Add a star-count tier to community: > 10k stars = +4 pts regardless of recent contributors — popularity is a community signal",
  freshness:
    "Scale freshness decay by repo age: a 5+ year project with a 6-month-old release should lose fewer points than a brand-new repo with the same gap",
  trust:
    "Scan package.json / pyproject.toml for SPDX license field as fallback when LICENSE file is absent; check README for security disclosure instructions",
  social:
    "Broaden social signal detection: check for Twitter/X links, Reddit community, npm weekly downloads badge, StackOverflow tag — not just Discord/Slack/Sponsors",
};

function dimStats(row: Row): DimStat[] {
  const dims: Dim[] = ["velocity", "responsiveness", "community", "freshness", "trust", "social"];
  return dims.map((dim) => ({
    dim,
    val: row[dim],
    max: MAX_DIMS[dim],
    ratio: row[dim] / MAX_DIMS[dim],
  }));
}

function findCulprit(stats: DimStat[], direction: "too_high" | "too_low"): DimStat {
  if (direction === "too_high") {
    // Highest positive ratio
    return [...stats].filter((s) => s.ratio >= 0).sort((a, b) => b.ratio - a.ratio)[0] ?? stats[0];
  } else {
    // Negative social score is the clearest drag
    const negative = stats.filter((s) => s.ratio < 0).sort((a, b) => a.ratio - b.ratio);
    if (negative.length > 0) return negative[0];
    // Otherwise: dimension furthest below a "healthy" 75% threshold
    return [...stats].sort((a, b) => a.ratio - b.ratio)[0];
  }
}

function diagnose(row: Row): Diagnostic {
  const [min, max] = row.expectedRange;
  const direction: "too_high" | "too_low" = row.score > max ? "too_high" : "too_low";
  const stats = dimStats(row);
  const culpritStat = findCulprit(stats, direction);
  const { dim, val, max: dimMax } = culpritStat;

  const problemFn = direction === "too_high" ? TOO_HIGH_PROBLEMS[dim] : TOO_LOW_PROBLEMS[dim];
  const fix = direction === "too_high" ? TOO_HIGH_FIXES[dim] : TOO_LOW_FIXES[dim];

  return {
    row,
    direction,
    culprit: dim,
    culpritVal: val,
    culpritMax: dimMax,
    problem: problemFn(val, dimMax, row.signals),
    fix,
  };
}

// ─── Weight Recommendations ───────────────────────────────────────────────────

function weightRecommendations(diagnostics: Diagnostic[]): string[] {
  const inflate: Partial<Record<Dim, number>> = {};
  const deflate: Partial<Record<Dim, number>> = {};

  for (const d of diagnostics) {
    if (d.direction === "too_high") {
      inflate[d.culprit] = (inflate[d.culprit] ?? 0) + 1;
    } else {
      deflate[d.culprit] = (deflate[d.culprit] ?? 0) + 1;
    }
  }

  const recs: string[] = [];

  for (const [dim, count] of Object.entries(inflate) as [Dim, number][]) {
    if (count >= 2) {
      const cur = MAX_DIMS[dim];
      const suggest = Math.max(5, cur - 5);
      recs.push(
        `Reduce \`${dim}\` weight **${cur} → ${suggest}** — it caused inflated scores in ${count} repo(s)`
      );
    }
  }

  for (const [dim, count] of Object.entries(deflate) as [Dim, number][]) {
    if (count >= 2) {
      const cur = MAX_DIMS[dim];
      const suggest = Math.min(35, cur + 5);
      recs.push(
        `Increase \`${dim}\` weight **${cur} → ${suggest}** — it was the bottleneck in ${count} repo(s)`
      );
    }
  }

  // Detect conflicting recommendations (same dim in both inflate + deflate)
  const conflicts = (Object.keys(inflate) as Dim[]).filter((d) => deflate[d]);
  for (const dim of conflicts) {
    recs.push(
      `⚠️  \`${dim}\` appears in both over- and under-scoring mismatches — the issue is calibration, not weight; refine the scoring function directly`
    );
  }

  if (recs.length === 0) {
    recs.push(
      "No systematic weight imbalance detected across the mismatch set. Each mismatch appears to be an edge case — address them via scoring function refinements rather than weight changes."
    );
  }

  return recs;
}

// ─── Markdown Report ──────────────────────────────────────────────────────────

function renderReport(rows: Row[], diagnostics: Diagnostic[]): string {
  const total = rows.length;
  const errored = rows.filter((r) => r.error).length;
  const successful = total - errored;
  const matched = rows.filter((r) => r.match).length;
  const mismatches = diagnostics;
  const tooHigh = mismatches.filter((d) => d.direction === "too_high");
  const tooLow = mismatches.filter((d) => d.direction === "too_low");
  const matchPct = successful > 0 ? Math.round((matched / successful) * 100) : 0;

  const lines: string[] = [];

  // ── Header
  lines.push("# DriftLogg — Scoring Analysis Report");
  lines.push("");
  lines.push(`_Generated on ${new Date().toUTCString()}_`);
  lines.push("");

  // ── Summary
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Repos scanned | ${total} |`);
  lines.push(`| Successful | ${successful} |`);
  lines.push(`| Errors (skipped) | ${errored} |`);
  lines.push(`| **Match rate** | **${matched}/${successful} (${matchPct}%)** |`);
  lines.push(`| Scored too high | ${tooHigh.length} |`);
  lines.push(`| Scored too low | ${tooLow.length} |`);
  lines.push("");

  if (errored > 0) {
    lines.push("### Scan Errors");
    lines.push("");
    for (const r of rows.filter((r) => r.error)) {
      lines.push(`- **${r.slug}**: ${r.error}`);
    }
    lines.push("");
  }

  // ── Score Distribution
  lines.push("## Score Distribution");
  lines.push("");
  lines.push("| Repo | Score | Risk | Velocity | Resp. | Community | Freshness | Trust | Social | Match |");
  lines.push("|------|-------|------|----------|-------|-----------|-----------|-------|--------|-------|");
  for (const r of rows.filter((r) => !r.error)) {
    const matchTag = r.match ? "✓" : `✗ (exp ${r.expectedRange[0]}–${r.expectedRange[1]})`;
    lines.push(
      `| ${r.slug} | ${r.score} | ${r.risk} | ${r.velocity} | ${r.responsiveness} | ${r.community} | ${r.freshness} | ${r.trust} | ${r.social} | ${matchTag} |`
    );
  }
  lines.push("");

  // ── Mismatches
  if (mismatches.length === 0) {
    lines.push("## Mismatches");
    lines.push("");
    lines.push("No mismatches detected. All scores fall within expected ranges. ✓");
    lines.push("");
  } else {
    lines.push("## Mismatches Detail");
    lines.push("");

    for (const d of mismatches) {
      const { row, direction, culprit, culpritVal, culpritMax, problem, fix } = d;
      const [rmin, rmax] = row.expectedRange;
      const arrow = direction === "too_high" ? "↑ too high" : "↓ too low";

      lines.push(`### ${row.slug}`);
      lines.push("");
      lines.push(
        `- **Expected**: ${row.expectedRisk.toUpperCase()} (${rmin}–${rmax}) | **Got**: ${row.score} (${row.risk.toUpperCase()}) — ${arrow}`
      );
      lines.push(`- **Problem**: ${problem}`);
      lines.push(`- **Fix suggestion**: ${fix}`);

      if (row.signals.length > 0) {
        lines.push(`- **Signals detected**:`);
        for (const s of row.signals) {
          lines.push(`  - ${s}`);
        }
      }

      // Sub-score breakdown bar chart (text)
      lines.push("");
      lines.push("  **Breakdown:**");
      const dims: Dim[] = ["velocity", "responsiveness", "community", "freshness", "trust", "social"];
      for (const dim of dims) {
        const val = row[dim];
        const max = MAX_DIMS[dim];
        const pct = Math.max(0, Math.round((val / max) * 100));
        const bar = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
        const flag = dim === culprit ? " ← culprit" : "";
        lines.push(`  \`${dim.padEnd(16)}\` ${bar} ${val}/${max}${flag}`);
      }
      lines.push("");
    }
  }

  // ── Weight Recommendations
  const recs = weightRecommendations(diagnostics);
  lines.push("## Weight Adjustment Recommendations");
  lines.push("");

  if (mismatches.length === 0) {
    lines.push("_No mismatches to base recommendations on._");
  } else {
    lines.push(
      "Based on the mismatch patterns above, the following weight adjustments are suggested:"
    );
    lines.push("");
    for (const rec of recs) {
      lines.push(`- ${rec}`);
    }
    lines.push("");

    // Current vs proposed weights table
    const dims: Dim[] = ["velocity", "responsiveness", "community", "freshness", "trust", "social"];
    const inflateMap: Partial<Record<Dim, number>> = {};
    const deflateMap: Partial<Record<Dim, number>> = {};
    for (const d of diagnostics) {
      if (d.direction === "too_high") inflateMap[d.culprit] = (inflateMap[d.culprit] ?? 0) + 1;
      else deflateMap[d.culprit] = (deflateMap[d.culprit] ?? 0) + 1;
    }

    lines.push("| Dimension | Current | Suggested | Reason |");
    lines.push("|-----------|---------|-----------|--------|");
    for (const dim of dims) {
      const cur = MAX_DIMS[dim];
      const hi = inflateMap[dim] ?? 0;
      const lo = deflateMap[dim] ?? 0;
      let suggested: number = cur;
      let reason = "no change";
      if (hi >= 2 && lo === 0) {
        suggested = Math.max(5, cur - 5);
        reason = `inflated ${hi}× too-high mismatches`;
      } else if (lo >= 2 && hi === 0) {
        suggested = Math.min(35, cur + 5);
        reason = `bottleneck in ${lo}× too-low mismatches`;
      } else if (hi >= 2 && lo >= 2) {
        reason = `conflicting signals — refine scoring logic`;
      }
      const delta = suggested !== cur ? (suggested > cur ? `+${suggested - cur}` : `${suggested - cur}`) : "—";
      lines.push(`| ${dim} | ${cur} | ${suggested} (${delta}) | ${reason} |`);
    }
    lines.push("");
    const suggestedTotal = dims.reduce((acc, dim) => {
      const cur = MAX_DIMS[dim];
      const hi = inflateMap[dim] ?? 0;
      const lo = deflateMap[dim] ?? 0;
      if (hi >= 2 && lo === 0) return acc + Math.max(5, cur - 5);
      if (lo >= 2 && hi === 0) return acc + Math.min(35, cur + 5);
      return acc + cur;
    }, 0);
    lines.push(`> **Suggested total: ${suggestedTotal}/100** (current: 100/100)`);
    if (suggestedTotal !== 100) {
      lines.push(`> ⚠️ Suggested weights sum to ${suggestedTotal} — distribute the ${100 - suggestedTotal} point difference manually before applying.`);
    }
  }
  lines.push("");

  // ── Culprit frequency
  if (mismatches.length > 0) {
    lines.push("## Culprit Frequency");
    lines.push("");
    lines.push("Dimensions most responsible for mismatches:");
    lines.push("");

    const freq: Partial<Record<Dim, { high: number; low: number }>> = {};
    for (const d of diagnostics) {
      if (!freq[d.culprit]) freq[d.culprit] = { high: 0, low: 0 };
      if (d.direction === "too_high") freq[d.culprit]!.high++;
      else freq[d.culprit]!.low++;
    }

    const sorted = (Object.entries(freq) as [Dim, { high: number; low: number }][]).sort(
      (a, b) => b[1].high + b[1].low - (a[1].high + a[1].low)
    );

    lines.push("| Dimension | Too High | Too Low | Total |");
    lines.push("|-----------|----------|---------|-------|");
    for (const [dim, counts] of sorted) {
      lines.push(`| ${dim} | ${counts.high} | ${counts.low} | ${counts.high + counts.low} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const csvFile = process.argv[2] ?? "results.csv";
  const reportFile = csvFile.replace(/^results/, "analysis-report").replace(/\.csv$/, ".md");
  const csvPath = join(process.cwd(), "scripts", csvFile);
  const outPath = join(process.cwd(), "scripts", reportFile);
  if (!existsSync(csvPath)) {
    console.error(`❌ scripts/${csvFile} not found. Run mass-scan.ts first.`);
    process.exit(1);
  }

  const content = readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);

  if (rows.length === 0) {
    console.error("❌ CSV is empty or has no data rows.");
    process.exit(1);
  }

  console.log(`\n📊 Analyzing ${rows.length} rows from ${csvFile}...\n`);

  const successful = rows.filter((r) => !r.error);
  const mismatched = successful.filter((r) => !r.match);

  console.log(`  Total rows     : ${rows.length}`);
  console.log(`  Successful     : ${successful.length}`);
  console.log(`  Errors         : ${rows.length - successful.length}`);
  console.log(
    `  Mismatches     : ${mismatched.length} (${Math.round((mismatched.length / successful.length) * 100)}%)`
  );

  const diagnostics = mismatched.map(diagnose);

  const tooHigh = diagnostics.filter((d) => d.direction === "too_high");
  const tooLow = diagnostics.filter((d) => d.direction === "too_low");
  console.log(`  → Too high     : ${tooHigh.length}`);
  console.log(`  → Too low      : ${tooLow.length}`);

  if (diagnostics.length > 0) {
    console.log("\n  Mismatches:");
    for (const d of diagnostics) {
      const [rmin, rmax] = d.row.expectedRange;
      const arrow = d.direction === "too_high" ? "↑" : "↓";
      console.log(
        `    ${arrow} ${d.row.slug.padEnd(30)} got=${d.row.score}  expected=[${rmin}-${rmax}]  culprit=${d.culprit}`
      );
    }
  }

  const report = renderReport(rows, diagnostics);
  writeFileSync(outPath, report, "utf-8");

  console.log(`\n✅ Report written → scripts/${reportFile}\n`);
}

main();
