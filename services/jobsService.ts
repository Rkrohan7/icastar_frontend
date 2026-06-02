import api from './apiClient'
import { PaginatedResult } from './types'
import { cachedGet, buildCacheKey } from './cache'

export type JobType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'FREELANCE'
  | 'INTERNSHIP'
  | 'PROJECT_BASED'

export type ExperienceLevel =
  | 'ENTRY_LEVEL'
  | 'MID_LEVEL'
  | 'SENIOR_LEVEL'
  | 'EXPERT_LEVEL'

export interface ListJobsParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  search?: string
  jobType?: JobType
  experienceLevel?: ExperienceLevel
  status?: string
}

export interface Job {
  id: number
  title: string
  company?: string
  location?: string
  jobType?: string
  experienceLevel?: string
  pay?: string
  createdAt?: string
  [key: string]: any
}

const normalizeListResponse = (data: any): Job[] => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.content)) return data.content
  if (Array.isArray(data.results)) return data.results
  if (Array.isArray(data.data)) return data.data
  return []
}

const normalizePaginated = (data: any): PaginatedResult<Job> => {
  // Spring-style page
  if (data && Array.isArray(data.content) && typeof data.totalElements === 'number') {
    return {
      items: data.content,
      total: data.totalElements,
      page: typeof data.number === 'number' ? data.number : 0,
      pageSize: typeof data.size === 'number' ? data.size : data.content.length,
    }
  }

  // Common REST shapes
  if (data && Array.isArray(data.items) && typeof data.total === 'number') {
    return {
      items: data.items,
      total: data.total,
      page: typeof data.page === 'number' ? data.page : 0,
      pageSize: typeof data.pageSize === 'number' ? data.pageSize : data.items.length,
    }
  }

  // Nested under data
  if (data && data.data) {
    return normalizePaginated(data.data)
  }

  const items = normalizeListResponse(data)
  return {
    items,
    total: Array.isArray(items) ? items.length : 0,
    page: 0,
    pageSize: Array.isArray(items) ? items.length : 0,
  }
}

export const jobsService = {
  async listJobs(params: ListJobsParams = {}): Promise<PaginatedResult<Job>> {
    const defaultParams: ListJobsParams = {
      page: 0,
      size: 20,
      sortBy: 'createdAt',
      sortDir: 'desc',
    }
    const merged = { ...defaultParams, ...params }
    return cachedGet(buildCacheKey('jobs:list', merged as Record<string, unknown>), async () => {
      const response = await api.get('/jobs', { params: merged })
      return normalizePaginated(response.data)
    }, { ttl: 15_000 })
  },

  async getJob(id: number | string): Promise<Job> {
    return cachedGet(`jobs:${id}`, async () => {
      const response = await api.get(`/jobs/${id}`)
      return response.data as Job
    }, { ttl: 60_000 })
  },
}

export default jobsService