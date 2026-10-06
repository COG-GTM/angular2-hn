import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

/** Reports SPA navigations to Google Analytics (if loaded), mirroring Angular's NavigationEnd handler. */
export function usePageViews() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // `/` immediately redirects; Angular only reported `urlAfterRedirects`.
        if (pathname === '/' || !window.ga) return;
        window.ga('set', 'page', pathname + search);
        window.ga('send', 'pageview');
    }, [pathname, search]);
}
