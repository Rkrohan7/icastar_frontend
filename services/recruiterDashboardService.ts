import apiClient from './apiClient'

// Types for API responses
export interface DashboardMetrics {
  activeJobs: {
    value: number
    trend: number
    label: string
  }
  applications: {
    value: number
    trend: number
    label: string
  }
  interviews: {
    value: number
    trend: number
    label: string
  }
  offers: {
    value: number
    trend: number
    label: string
  }
  hires: {
    value: number
    trend: number
    label: string
  }
  rejections: {
    value: number
    trend: number
    label: string
  }
}

export interface LatestApplicant {
  id: number
  name: string
  avatar: string
  job: string
  skills: string
  status: string
  appliedAt: string
  email: string
}

export interface ApplicationsTrend {
  months: string[]
  applications: number[]
  interviews: number[]
  hires: number[]
}

export interface ApplicationStatus {
  labels: string[]
  data: number[]
  percentages: number[]
  total: number
}

export interface InterviewOutcomes {
  labels: string[]
  data: number[]
}

import { cachedGet, buildCacheKey, invalidateCache } from './cache'

const DASH_TTL = 30_000

const recruiterDashboardService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return cachedGet('recruiter:dashboard:metrics', async () => {
      const response = await apiClient.get('/recruiter/dashboard/metrics')
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  async getLatestApplicants(limit: number = 10): Promise<LatestApplicant[]> {
    return cachedGet(buildCacheKey('recruiter:dashboard:latest-applicants', { limit }), async () => {
      const response = await apiClient.get('/recruiter/dashboard/latest-applicants', {
        params: { limit }
      })
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  async getApplicationsTrend(): Promise<ApplicationsTrend> {
    return cachedGet('recruiter:dashboard:applications-trend', async () => {
      const response = await apiClient.get('/recruiter/dashboard/applications-trend')
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  async getApplicationStatus(): Promise<ApplicationStatus> {
    return cachedGet('recruiter:dashboard:application-status', async () => {
      const response = await apiClient.get('/recruiter/dashboard/application-status')
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  async getInterviewOutcomes(): Promise<InterviewOutcomes> {
    return cachedGet('recruiter:dashboard:interview-outcomes', async () => {
      const response = await apiClient.get('/recruiter/dashboard/interview-outcomes')
      return response.data.data
    }, { ttl: DASH_TTL })
  },

  invalidateDashboard(): void {
    invalidateCache('recruiter:dashboard:')
  },
}

export default recruiterDashboardService
