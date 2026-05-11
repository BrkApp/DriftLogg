/** Validation rules, rate-limit settings, scoring caps, and display labels used across the app. */

// ── Input validation ──────────────────────────────────────────────────────────
export const OWNER_RE = /^[A-Za-z0-9-]+$/;
export const REPO_RE = /^[A-Za-z0-9._-]+$/;
export const OWNER_MAX = 39;
export const REPO_MAX = 100;

// ── Scan API ──────────────────────────────────────────────────────────────────
export const SCAN_TTL_MS = 10 * 60 * 1_000;
export const RATE_PER_IP = 20;
export const RATE_GLOBAL = 500;
export const RATE_WINDOW_MS = 60_000;

// ── Scoring maximums ──────────────────────────────────────────────────────────
export const BREAKDOWN_MAX = {
  velocity: 25,
  responsiveness: 20,
  community: 15,
  freshness: 15,
  trust: 10,
  social: 15,
} as const;

export const BREAKDOWN_LABELS: Record<keyof typeof BREAKDOWN_MAX, string> = {
  velocity: "Velocity",
  responsiveness: "Responsiveness",
  community: "Community",
  freshness: "Freshness",
  trust: "Trust",
  social: "Social Signals",
};
