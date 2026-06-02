import { useState, useEffect, useCallback, useRef } from 'react'
import notificationsService from '../services/notificationsService'

/**
 * Custom hook for managing notifications with automatic polling.
 *
 * Defaults:
 *  - pollingInterval: 5 minutes (300_000ms). Notifications are rarely time-critical;
 *    older default of 30s caused ~2880 calls/user/day. Raise here, not at call sites.
 *  - enabled: true
 *
 * Behaviour:
 *  - Pauses polling when the tab is hidden (Page Visibility API). Most "extra"
 *    AWS load came from background tabs polling forever.
 *  - On tab focus, does ONE fetch to catch up, then resumes interval.
 *  - Reuses an in-flight request so rapid re-renders don't fan out duplicates.
 */
export const useNotifications = (pollingInterval: number = 300_000, enabled: boolean = true) => {
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const inflightRef = useRef<Promise<number> | null>(null)

  const fetchUnreadCount = useCallback(async () => {
    if (inflightRef.current) return inflightRef.current
    const promise = notificationsService
      .getUnreadCount()
      .then((count) => {
        setUnreadCount(count)
        return count
      })
      .catch((error) => {
        console.error('Failed to fetch unread count:', error)
        return 0
      })
      .finally(() => {
        inflightRef.current = null
      })
    inflightRef.current = promise
    return promise
  }, [])

  // Initial fetch + interval polling, paused when tab hidden
  useEffect(() => {
    if (!enabled) return

    let intervalId: ReturnType<typeof setInterval> | null = null

    const start = () => {
      if (intervalId !== null) return
      if (pollingInterval > 0) {
        intervalId = setInterval(fetchUnreadCount, pollingInterval)
      }
    }
    const stop = () => {
      if (intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    // Initial fetch only if visible — if user just opened a background tab,
    // skip until they actually focus it.
    if (document.visibilityState !== 'hidden') {
      fetchUnreadCount()
      start()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stop()
      } else {
        fetchUnreadCount()
        start()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [enabled, pollingInterval, fetchUnreadCount])

  const refreshUnreadCount = useCallback(() => {
    return fetchUnreadCount()
  }, [fetchUnreadCount])

  return {
    unreadCount,
    setUnreadCount,
    refreshUnreadCount,
    isLoading,
  }
}
