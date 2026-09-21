import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function usePageViews() {
    const location = useLocation();

    useEffect(() => {
        if (typeof window.ga !== 'function') {
            return;
        }
        window.ga('set', 'page', location.pathname + location.search);
        window.ga('send', 'pageview');
    }, [location]);
}
