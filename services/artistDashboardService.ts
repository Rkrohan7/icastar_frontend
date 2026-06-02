import apiClient from './apiClient'

// Types for API responses
export interface ArtistDashboardMetrics {
  profileViews: {
    value: number
    change: string
    changeType: string
  }
  jobInvitations: {
    value: number
    change: string
    changeType: string
  }
  applicationsSent: {
    value: number
    change: string
    changeType: string
  }
  interviewsScheduled: {
    value: number
    change: string
    changeType: string
  }
  projectsCompleted: {
    value: number
    change: string
    changeType: string
  }
  creditsBalance: {
    value: number
    change: string
    changeType: string
    currency: string
  }
}

export interface ProfileViewsTrend {
  trend: Array<{
    month: string
    views: number
  }>
  totalViews: number
  growthRate: number
}

export interface ApplicationStatus {
  statusBreakdown: Array<{
    name: string
    value: number
    color: string
  }>
  total: number
}

export interface EarningsTrend {
  trend: Array<{
    month: string
    earnings: number
  }>
  totalEarnings: number
  averageEarnings: number
  highestMonth: string
  growthRate: number
}

export interface JobOpportunity {
  id: number
  title: string
  company: string
  companyLogo: string | null
  budget: string
  budgetMin: number
  budgetMax: number
  currency: string
  matchScore: number
  type: string
  location: string
  postedAt: string
  skills: string[]
  description: string
}

export interface RecentActivity {
  id: number
  type: string
  title: string
  company: string
  timestamp: string
  relativeTime: string
  metadata: Record<string, any>
}

export interface PortfolioItem {
  id: number
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  views: number
  likes: number
  category: string
  tags: string[]
  uploadedAt: string
}

export interface ProfileCompletion {
  completionPercentage: number
  completedFields: string[]
  missingFields: string[]
  recommendations: Array<{
    field: string
    importance: string
    message: string
  }>
}

import { cachedGet, buildCacheKey, invalidateCache } from './cache'

const DASH_TTL = 30_000 // dashboards are heavy + change slowly between refreshes
const COMPLETION_TTL = 60_000

const artistDashboardService = {
  async getDashboardMetrics(): Promise<ArtistDashboardMetrics> {
    return cachedGet('artist:dashboard:metrics', async () => {
      const response = await apiClient.get('/artist/dashboard/metrics')
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  async getProfileViewsTrend(period: '7' | '30' | '90' = '30'): Promise<ProfileViewsTrend> {
    return cachedGet(buildCacheKey('artist:dashboard:profile-views-trend', { period }), async () => {
      const response = await apiClient.get('/artist/dashboard/profile-views-trend', {
        params: { period }
      })
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  async getApplicationStatus(): Promise<ApplicationStatus> {
    return cachedGet('artist:dashboard:application-status', async () => {
      const response = await apiClient.get('/artist/dashboard/application-status')
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  async getEarningsTrend(period: '7' | '30' | '90' = '30'): Promise<EarningsTrend> {
    return cachedGet(buildCacheKey('artist:dashboard:earnings-trend', { period }), async () => {
      const response = await apiClient.get('/artist/dashboard/earnings-trend', {
        params: { period }
      })
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  async getJobOpportunities(limit: number = 4): Promise<JobOpportunity[]> {
    return cachedGet(buildCacheKey('artist:dashboard:job-opportunities', { limit }), async () => {
      const response = await apiClient.get('/artist/dashboard/job-opportunities', {
        params: { limit }
      })
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  async getRecentActivity(limit: number = 4): Promise<RecentActivity[]> {
    return cachedGet(buildCacheKey('artist:dashboard:recent-activity', { limit }), async () => {
      const response = await apiClient.get('/artist/dashboard/recent-activity', {
        params: { limit }
      })
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  async getPortfolio(limit: number = 4, sortBy: 'recent' | 'popular' = 'recent'): Promise<PortfolioItem[]> {
    return cachedGet(buildCacheKey('artist:dashboard:portfolio', { limit, sortBy }), async () => {
      const response = await apiClient.get('/artist/dashboard/portfolio', {
        params: { limit, sortBy }
      })
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  async getProfileCompletion(): Promise<ProfileCompletion> {
    return cachedGet('artist:profile-completion', async () => {
      const response = await apiClient.get('/artist/profile/completion')
      return response.data.data
    }, { ttl: COMPLETION_TTL })
  },

  /** Call after any artist-side mutation that would change dashboard data. */
  invalidateDashboard(): void {
    invalidateCache('artist:dashboard:')
    invalidateCache('artist:profile-completion')
  },
}

export default artistDashboardService
