import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        const page = `${location.pathname}${location.search}${location.hash}`;
        window.ga?.('set', 'page', page);
        window.ga?.('send', 'pageview');
    }, [location]);
}
