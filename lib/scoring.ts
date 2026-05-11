/** Drift score algorithm — pure functions, no side effects. */

import type { RepoHealthData, Risk, ScoreBreakdown, HealthScore } from "./types";
import { BREAKDOWN_MAX as MAX } from "./constants";

function scoreVelocity(d: RepoHealthData): number {
  const recent = d.commitsLast30Days;
  const prior = d.commitsPrior60Days;
  if (recent === 0 && prior === 0) {
    if (
      d.repoAgeYears >= 5 &&
      d.stars >= 25000 &&
      !d.archived &&
      !d.disabled &&
      !d.socialSignals.hasDeprecatedBadge
    ) {
      return 12;
    }
    return 0;
  }
  if (recent === 0) return 0;

  const recentRate = recent / 30;
  const priorRate = prior / 60;
  const ratio = priorRate === 0 ? 2 : recentRate / priorRate;

  let score: number;
  if (ratio >= 1) score = MAX.velocity;
  else if (ratio >= 0.7) score = 21;
  else if (ratio >= 0.5) score = 15;
  else if (ratio >= 0.3) score = 8;
  else score = 3;

  if (recent === 1) score = Math.min(score, 5);
  else if (recent <= 3) score = Math.min(score, 10);
  else if (recent <= 8) score = Math.min(score, 18);

  return score;
}

function scoreResponsiveness(d: RepoHealthData): number {
  const t = d.avgFirstResponseDays;
  if (t === null) return 10;
  if (t <= 1) return MAX.responsiveness;
  if (t <= 3) return 17;
  if (t <= 7) return 12;
  if (t <= 14) return 6;
  return 0;
}

function scoreCommunity(d: RepoHealthData): number {
  const c = d.activeContributors30d;
  let contribPts: number;
  if (c >= 10) contribPts = 9;
  else if (c >= 5) contribPts = 7;
  else if (c >= 2) contribPts = 4;
  else if (c === 1) contribPts = 2;
  else contribPts = 0;

  let ratioPts: number;
  if (d.stars < 10) {
    ratioPts = 3;
  } else {
    const r = d.forkStarRatio;
    if (r >= 0.05 && r <= 0.4) ratioPts = 6;
    else if (r >= 0.02 && r < 0.05) ratioPts = 4;
    else if (r > 0.4 && r <= 0.7) ratioPts = 4;
    else if (r > 0.7) ratioPts = 2;
    else ratioPts = 1;
  }

  return Math.min(MAX.community, contribPts + ratioPts);
}

function scoreFreshness(d: RepoHealthData): number {
  const dc = d.daysSinceLastCommit;
  let commitPts: number;
  if (!Number.isFinite(dc)) commitPts = 0;
  else if (dc < 7) commitPts = 7;
  else if (dc < 30) commitPts = 6;
  else if (dc < 90) commitPts = 4;
  else if (dc < 180) commitPts = 2;
  else if (dc < 365) commitPts = 1;
  else commitPts = 0;

  const dr = d.daysSinceLastRelease;
  let releasePts: number;
  if (dr === null) releasePts = 4;
  else if (dr < 90) releasePts = 8;
  else if (dr < 180) releasePts = 6;
  else if (dr < 365) releasePts = 3;
  else releasePts = 0;

  if (dr !== null && Number.isFinite(d.daysSinceLastCommit) && d.daysSinceLastCommit > 30) {
    releasePts = Math.min(releasePts, 4);
  }

  return Math.min(MAX.freshness, commitPts + releasePts);
}

function scoreTrust(d: RepoHealthData): number {
  let s = 0;
  if (d.license) s += 4;
  if (d.hasSecurityPolicy) s += 3;
  if (d.hasFunding) s += 3;
  return Math.min(MAX.trust, s);
}

function scoreSocial(d: RepoHealthData): number {
  const ss = d.socialSignals;
  let score = 0;
  if (ss.hasCommunityBadge) score += 4;
  if (ss.hasSponsorsFunding) score += 3;
  if (ss.helpWantedCount > 0) score += 3;
  if (ss.hasDiscussions) score += 3;
  if (ss.isMaintenanceModeReadme) score += 3;
  if (ss.hasDeprecatedBadge) score -= 10;
  const total = ss.helpWantedCount + ss.staleWontfixCount;
  if (total > 0 && ss.staleWontfixCount / total > 0.5 && d.activeContributors30d < 10)
    score -= 5;
  if (d.weeklyNpmDownloads !== null) {
    const hasRawVelocity = d.commitsLast30Days > 0 || d.commitsPrior60Days > 0;
    if (hasRawVelocity) {
      if (d.weeklyNpmDownloads > 1_000_000) score += 3;
      else if (d.weeklyNpmDownloads > 100_000) score += 2;
      else if (d.weeklyNpmDownloads > 10_000) score += 1;
    }
  }
  return Math.min(MAX.social, score);
}

