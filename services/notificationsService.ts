import apiClient from './apiClient'
import { cachedGet, buildCacheKey, invalidateCache } from './cache'

export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  message: string
  actionUrl?: string
  metadata?: Record<string, any>
  isRead: boolean
  createdAt: string
}

export interface NotificationResponse {
  notifications: Notification[]
  totalElements: number
  totalPages: number
  currentPage: number
  hasUnread: boolean
}

export interface UnreadCountResponse {
  count: number
}

// Short TTL because notifications are time-sensitive, but long enough to
// dedupe the inevitable double-fetch when notification panel mounts.
const UNREAD_TTL = 10_000
const LIST_TTL = 15_000

const notificationsService = {
  async getNotifications(page: number = 0, size: number = 20): Promise<NotificationResponse> {
    return cachedGet(buildCacheKey('notif:list', { page, size }), async () => {
      const response = await apiClient.get('/notifications', { params: { page, size } })
      return response.data
    }, { ttl: LIST_TTL })
  },

  async getUnreadCount(): Promise<number> {
    return cachedGet('notif:unread-count', async () => {
      const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count')
      return response.data.count
    }, { ttl: UNREAD_TTL })
  },

  async markAsRead(notificationId: number): Promise<void> {
    await apiClient.put(`/notifications/${notificationId}/read`)
    invalidateCache('notif:')
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/mark-all-read')
    invalidateCache('notif:')
  },

  async deleteNotification(notificationId: number): Promise<void> {
    await apiClient.delete(`/notifications/${notificationId}`)
    invalidateCache('notif:')
  }
}

export default notificationsService
