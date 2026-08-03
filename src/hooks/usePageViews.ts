import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

/** Sends a Google Analytics pageview per navigation, as NavigationEnd did in Angular. */
export function usePageViews(): void {
    const { pathname, search } = useLocation();

    useEffect(() => {
        if (typeof window.ga !== 'function') {
            return;
        }

        window.ga('set', 'page', `${pathname}${search}`);
        window.ga('send', 'pageview');
    }, [pathname, search]);
}
