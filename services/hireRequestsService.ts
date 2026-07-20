import apiClient from './apiClient'
import { cachedGet, buildCacheKey, invalidateCache } from './cache'
import {
  HireRequest,
  CreateHireRequestDto,
  UpdateHireRequestStatusDto,
  HireRequestFilters,
  PagedHireRequestsResult,
  PagedResponse,
  ApiResponse,
  HireRequestStats,
} from '../types'

// Cache reads for 60s; any create/status-change/withdraw/remind clears the
// whole `recruiter:hire-requests:` prefix so lists/stats reflect the change.
const HIRE_REQ_TTL = 60_000

/**
 * Get all hire requests for current recruiter with filters
 */
export const getHireRequests = async (
  filters: HireRequestFilters = {}
): Promise<PagedHireRequestsResult> => {
  const params = new URLSearchParams()

  if (filters.status) params.append('status', filters.status)
  if (filters.artistCategory) params.append('artistCategory', filters.artistCategory)
  if (filters.artistId) params.append('artistId', filters.artistId.toString())
  if (filters.jobId) params.append('jobId', filters.jobId.toString())
  if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)
  if (filters.page !== undefined) params.append('page', filters.page.toString())
  if (filters.size !== undefined) params.append('size', filters.size.toString())
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.sortDir) params.append('sortDir', filters.sortDir)

  return cachedGet(buildCacheKey('recruiter:hire-requests:list', { q: params.toString() }), async () => {
    const response = await apiClient.get<PagedResponse<HireRequest>>(
      `/recruiter/hire-requests?${params.toString()}`
    )

    // Map Spring Boot pagination format to our frontend format
    const pagedData = response.data
    return {
      items: pagedData.content,
      totalElements: pagedData.totalElements,
      totalPages: pagedData.totalPages,
      currentPage: pagedData.pageable.pageNumber,
      size: pagedData.pageable.pageSize,
    }
  }, { ttl: HIRE_REQ_TTL })
}

/**
 * Get single hire request by ID
 */
export const getHireRequestById = async (id: number): Promise<HireRequest> => {
  return cachedGet(`recruiter:hire-requests:detail:${id}`, async () => {
    const response = await apiClient.get<HireRequest>(`/recruiter/hire-requests/${id}`)
    return response.data
  }, { ttl: HIRE_REQ_TTL })
}

/**
 * Create new hire request (send to artist)
 */
export const createHireRequest = async (
  data: CreateHireRequestDto
): Promise<HireRequest> => {
  const response = await apiClient.post<ApiResponse<HireRequest>>(
    '/recruiter/hire-requests',
    data
  )

  // Extract data from wrapped response
  if (response.data.success && response.data.data) {
    invalidateCache('recruiter:hire-requests:')
    return response.data.data
  }

  throw new Error(response.data.error || 'Failed to create hire request')
}

/**
 * Update hire request status
 */
export const updateHireRequestStatus = async (
  id: number,
  data: UpdateHireRequestStatusDto
): Promise<HireRequest> => {
  const response = await apiClient.patch<ApiResponse<HireRequest>>(
    `/recruiter/hire-requests/${id}/status`,
    data
  )

  if (response.data.success && response.data.data) {
    invalidateCache('recruiter:hire-requests:')
    return response.data.data
  }

  throw new Error(response.data.error || 'Failed to update hire request status')
}

/**
 * Withdraw hire request
 */
export const withdrawHireRequest = async (id: number): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/recruiter/hire-requests/${id}`
  )

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to withdraw hire request')
  }
  invalidateCache('recruiter:hire-requests:')
}

/**
 * Send reminder email to artist
 */
export const sendReminderEmail = async (id: number): Promise<HireRequest> => {
  const response = await apiClient.post<ApiResponse<HireRequest>>(
    `/recruiter/hire-requests/${id}/remind`
  )

  if (response.data.success && response.data.data) {
    invalidateCache('recruiter:hire-requests:')
    return response.data.data
  }

  throw new Error(response.data.error || 'Failed to send reminder')
}

/**
 * Get hire request statistics
 */
export const getHireRequestStats = async (): Promise<HireRequestStats> => {
  return cachedGet('recruiter:hire-requests:stats', async () => {
    const response = await apiClient.get<HireRequestStats>(
      '/recruiter/hire-requests/stats'
    )
    return response.data
  }, { ttl: HIRE_REQ_TTL })
}

export default {
  getHireRequests,
  getHireRequestById,
  createHireRequest,
  updateHireRequestStatus,
  withdrawHireRequest,
  sendReminderEmail,
  getHireRequestStats,
}
