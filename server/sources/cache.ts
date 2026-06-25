import type { AcademicSource } from "./types";

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const DEFAULT_TTL_MS = 1000 * 60 * 10;
const MAX_CACHE_ENTRIES = 500;

const cache = new Map<string, CacheEntry<unknown>>();
const lastRequestAt = new Map<AcademicSource, number>();

const sourceIntervalsMs: Record<AcademicSource, number> = {
  openalex: 120,
  pubmed: 350,
  europepmc: 200,
  arxiv: 350,
  clinicaltrials: 200,
  courtlistener: 350,
  semanticscholar: 1200,
  unpaywall: 350,
  govinfo: 500,
  congress: 500,
  crossref: 250,
  datacite: 250,
  openlibrary: 250,
};

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(obj[key])}`).join(",")}}`;
}

export function sourceCacheKey(source: AcademicSource, operation: string, input: unknown) {
  return `${source}:${operation}:${stableStringify(input)}`;
}

export async function withSourceCache<T>(key: string, fn: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > now) return hit.value;

  const value = await fn();
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export async function withSourceRateLimit<T>(source: AcademicSource, fn: () => Promise<T>): Promise<T> {
  const interval = sourceIntervalsMs[source] ?? 250;
  const previous = lastRequestAt.get(source) ?? 0;
  const waitMs = Math.max(0, previous + interval - Date.now());
  if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
  lastRequestAt.set(source, Date.now());
  return fn();
}

export async function cachedSourceCall<T>(source: AcademicSource, operation: string, input: unknown, fn: () => Promise<T>, ttlMs?: number) {
  const key = sourceCacheKey(source, operation, input);
  return withSourceCache(key, () => withSourceRateLimit(source, fn), ttlMs);
}

export function getSourceCacheStats() {
  return { entries: cache.size, maxEntries: MAX_CACHE_ENTRIES };
}