function classifyRisk(score: number, d: RepoHealthData): Risk {
  if (d.archived || d.disabled) return "critical";
  const raw: Risk =
    score >= 80 ? "low" : score >= 60 ? "medium" : score >= 35 ? "high" : "critical";
  if (
    (d.socialSignals.isMaintenanceModeReadme || d.socialSignals.hasDeprecatedBadge) &&
    (raw === "low" || raw === "medium")
  ) {
    return "high";
  }
  return raw;
}

function months(days: number): number {
  return Math.max(1, Math.floor(days / 30));
}

function buildSignals(d: RepoHealthData): string[] {
  const out: string[] = [];

  if (d.archived) out.push("Repository archived on GitHub");
  if (d.disabled) out.push("Repository disabled by GitHub");

  if (Number.isFinite(d.daysSinceLastCommit)) {
    if (d.daysSinceLastCommit > 365) {
      out.push(`No commits in the last ${months(d.daysSinceLastCommit)} months`);
    } else if (d.daysSinceLastCommit > 30) {
      out.push(`No commits in the last ${d.daysSinceLastCommit} days`);
    }
  } else {
    out.push("No recent commits detected");
  }

  if (d.commitsPrior60Days >= 5) {
    const recentRate = d.commitsLast30Days / 30;
    const priorRate = d.commitsPrior60Days / 60;
    const ratio = priorRate === 0 ? Number.POSITIVE_INFINITY : recentRate / priorRate;
    if (ratio < 0.5) {
      const pct = Math.round((1 - ratio) * 100);
      out.push(`Commit velocity down ${pct}% over the last 30 days`);
    } else if (ratio >= 1.5 && Number.isFinite(ratio)) {
      const pct = Math.round((ratio - 1) * 100);
      out.push(`Commit velocity up ${pct}% over the last 30 days`);
    }
  } else if (d.commitsLast30Days === 0 && d.commitsPrior60Days === 0) {
    out.push("No commit activity in the last 90 days");
  }

  if (d.commitsLast30Days === 0 && !d.archived && !d.disabled) {
    out.push("No human commits in the last 30 days — maintainer may have stepped back");
  }
  if (
    d.topContributorShare90d > 0.8 &&
    d.activeContributors90d >= 1 &&
    d.commitsLast30Days + d.commitsPrior60Days >= 3
  ) {
    const pct = Math.round(d.topContributorShare90d * 100);
    out.push(`Single maintainer risk: one contributor made ${pct}% of commits in the last 90 days`);
  }
  if (d.activeContributors30d <= 1 && d.commitsLast30Days > 0) {
    out.push("Critical bus factor: only 1 active contributor in the last 30 days");
  } else if (d.activeContributors30d >= 10) {
    out.push(`${d.activeContributors30d} active contributors in the last 30 days`);
  }
  if (d.isMaintenanceModeOnly) {
    out.push("Maintenance mode only: recent commits limited to dependency updates and version bumps");
  }

  if (d.avgFirstResponseDays !== null) {
    if (d.avgFirstResponseDays > 14) {
      out.push(`Issues left unanswered for ${Math.round(d.avgFirstResponseDays)} days on average`);
    } else if (d.avgFirstResponseDays <= 1) {
      out.push("Maintainers very responsive (< 24h average)");
    }
  }

  if (d.daysSinceLastRelease === null) {
    out.push("No releases published");
  } else if (d.daysSinceLastRelease > 365) {
    out.push(`No release in the last ${months(d.daysSinceLastRelease)} months`);
  }

  if (d.stars > 0 && d.forkStarRatio > 0.7) {
    out.push("High fork-to-star ratio: possible community fragmentation");
  }

  if (!d.license) out.push("No license detected");
  if (!d.hasSecurityPolicy) out.push("No SECURITY.md found");
  if (!d.hasFunding) out.push("No FUNDING.yml found");

  const ss = d.socialSignals;
  if (ss.hasDeprecatedBadge) {
    out.push("README explicitly marks this project as deprecated");
  }
  if (ss.isMaintenanceModeReadme) {
    out.push("README signals maintenance mode — no new features, bug-fixes or security patches only");
  }
  if (ss.hasCommunityBadge) {
    out.push("Active community platform detected (Discord or Slack)");
  }
  if (ss.hasSponsorsFunding) {
    out.push("Financially supported via GitHub Sponsors or Open Collective");
  }
  if (ss.helpWantedCount > 0) {
    out.push(`${ss.helpWantedCount} open "help wanted" issues — community contributions welcome`);
  }
  if (ss.staleWontfixCount > 10) {
    out.push(`${ss.staleWontfixCount} open issues labeled "stale" — limited maintenance bandwidth`);
  }
  if (ss.hasDiscussions) {
    out.push("GitHub Discussions enabled on this repository");
  }

  if (d.weeklyNpmDownloads !== null && d.weeklyNpmDownloads > 0) {
    const n = d.weeklyNpmDownloads;
    const fmt =
      n >= 1_000_000
        ? `${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000
        ? `${Math.round(n / 1_000)}k`
        : `${n}`;
    out.push(`${fmt} weekly npm downloads`);
  }

  return out;
}

function buildPrediction(d: RepoHealthData, risk: Risk): string {
  if (d.archived) return "Project archived — abandonment confirmed.";
  if (d.disabled) return "Project disabled by GitHub — unavailable.";

  if (Number.isFinite(d.daysSinceLastCommit) && d.daysSinceLastCommit > 365) {
    return "Inactive for over a year — project likely abandoned.";
  }

  let velocityRatio = 1;
  if (d.commitsPrior60Days > 0) {
    velocityRatio = d.commitsLast30Days / 30 / (d.commitsPrior60Days / 60);
  } else if (d.commitsLast30Days === 0) {
    velocityRatio = 0;
  } else {
    velocityRatio = 2;
  }

  if (risk === "critical") {
    if (velocityRatio < 0.3) {
      return "Sharp decline in commit cadence — risk of abandonment within 60–90 days.";
    }
    return "Multiple decay signals detected — risk of abandonment within 90–180 days.";
  }
  if (risk === "high") {
    if (velocityRatio < 0.5) {
      return "Declining velocity — risk of abandonment within 6–12 months.";
    }
    return "Multiple weak signals — monitor trajectory over the next 6–12 months.";
  }
  if (risk === "medium") {
    return "Stable but fragile — no short-term abandonment signal.";
  }
  return "Healthy and active project — solid trajectory for 12+ months.";
}

export function computeHealthScore(data: RepoHealthData): HealthScore {
  const breakdown: ScoreBreakdown = {
    velocity: scoreVelocity(data),
    responsiveness: scoreResponsiveness(data),
    community: scoreCommunity(data),
    freshness: scoreFreshness(data),
    trust: scoreTrust(data),
    social: scoreSocial(data),
  };

  const overrideSignals: string[] = [];

  if (breakdown.velocity < 5) {
    breakdown.responsiveness = Math.min(breakdown.responsiveness, 5);
    breakdown.trust = Math.min(breakdown.trust, 4);
    overrideSignals.push(
      "Low activity override: responsiveness and trust scores capped due to near-zero commit velocity"
    );
  } else if (breakdown.velocity < 10) {
    breakdown.responsiveness = Math.min(breakdown.responsiveness, 12);
    breakdown.trust = Math.min(breakdown.trust, 7);
    overrideSignals.push(
      "Reduced weight: responsiveness and trust adjusted for declining activity"
    );
  }

  if (data.stars > 10000 && (breakdown.velocity >= 15 || data.activeContributors90d > 50)) {
    if (breakdown.social < 10) {
      breakdown.social = 10;
      overrideSignals.push(
        "Large project baseline: social score floored due to established community indicators"
      );
    }
  } else if (data.stars > 5000 && breakdown.velocity >= 10) {
    if (breakdown.social < 7) breakdown.social = 7;
  }

  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        breakdown.velocity +
          breakdown.responsiveness +
          breakdown.community +
          breakdown.freshness +
          breakdown.trust +
          breakdown.social
      )
    )
  );
  const risk = classifyRisk(score, data);
  const signals = [...buildSignals(data), ...overrideSignals];
  const prediction = buildPrediction(data, risk);

  return { score, risk, breakdown, signals, prediction };
}
