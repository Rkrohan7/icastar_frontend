import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

type PageUpdater = number | ((prev: number) => number)

/**
 * URL-persisted page state. Survives refresh and back/forward navigation.
 *
 * Accepts both a plain number and a functional updater, matching React's
 * useState API: setPage(3) or setPage(p => p + 1).
 *
 * @param paramName URL query param name (default "page")
 * @param defaultPage Page value when the param is absent (use 0 for 0-indexed APIs, 1 for 1-indexed)
 */
export function usePageParam(
  paramName: string = 'page',
  defaultPage: number = 1,
): [number, (next: PageUpdater) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get(paramName)
  const parsed = raw === null ? defaultPage : parseInt(raw, 10)
  const page = Number.isFinite(parsed) ? parsed : defaultPage

  const setPage = useCallback(
    (next: PageUpdater) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          const current = (() => {
            const r = params.get(paramName)
            if (r === null) return defaultPage
            const p = parseInt(r, 10)
            return Number.isFinite(p) ? p : defaultPage
          })()
          const resolved = typeof next === 'function' ? next(current) : next
          if (resolved === defaultPage) {
            params.delete(paramName)
          } else {
            params.set(paramName, String(resolved))
          }
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams, paramName, defaultPage],
  )

  return [page, setPage]
}

export default usePageParam
