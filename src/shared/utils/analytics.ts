import { useEffect } from 'react';
import { useLocation } from 'react-router';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

/** Sends a Google Analytics pageview on every route change (was a Router NavigationEnd subscription). */
export function usePageViewTracking(): void {
    const { pathname, search } = useLocation();
    useEffect(() => {
        if (typeof window.ga === 'function') {
            window.ga('set', 'page', pathname + search);
            window.ga('send', 'pageview');
        }
    }, [pathname, search]);
}
