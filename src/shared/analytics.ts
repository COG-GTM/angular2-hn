import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type GoogleAnalytics = (...args: unknown[]) => void;

declare global {
    interface Window {
        ga?: GoogleAnalytics;
    }
}

export function usePageTracking() {
    const { pathname, search, hash } = useLocation();

    useEffect(() => {
        if (typeof window.ga !== 'function') {
            return;
        }
        window.ga('set', 'page', `${pathname}${search}${hash}`);
        window.ga('send', 'pageview');
    }, [pathname, search, hash]);
}
