import { NextResponse } from "next/server";
import { fetchRepoHealth, ScanError } from "@/lib/github";
import { computeHealthScore } from "@/lib/scoring";
import { cache } from "@/lib/cache";
import { incrementScanCount } from "@/lib/counter";
import {
  OWNER_RE,
  REPO_RE,
  OWNER_MAX,
  REPO_MAX,
  SCAN_TTL_MS,
  RATE_PER_IP,
  RATE_GLOBAL,
  RATE_WINDOW_MS,
} from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ⚠️ In-memory rate limiter resets on cold start.
// For production scale, replace with Vercel KV or Upstash Redis.
const ipHits = new Map<string, number[]>();
const globalHits: number[] = [];

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;

  const ipRecent = (ipHits.get(ip) ?? []).filter((t) => t > cutoff);
  if (ipRecent.length >= RATE_PER_IP) {
    const retryAfterSec = Math.max(1, Math.ceil((ipRecent[0] + RATE_WINDOW_MS - now) / 1000));
    ipHits.set(ip, ipRecent);
    return { ok: false, retryAfterSec };
  }

  while (globalHits.length > 0 && globalHits[0] <= cutoff) globalHits.shift();
  if (globalHits.length >= RATE_GLOBAL) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((globalHits[0] + RATE_WINDOW_MS - now) / 1000)
    );
    return { ok: false, retryAfterSec };
  }

  ipRecent.push(now);
  ipHits.set(ip, ipRecent);
  globalHits.push(now);
  return { ok: true };
}

function jsonError(message: string, status: number, extraHeaders?: Record<string, string>) {
  return NextResponse.json({ error: message }, { status, headers: { ...CORS_HEADERS, ...extraHeaders } });
}

function jsonOk(data: Record<string, unknown>, extraHeaders?: Record<string, string>) {
  return NextResponse.json(data, { headers: { ...CORS_HEADERS, ...extraHeaders } });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = (searchParams.get("owner") ?? "").trim();
  const repo  = (searchParams.get("repo") ?? "").trim();

  if (!owner || !repo) return jsonError("`owner` and `repo` query params are required.", 400);
  if (owner.length > OWNER_MAX) return jsonError(`Owner name too long (max ${OWNER_MAX} characters).`, 400);
  if (repo.length > REPO_MAX)   return jsonError(`Repository name too long (max ${REPO_MAX} characters).`, 400);
  if (!OWNER_RE.test(owner))    return jsonError("Invalid owner format. Allowed characters: letters, digits, hyphen.", 400);
  if (!REPO_RE.test(repo))      return jsonError("Invalid repository format. Allowed characters: letters, digits, period, hyphen, underscore.", 400);

  const ip = getClientIp(request);
  const isLocalhost = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(ip) || ip === "unknown";
  const rl = isLocalhost ? { ok: true as const } : checkRateLimit(ip);
  if (!rl.ok) {
    return jsonError("Too many scans. Please try again in a minute.", 429, { "Retry-After": String(rl.retryAfterSec) });
  }

  const cacheKey = `scan:${owner.toLowerCase()}/${repo.toLowerCase()}`;
  const cached = await cache.get<Record<string, unknown>>(cacheKey);
  if (cached) {
    return jsonOk(
      { ...cached.value, fromCache: true, cachedAt: new Date(cached.cachedAt).toISOString() },
      { "X-Cache": "HIT" }
    );
  }

  try {
    const data = await fetchRepoHealth(owner, repo);
    const health = computeHealthScore(data);
    const result = { ...health, data, scannedAt: new Date().toISOString() };
    await cache.set(cacheKey, result, SCAN_TTL_MS);
    void incrementScanCount();
    return jsonOk({ ...result, fromCache: false }, { "X-Cache": "MISS" });
  } catch (err) {
    if (err instanceof ScanError) {
      switch (err.kind) {
        case "not_found":  return jsonError(`Repository ${owner}/${repo} not found.`, 404);
        case "private":    return jsonError(`Repository ${owner}/${repo} is private. DriftLogg only scans public repos.`, 403);
        case "rate_limit": return jsonError("GitHub rate limit hit. Retry in a few minutes.", 503, { "Retry-After": "300" });
        case "network":    return jsonError("Could not reach GitHub. Retry in a moment.", 502);
        default:           return jsonError(err.message, err.status ?? 500);
      }
    }
    return jsonError(err instanceof Error ? err.message : "Unexpected error.", 500);
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const isLocalhost =
    ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(ip) || ip === "unknown";
  const rl = isLocalhost ? { ok: true as const } : checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many scans. Please try again in a minute.", retryAfter: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: { owner?: unknown; repo?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const owner = typeof body.owner === "string" ? body.owner.trim() : "";
  const repo = typeof body.repo === "string" ? body.repo.trim() : "";

  if (!owner || !repo) return jsonError("`owner` and `repo` are required.", 400);
  if (owner.length > OWNER_MAX)
    return jsonError(`Owner name too long (max ${OWNER_MAX} characters).`, 400);
  if (repo.length > REPO_MAX)
    return jsonError(`Repository name too long (max ${REPO_MAX} characters).`, 400);
  if (!OWNER_RE.test(owner))
    return jsonError("Invalid owner format. Allowed characters: letters, digits, hyphen.", 400);
  if (!REPO_RE.test(repo))
    return jsonError(
      "Invalid repository format. Allowed characters: letters, digits, period, hyphen, underscore.",
      400
    );

  const cacheKey = `scan:${owner.toLowerCase()}/${repo.toLowerCase()}`;

  const cached = await cache.get<Record<string, unknown>>(cacheKey);
  if (cached) {
    return jsonOk(
      { ...cached.value, fromCache: true, cachedAt: new Date(cached.cachedAt).toISOString() },
      { "X-Cache": "HIT" }
    );
  }

  try {
    const data = await fetchRepoHealth(owner, repo);
    const health = computeHealthScore(data);
    const result = { ...health, data, scannedAt: new Date().toISOString() };
    await cache.set(cacheKey, result, SCAN_TTL_MS);
    void incrementScanCount();
    return jsonOk({ ...result, fromCache: false }, { "X-Cache": "MISS" });
  } catch (err) {
    if (err instanceof ScanError) {
      switch (err.kind) {
        case "not_found":
          return jsonError(
            `Repository ${owner}/${repo} not found. Check the spelling or make sure it's public.`,
            404
          );
        case "private":
          return jsonError(
            `Repository ${owner}/${repo} appears to be private. DriftLogg only scans public repos.`,
            403
          );
        case "rate_limit":
          return jsonError(
            "GitHub temporarily blocked our requests (rate limit). Retry in a few minutes, or set GITHUB_TOKEN server-side to raise the limit to 5,000 req/h.",
            503,
            { "Retry-After": "300" }
          );
        case "network":
          return jsonError("Could not reach GitHub. Please retry in a moment.", 502);
        default:
          return jsonError(err.message, err.status ?? 500);
      }
    }
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return jsonError(message, 500);
  }
}
