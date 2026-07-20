import apiClient from './apiClient'
import { PaginatedResult } from './types'
import { cachedGet, invalidateCache } from './cache'

// My-applications list is re-fetched by the header badge and the page itself.
// Cache 60s; applying to a job invalidates it so the new entry shows up.
const MY_APPS_TTL = 60_000

export interface ApplicationRequest {
  coverLetter: string
  jobId: number
  expectedSalary: number
}

export interface ApplicationResponse {
  id?: number
  status?: string
  [key: string]: any
}

export interface ListMyApplicationsParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  status?: string
}

export interface MyApplication {
  id: number
  jobId?: number
  jobTitle: string
  company?: string
  appliedAt: string
  status: string
  logo?: string
}

// Normalize common paginated response shapes
const normalizePaginated = <T = any>(data: any): PaginatedResult<T> => {
  if (data && Array.isArray(data.content) && typeof data.totalElements === 'number') {
    return {
      items: data.content,
      total: data.totalElements,
      page: typeof data.number === 'number' ? data.number : 0,
      pageSize: typeof data.size === 'number' ? data.size : data.content.length,
    }
  }

  if (data && Array.isArray(data.items) && typeof data.total === 'number') {
    return {
      items: data.items,
      total: data.total,
      page: typeof data.page === 'number' ? data.page : 0,
      pageSize: typeof data.pageSize === 'number' ? data.pageSize : data.items.length,
    }
  }

  if (data && data.data) {
    return normalizePaginated<T>(data.data)
  }

  const items = Array.isArray(data) ? data : []
  return {
    items: items as unknown as T[],
    total: Array.isArray(items) ? items.length : 0,
    page: 0,
    pageSize: Array.isArray(items) ? items.length : 0,
  }
}

export const applicationsService = {
  async createApplication(req: ApplicationRequest): Promise<ApplicationResponse> {
    const res = await apiClient.post('/applications', req)
    invalidateCache('artist:my-applications')
    return res.data
  },

  async listMyApplications(_params: ListMyApplicationsParams = {}): Promise<PaginatedResult<MyApplication>> {
    return cachedGet('artist:my-applications', async () => {
      // Call API without any query parameters
      const res = await apiClient.get('/my-applications')

      const normalized = normalizePaginated<any>(res.data)

      const items: MyApplication[] = (normalized.items || []).map((it: any) => {
        const appliedAt = it.appliedAt || it.applied_date || it.appliedDate || it.createdAt || ''
        return {
          id: Number(it.id ?? it.applicationId ?? Math.random() * 100000),
          jobId: it.jobId ?? it.job_id,
          jobTitle: it.jobTitle ?? it.title ?? 'Untitled Role',
          company: it.company ?? it.companyName ?? it.orgName,
          appliedAt,
          status: String(it.status ?? it.applicationStatus ?? 'Applied').toUpperCase(),
          logo: it.companyLogo ?? it.logoUrl ?? undefined,
        }
      })

      return {
        items,
        total: normalized.total,
        page: normalized.page,
        pageSize: normalized.pageSize,
      }
    }, { ttl: MY_APPS_TTL })
  },
}

export default applicationsService