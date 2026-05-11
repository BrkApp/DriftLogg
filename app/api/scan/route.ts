import { NextResponse } from "next/server";
import { fetchRepoHealth, ScanError } from "@/lib/github";
import { computeHealthScore } from "@/lib/scoring";
import { cache } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NAME_RE = /^[A-Za-z0-9._-]+$/;
const NAME_MAX = 100;

const RATE_PER_IP = 20;
const RATE_GLOBAL = 500;
const RATE_WINDOW_MS = 60_000;
const SCAN_TTL_MS = 10 * 60 * 1000;

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
    const retryAfterSec = Math.max(1, Math.ceil((globalHits[0] + RATE_WINDOW_MS - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  ipRecent.push(now);
  ipHits.set(ip, ipRecent);
  globalHits.push(now);
  return { ok: true };
}

function jsonError(message: string, status: number, extraHeaders?: Record<string, string>) {
  return NextResponse.json({ error: message }, { status, headers: extraHeaders });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const isLocalhost = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(ip) || ip === "unknown";
  const rl = isLocalhost ? { ok: true as const } : checkRateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "Too many scans. Please try again in a minute.",
        retryAfter: rl.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
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
  if (owner.length > NAME_MAX || repo.length > NAME_MAX)
    return jsonError("Repository or owner name too long.", 400);
  if (!NAME_RE.test(owner) || !NAME_RE.test(repo))
    return jsonError(
      "Invalid format. Allowed characters: letters, digits, period, hyphen, underscore.",
      400
    );

  const cacheKey = `scan:${owner.toLowerCase()}/${repo.toLowerCase()}`;

  const cached = await cache.get<Record<string, unknown>>(cacheKey);
  if (cached) {
    return NextResponse.json(
      { ...cached.value, fromCache: true, cachedAt: new Date(cached.cachedAt).toISOString() },
      { headers: { "X-Cache": "HIT" } }
    );
  }

  try {
    const data = await fetchRepoHealth(owner, repo);
    const health = computeHealthScore(data);
    const result = {
      ...health,
      data,
      scannedAt: new Date().toISOString(),
    };
    await cache.set(cacheKey, result, SCAN_TTL_MS);
    return NextResponse.json(
      { ...result, fromCache: false },
      { headers: { "X-Cache": "MISS" } }
    );
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
    const message = err instanceof Error ? err.message : "Erreur inattendue.";
    return jsonError(message, 500);
  }
}
