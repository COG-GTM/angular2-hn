import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

// Mirrors AppComponent's NavigationEnd hook: one GA pageview per route change.
export function usePageViews() {
    const { pathname, search } = useLocation();
    useEffect(() => {
        window.ga?.('set', 'page', pathname + search);
        window.ga?.('send', 'pageview');
    }, [pathname, search]);
}
