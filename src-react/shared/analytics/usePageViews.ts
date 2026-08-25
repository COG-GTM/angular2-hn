import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type GoogleAnalytics = (...args: unknown[]) => void;

declare global {
    interface Window {
        ga?: GoogleAnalytics;
    }
}

export function usePageViews() {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/') {
            return;
        }

        const page = `${location.pathname}${location.search}`;
        window.ga?.('set', 'page', page);
        window.ga?.('send', 'pageview');
    }, [location.pathname, location.search]);
}
