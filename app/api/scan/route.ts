import { NextResponse } from "next/server";
import { fetchRepoHealth, ScanError } from "@/lib/github";
import { computeHealthScore } from "@/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NAME_RE = /^[A-Za-z0-9._-]+$/;
const NAME_MAX = 100;

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const CACHE_TTL_MS = 60 * 60 * 1000;

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const reportCache = new Map<string, CacheEntry>();
const ipHits = new Map<string, number[]>();

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
  const recent = (ipHits.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= RATE_LIMIT) {
    const retryAfterSec = Math.max(1, Math.ceil((recent[0] + RATE_WINDOW_MS - now) / 1000));
    ipHits.set(ip, recent);
    return { ok: false, retryAfterSec };
  }
  recent.push(now);
  ipHits.set(ip, recent);
  return { ok: true };
}

function jsonError(message: string, status: number, extraHeaders?: Record<string, string>) {
  return NextResponse.json({ error: message }, { status, headers: extraHeaders });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return jsonError(
      `Trop de requêtes. Réessaie dans ${rl.retryAfterSec}s.`,
      429,
      { "Retry-After": String(rl.retryAfterSec) }
    );
  }

  let body: { owner?: unknown; repo?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Corps JSON invalide.", 400);
  }

  const owner = typeof body.owner === "string" ? body.owner.trim() : "";
  const repo = typeof body.repo === "string" ? body.repo.trim() : "";

  if (!owner || !repo) {
    return jsonError("`owner` et `repo` sont requis.", 400);
  }
  if (owner.length > NAME_MAX || repo.length > NAME_MAX) {
    return jsonError("Nom de repo ou d'owner trop long.", 400);
  }
  if (!NAME_RE.test(owner) || !NAME_RE.test(repo)) {
    return jsonError(
      "Format invalide. Caractères autorisés : lettres, chiffres, point, tiret, underscore.",
      400
    );
  }

  const cacheKey = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
  const now = Date.now();
  const cached = reportCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.value, {
      headers: { "X-DriftLogg-Cache": "hit" },
    });
  }

  try {
    const data = await fetchRepoHealth(owner, repo);
    const health = computeHealthScore(data);
    const payload = {
      ...health,
      data,
      scannedAt: new Date().toISOString(),
    };
    reportCache.set(cacheKey, { value: payload, expiresAt: now + CACHE_TTL_MS });
    return NextResponse.json(payload, {
      headers: { "X-DriftLogg-Cache": "miss" },
    });
  } catch (err) {
    if (err instanceof ScanError) {
      switch (err.kind) {
        case "not_found":
          return jsonError(
            `Le dépôt ${owner}/${repo} est introuvable. Vérifie l'orthographe ou qu'il est public.`,
            404
          );
        case "private":
          return jsonError(
            `Le dépôt ${owner}/${repo} semble privé. DriftLogg ne scanne que les repos publics.`,
            403
          );
        case "rate_limit":
          return jsonError(
            "GitHub a temporairement bloqué nos requêtes (rate limit). Réessaie dans quelques minutes, ou configure GITHUB_TOKEN côté serveur pour passer à 5000 req/h.",
            503,
            { "Retry-After": "300" }
          );
        case "network":
          return jsonError(
            "Impossible de joindre GitHub. Réessaie dans un instant.",
            502
          );
        default:
          return jsonError(err.message, err.status ?? 500);
      }
    }
    const message = err instanceof Error ? err.message : "Erreur inattendue.";
    return jsonError(message, 500);
  }
}
