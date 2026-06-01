import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void
    }
}

export function usePageTracking() {
    const location = useLocation()

    useEffect(() => {
        if (window.ga) {
            window.ga('set', 'page', location.pathname + location.search)
            window.ga('send', 'pageview')
        }
    }, [location])
}
