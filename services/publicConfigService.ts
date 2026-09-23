// Public (no-auth) landing page numbers, set by the admin in Super Admin → Config.
// Uses a plain fetch so the axios auth interceptor never attaches a token —
// the landing page must load for signed-out visitors.
const BASE_URL = 'https://api.icastar.com/api'

export interface LandingStats {
  // false hides the whole counters section on the landing page
  enabled: boolean
  // false hides the blog section on the landing page
  blogsEnabled: boolean
  activeArtists: number
  castingDirectors: number
  successfulAuditions: number
  successRate: number
}

// Used until the API answers, and if it fails or returns nothing.
export const DEFAULT_LANDING_STATS: LandingStats = {
  enabled: true,
  blogsEnabled: true,
  activeArtists: 10000,
  castingDirectors: 250,
  successfulAuditions: 10000,
  successRate: 95,
}

const toNumber = (value: unknown, fallback: number): number => {
  const n = typeof value === 'string' ? Number(value) : (value as number)
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : fallback
}

export async function getLandingStats(): Promise<LandingStats> {
  try {
    const res = await fetch(`${BASE_URL}/public/landing-stats`)
    if (!res.ok) return DEFAULT_LANDING_STATS
    const body = await res.json()
    const data = body?.data ?? body
    // Only an explicit false (or 'false') hides the section
    const enabled = data?.enabled ?? data?.landingStatsEnabled
    const blogsEnabled = data?.blogsEnabled ?? data?.landingBlogsEnabled
    return {
      enabled: enabled !== false && enabled !== 'false',
      blogsEnabled: blogsEnabled !== false && blogsEnabled !== 'false',
      activeArtists: toNumber(data?.activeArtists, DEFAULT_LANDING_STATS.activeArtists),
      castingDirectors: toNumber(data?.castingDirectors, DEFAULT_LANDING_STATS.castingDirectors),
      successfulAuditions: toNumber(data?.successfulAuditions, DEFAULT_LANDING_STATS.successfulAuditions),
      successRate: toNumber(data?.successRate, DEFAULT_LANDING_STATS.successRate),
    }
  } catch {
    return DEFAULT_LANDING_STATS
  }
}

export default { getLandingStats }
