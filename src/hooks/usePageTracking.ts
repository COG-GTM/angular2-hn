import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void
  }
}

export function usePageTracking() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.ga?.('set', 'page', pathname + search)
    window.ga?.('send', 'pageview')
  }, [pathname, search])
}
