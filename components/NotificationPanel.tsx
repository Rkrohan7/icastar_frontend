import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import notificationsService, { Notification } from '../services/notificationsService'
import { toast } from 'react-toastify'
import { dateLocale } from '@/i18n'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  unreadCount: number
  onUnreadCountChange: (count: number) => void
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  unreadCount,
  onUnreadCountChange
}) => {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, currentPage])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationsService.getNotifications(currentPage, 10)
      setNotifications(data.notifications)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return

    try {
      await notificationsService.markAsRead(notification.id)

      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
      )

      // Update unread count
      const newCount = Math.max(0, unreadCount - 1)
      onUnreadCountChange(newCount)

      // Navigate if there's an action URL
      if (notification.actionUrl) {
        navigate(notification.actionUrl)
        onClose()
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast.error('Failed to update notification')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))

      // Reset unread count
      onUnreadCountChange(0)

      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('Failed to update notifications')
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString(dateLocale('en-US'), { month: 'short', day: 'numeric' })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPLICATION_RECEIVED':
      case 'APPLICATION_SUBMITTED':
        return (
          <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center'>
            <svg className='h-5 w-5 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
          </div>
        )
      case 'INTERVIEW_SCHEDULED':
        return (
          <div className='h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center'>
            <svg className='h-5 w-5 text-yellow-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
            </svg>
          </div>
        )
      case 'JOB_OFFER':
      case 'APPLICATION_ACCEPTED':
        return (
          <div className='h-10 w-10 rounded-full bg-green-100 flex items-center justify-center'>
            <svg className='h-5 w-5 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
        )
      case 'APPLICATION_REJECTED':
        return (
          <div className='h-10 w-10 rounded-full bg-red-100 flex items-center justify-center'>
            <svg className='h-5 w-5 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
        )
      default:
        return (
          <div className='h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center'>
            <svg className='h-5 w-5 text-gray-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
            </svg>
          </div>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className='absolute right-0 top-full mt-2 w-96 max-h-[32rem] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50'>
      {/* Header */}
      <div className='px-4 py-3 border-b border-gray-200 bg-gray-50'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-semibold text-gray-900'>
            Notifications
            {unreadCount > 0 && (
              <span className='ml-2 text-xs text-gray-500'>
                ({unreadCount} unread)
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className='text-xs font-medium text-amber-600 hover:text-amber-700'>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className='overflow-y-auto max-h-96'>
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600'></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className='text-center py-12 px-4'>
            <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
            </svg>
            <p className='mt-2 text-sm text-gray-500'>No notifications yet</p>
          </div>
        ) : (
          <div className='divide-y divide-gray-100'>
            {notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => handleMarkAsRead(notification)}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-amber-50' : ''
                }`}>
                <div className='flex gap-3'>
                  {getNotificationIcon(notification.type)}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2'>
                      <p className='text-sm font-medium text-gray-900'>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className='flex-shrink-0 h-2 w-2 bg-amber-600 rounded-full mt-1'></span>
                      )}
                    </div>
                    <p className='mt-1 text-sm text-gray-600 line-clamp-2'>
                      {notification.message}
                    </p>
                    <p className='mt-1 text-xs text-gray-500'>
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with pagination */}
      {totalPages > 1 && (
        <div className='px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between'>
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className='text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'>
            Previous
          </button>
          <span className='text-xs text-gray-500'>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            className='text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'>
            Next
          </button>
        </div>
      )}
    </div>
  )
}
