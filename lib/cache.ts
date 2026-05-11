/** In-memory and Vercel KV cache driver with LRU eviction and TTL. */

import type { CacheEntry, CacheStats, CacheHit } from "./types";

interface KvClient {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown, opts?: { px?: number }) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 500;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

interface CacheDriver {
  driverName: "memory" | "kv";
  get(key: string): Promise<CacheEntry | null>;
  set(key: string, entry: CacheEntry, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  size(): Promise<number>;
}

function createMemoryDriver(): CacheDriver {
  const store = new Map<string, CacheEntry>();

  if (typeof setInterval !== "undefined") {
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [k, v] of store) {
        if (v.expiresAt < now) store.delete(k);
      }
    }, CLEANUP_INTERVAL_MS);
    if (typeof timer.unref === "function") timer.unref();
  }

  return {
    driverName: "memory",
    async get(key) {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) {
        store.delete(key);
        return null;
      }
      store.delete(key);
      store.set(key, entry);
      return entry;
    },
    async set(key, entry) {
      if (store.size >= MAX_ENTRIES && !store.has(key)) {
        const oldest = store.keys().next().value;
        if (oldest !== undefined) store.delete(oldest);
      }
      store.set(key, entry);
    },
    async delete(key) {
      store.delete(key);
    },
    async clear() {
      store.clear();
    },
    async size() {
      return store.size;
    },
  };
}

function createKvDriver(): CacheDriver {
  let kvPromise: Promise<KvClient> | null = null;

  async function getKv(): Promise<KvClient> {
    if (!kvPromise) {
      kvPromise = (async () => {
        // Dynamic import via variable prevents the bundler from requiring
        // the module at build time when @vercel/kv is not installed.
        const moduleName = "@vercel/kv";
        const mod = (await import(moduleName)) as { kv: KvClient };
        return mod.kv;
      })();
    }
    return kvPromise;
  }

  return {
    driverName: "kv",
    async get(key) {
      const kv = await getKv();
      const raw = (await kv.get(key)) as CacheEntry | null;
      if (!raw) return null;
      if (raw.expiresAt < Date.now()) {
        await kv.del(key);
        return null;
      }
      return raw;
    },
    async set(key, entry, ttlMs) {
      const kv = await getKv();
      await kv.set(key, entry, { px: ttlMs });
    },
    async delete(key) {
      const kv = await getKv();
      await kv.del(key);
    },
    async clear() {
      // Vercel KV does not expose a cheap flush; counters reset elsewhere.
    },
    async size() {
      return -1;
    },
  };
}

const driver: CacheDriver = process.env.KV_REST_API_URL
  ? createKvDriver()
  : createMemoryDriver();

let hits = 0;
let misses = 0;

export const cache = {
  async get<T = unknown>(key: string): Promise<CacheHit<T> | null> {
    const entry = await driver.get(key);
    if (!entry) {
      misses++;
      return null;
    }
    hits++;
    return { value: entry.value as T, cachedAt: entry.cachedAt };
  },
  async set(key: string, value: unknown, ttlMs: number = DEFAULT_TTL_MS): Promise<void> {
    const now = Date.now();
    await driver.set(key, { value, cachedAt: now, expiresAt: now + ttlMs }, ttlMs);
  },
  async delete(key: string): Promise<void> {
    await driver.delete(key);
  },
  async clear(): Promise<void> {
    await driver.clear();
    hits = 0;
    misses = 0;
  },
  async stats(): Promise<CacheStats> {
    const total = hits + misses;
    return {
      size: await driver.size(),
      hits,
      misses,
      hitRate: total === 0 ? 0 : hits / total,
      driver: driver.driverName,
    };
  },
};
