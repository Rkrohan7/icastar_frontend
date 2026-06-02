/**
 * Client-side response cache for GET endpoints.
 *
 * Why this exists: every dashboard load fanned out 5-8 identical API calls
 * (Header + DashLayout + page-level effects all hitting the same endpoints).
 * Multiplied across users that's a heavy AWS bill. This module gives every
 * service a one-line way to memoize a GET with a TTL, share concurrent
 * in-flight requests, and invalidate cleanly after mutations.
 *
 * Architecture:
 *  - In-memory Map keyed by a string (caller chooses) — survives navigation
 *    inside the SPA, drops on full reload.
 *  - Optional sessionStorage persistence for cross-reload survival within
 *    the same tab (set `persist: true`).
 *  - In-flight dedup: identical concurrent calls share one Promise.
 *  - Pattern invalidation: clear by exact key, prefix, or regex.
 *
 * Usage:
 *   const dashboard = await cachedGet(
 *     `artist:dashboard:metrics`,
 *     () => apiClient.get('/artist/dashboard/metrics').then(r => r.data.data),
 *     { ttl: 30_000 }
 *   )
 *
 *   // After mutating something that affects dashboard data:
 *   invalidateCache(/^artist:dashboard:/)
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

interface CacheOptions {
  /** Time-to-live in milliseconds. Default 30s. */
  ttl?: number
  /** Persist to sessionStorage so cache survives a tab reload. Default false. */
  persist?: boolean
  /** Force a fresh fetch and overwrite the cache. */
  forceRefresh?: boolean
}

const DEFAULT_TTL = 30_000
const SESSION_PREFIX = '_apiCache:'

const memCache = new Map<string, CacheEntry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

function readSession<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(SESSION_PREFIX + key)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeSession<T>(key: string, entry: CacheEntry<T>): void {
  try {
    sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(entry))
  } catch {
    // Quota exceeded or unavailable — silently skip persistence
  }
}

export async function cachedGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const { ttl = DEFAULT_TTL, persist = false, forceRefresh = false } = options

  if (!forceRefresh) {
    // 1. Memory hit
    const memHit = memCache.get(key) as CacheEntry<T> | undefined
    if (memHit && Date.now() < memHit.expiresAt) return memHit.value

    // 2. Session storage hit (rehydrate into memory)
    if (persist) {
      const sessHit = readSession<T>(key)
      if (sessHit) {
        memCache.set(key, sessHit)
        return sessHit.value
      }
    }

    // 3. In-flight dedup
    const existing = inflight.get(key) as Promise<T> | undefined
    if (existing) return existing
  }

  const promise = fetcher()
    .then((value) => {
      const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttl }
      memCache.set(key, entry)
      if (persist) writeSession(key, entry)
      return value
    })
    .finally(() => {
      inflight.delete(key)
    })

  inflight.set(key, promise)
  return promise
}

/**
 * Invalidate cache entries. Accepts an exact key, a prefix string, or a regex.
 * - String without trailing wildcards → exact match
 * - String ending with `:` or `/` → prefix match
 * - RegExp → pattern match
 */
export function invalidateCache(pattern: string | RegExp): void {
  if (typeof pattern === 'string') {
    if (pattern.endsWith(':') || pattern.endsWith('/')) {
      // Prefix invalidation
      for (const key of memCache.keys()) {
        if (key.startsWith(pattern)) memCache.delete(key)
      }
      // Best-effort: also clear session storage entries
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i)
          if (k && k.startsWith(SESSION_PREFIX + pattern)) sessionStorage.removeItem(k)
        }
      } catch {}
    } else {
      memCache.delete(pattern)
      try {
        sessionStorage.removeItem(SESSION_PREFIX + pattern)
      } catch {}
    }
    return
  }

  // RegExp
  for (const key of memCache.keys()) {
    if (pattern.test(key)) memCache.delete(key)
  }
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i)
      if (!k || !k.startsWith(SESSION_PREFIX)) continue
      const bare = k.slice(SESSION_PREFIX.length)
      if (pattern.test(bare)) sessionStorage.removeItem(k)
    }
  } catch {}
}

/** Wipe everything. Useful on logout. */
export function clearCache(): void {
  memCache.clear()
  inflight.clear()
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i)
      if (k && k.startsWith(SESSION_PREFIX)) sessionStorage.removeItem(k)
    }
  } catch {}
}

/** Build a deterministic cache key from a base + params object. */
export function buildCacheKey(base: string, params?: Record<string, unknown>): string {
  if (!params) return base
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .sort()
    .map((k) => `${k}=${JSON.stringify(params[k])}`)
    .join('&')
  return sorted ? `${base}?${sorted}` : base
}

// Dev helper — expose so you can inspect cache state in browser console
if (typeof window !== 'undefined') {
  ;(window as unknown as { __apiCache?: unknown }).__apiCache = {
    mem: memCache,
    inflight,
    invalidate: invalidateCache,
    clear: clearCache,
  }
}
