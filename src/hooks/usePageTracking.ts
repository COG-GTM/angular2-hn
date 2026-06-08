import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare function ga(...args: unknown[]): void;

export function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);
}
