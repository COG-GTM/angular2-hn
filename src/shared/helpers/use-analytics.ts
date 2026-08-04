import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

/**
 * Sends a Google Analytics pageview on every location change.
 *
 * The pageview is deferred to the next macrotask so that a location which immediately redirects
 * (the `''` -> `/news/1` index redirect) is never reported: its cleanup cancels the pending
 * pageview and only the resolved location is sent, matching the Angular router's `NavigationEnd`
 * with `urlAfterRedirects`.
 */
export function usePageviewTracking(): void {
    const { pathname, search } = useLocation();

    useEffect(() => {
        const page = pathname + search;
        const timer = window.setTimeout(() => {
            if (typeof window.ga !== 'function') {
                return;
            }

            window.ga('set', 'page', page);
            window.ga('send', 'pageview');
        });

        return () => window.clearTimeout(timer);
    }, [pathname, search]);
}
