import type { RepoHealthData } from "./github";

export type Risk = "low" | "medium" | "high" | "critical";

export interface ScoreBreakdown {
  velocity: number;
  responsiveness: number;
  community: number;
  freshness: number;
  trust: number;
}

export interface HealthScore {
  score: number;
  risk: Risk;
  breakdown: ScoreBreakdown;
  signals: string[];
  prediction: string;
}

const MAX = {
  velocity: 30,
  responsiveness: 25,
  community: 20,
  freshness: 15,
  trust: 10,
} as const;

function scoreVelocity(d: RepoHealthData): number {
  const recent = d.commitsLast30Days;
  const prior = d.commitsPrior60Days;
  if (recent === 0 && prior === 0) return 0;
  if (recent === 0) return 0;

  const recentRate = recent / 30;
  const priorRate = prior / 60;
  const ratio = priorRate === 0 ? 2 : recentRate / priorRate;

  let score: number;
  if (ratio >= 1) score = MAX.velocity;
  else if (ratio >= 0.7) score = 25;
  else if (ratio >= 0.5) score = 18;
  else if (ratio >= 0.3) score = 10;
  else score = 4;

  if (recent === 1) score = Math.min(score, 6);
  else if (recent <= 3) score = Math.min(score, 12);
  else if (recent <= 8) score = Math.min(score, 22);

  return score;
}

function scoreResponsiveness(d: RepoHealthData): number {
  const t = d.avgFirstResponseDays;
  if (t === null) return 12;
  if (t <= 1) return MAX.responsiveness;
  if (t <= 3) return 22;
  if (t <= 7) return 16;
  if (t <= 14) return 8;
  return 0;
}

function scoreCommunity(d: RepoHealthData): number {
  const c = d.activeContributors30d;
  let contribPts: number;
  if (c >= 10) contribPts = 12;
  else if (c >= 5) contribPts = 9;
  else if (c >= 2) contribPts = 5;
  else if (c === 1) contribPts = 2;
  else contribPts = 0;

  let ratioPts: number;
  if (d.stars < 10) {
    ratioPts = 4;
  } else {
    const r = d.forkStarRatio;
    if (r >= 0.05 && r <= 0.4) ratioPts = 8;
    else if (r >= 0.02 && r < 0.05) ratioPts = 5;
    else if (r > 0.4 && r <= 0.7) ratioPts = 5;
    else if (r > 0.7) ratioPts = 3;
    else ratioPts = 2;
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

  return Math.min(MAX.freshness, commitPts + releasePts);
}

function scoreTrust(d: RepoHealthData): number {
  let s = 0;
  if (d.license) s += 4;
  if (d.hasSecurityPolicy) s += 3;
  if (d.hasFunding) s += 3;
  return Math.min(MAX.trust, s);
}

function classifyRisk(score: number, d: RepoHealthData): Risk {
  if (d.archived || d.disabled) return "critical";
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  if (score >= 35) return "high";
  return "critical";
}

function months(daysValue: number): number {
  return Math.max(1, Math.floor(daysValue / 30));
}

function buildSignals(d: RepoHealthData): string[] {
  const out: string[] = [];

  if (d.archived) out.push("Repo archivé sur GitHub");
  if (d.disabled) out.push("Repo désactivé par GitHub");

  if (Number.isFinite(d.daysSinceLastCommit)) {
    if (d.daysSinceLastCommit > 365) {
      out.push(`Aucun commit depuis ${months(d.daysSinceLastCommit)} mois`);
    } else if (d.daysSinceLastCommit > 30) {
      out.push(`Aucun commit depuis ${d.daysSinceLastCommit} jours`);
    }
  } else {
    out.push("Aucun commit récent détectable");
  }

  if (d.commitsPrior60Days >= 5) {
    const recentRate = d.commitsLast30Days / 30;
    const priorRate = d.commitsPrior60Days / 60;
    const ratio = priorRate === 0 ? Number.POSITIVE_INFINITY : recentRate / priorRate;
    if (ratio < 0.5) {
      const pct = Math.round((1 - ratio) * 100);
      out.push(`Vélocité en baisse de ${pct}% sur 30 jours`);
    } else if (ratio >= 1.5 && Number.isFinite(ratio)) {
      const pct = Math.round((ratio - 1) * 100);
      out.push(`Vélocité en hausse de ${pct}% sur 30 jours`);
    }
  } else if (d.commitsLast30Days === 0 && d.commitsPrior60Days === 0) {
    out.push("Aucune activité de commit sur 90 jours");
  }

  if (d.activeContributors30d <= 1 && d.commitsLast30Days > 0) {
    out.push("Bus factor critique : 1 seul contributeur actif sur 30 jours");
  } else if (d.activeContributors30d >= 10) {
    out.push(`${d.activeContributors30d} contributeurs actifs sur 30 jours`);
  }

  if (d.avgFirstResponseDays !== null) {
    if (d.avgFirstResponseDays > 14) {
      out.push(
        `Issues sans réponse pendant ${Math.round(d.avgFirstResponseDays)} jours en moyenne`
      );
    } else if (d.avgFirstResponseDays <= 1) {
      out.push("Mainteneurs très réactifs (<24h en moyenne)");
    }
  }

  if (d.daysSinceLastRelease === null) {
    out.push("Aucune release publiée");
  } else if (d.daysSinceLastRelease > 365) {
    out.push(`Aucune release depuis ${months(d.daysSinceLastRelease)} mois`);
  }

  if (d.stars > 0) {
    if (d.forkStarRatio > 0.7) {
      out.push("Beaucoup de forks par rapport aux stars : signe possible de fragmentation");
    }
  }

  if (!d.license) out.push("Aucune licence détectée");
  if (!d.hasSecurityPolicy) out.push("Pas de SECURITY.md");
  if (!d.hasFunding) out.push("Pas de FUNDING.yml");

  return out;
}

function buildPrediction(d: RepoHealthData, risk: Risk): string {
  if (d.archived) return "Projet archivé — abandon confirmé.";
  if (d.disabled) return "Projet désactivé par GitHub — indisponible.";

  if (Number.isFinite(d.daysSinceLastCommit) && d.daysSinceLastCommit > 365) {
    return "Inactif depuis plus d'un an — projet probablement abandonné.";
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
      return "Déclin marqué de la cadence — risque d'abandon dans 60-90 jours.";
    }
    return "Signaux multiples de déclin — risque d'abandon dans 90-180 jours.";
  }
  if (risk === "high") {
    if (velocityRatio < 0.5) {
      return "Vélocité en baisse — risque d'abandon dans 6-12 mois.";
    }
    return "Plusieurs signaux faibles — surveiller la trajectoire sur 6-12 mois.";
  }
  if (risk === "medium") {
    return "Trajectoire stable mais fragile — pas de signal d'abandon à court terme.";
  }
  return "Projet sain et actif — trajectoire saine sur 12+ mois.";
}

export function computeHealthScore(data: RepoHealthData): HealthScore {
  const breakdown: ScoreBreakdown = {
    velocity: scoreVelocity(data),
    responsiveness: scoreResponsiveness(data),
    community: scoreCommunity(data),
    freshness: scoreFreshness(data),
    trust: scoreTrust(data),
  };
  const score = Math.round(
    breakdown.velocity +
      breakdown.responsiveness +
      breakdown.community +
      breakdown.freshness +
      breakdown.trust
  );
  const risk = classifyRisk(score, data);
  const signals = buildSignals(data);
  const prediction = buildPrediction(data, risk);

  return { score, risk, breakdown, signals, prediction };
}
