import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type GoogleAnalytics = (...args: unknown[]) => void;

declare global {
    interface Window {
        ga?: GoogleAnalytics;
    }
}

/** Sends a pageview for one URL; no-op when `window.ga` (analytics.js, loaded in index.html) is missing. */
export function sendPageView(url: string): void {
    const ga = window.ga;
    if (typeof ga !== 'function') return;
    ga('set', 'page', url);
    ga('send', 'pageview');
}

/**
 * Port of Angular `AppComponent`'s `NavigationEnd` → `ga('set', 'page', urlAfterRedirects)` + pageview.
 * Mount it inside the layout route (not above the `/` redirect) so `/` only reports `/news/1`.
 */
export function usePageViews(): void {
    const { pathname, search, hash } = useLocation();
    useEffect(() => {
        sendPageView(`${pathname}${search}${hash}`);
    }, [pathname, search, hash]);
}
