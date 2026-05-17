/** Scan counter — Vercel KV in production, in-memory fallback locally. */

const KEY = "driftlogg:scan_count";
const SEED = 0; // bump this to include historical scans

let memCount = SEED;

async function getKv() {
  const moduleName = "@vercel/kv";
  const mod = (await import(moduleName)) as { kv: { get: (k: string) => Promise<unknown>; set: (k: string, v: unknown) => Promise<unknown> } };
  return mod.kv;
}

const hasKv = Boolean(process.env.KV_REST_API_URL);

export async function incrementScanCount(): Promise<void> {
  if (!hasKv) { memCount++; return; }
  try {
    const kv = await getKv();
    const current = (await kv.get(KEY) as number) ?? SEED;
    await kv.set(KEY, current + 1);
  } catch {
    memCount++;
  }
}

export async function getScanCount(): Promise<number> {
  if (!hasKv) return memCount;
  try {
    const kv = await getKv();
    return (await kv.get(KEY) as number) ?? SEED;
  } catch {
    return memCount;
  }
}
