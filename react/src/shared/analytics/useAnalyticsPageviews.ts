import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

/**
 * Sends a Google Analytics pageview whenever navigation settles, mirroring the Angular
 * shell's `NavigationEnd` subscription. `urlAfterRedirects` is the post-redirect URL,
 * which is what `useLocation` already reports.
 */
export function useAnalyticsPageviews(): void {
    const location = useLocation();
    const page = location.pathname + location.search;

    useEffect(() => {
        if (typeof window.ga !== 'function') {
            return;
        }

        window.ga('set', 'page', page);
        window.ga('send', 'pageview');
    }, [page]);
}
