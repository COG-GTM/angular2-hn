import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        if (typeof ga !== 'undefined') {
            ga('set', 'page', location.pathname);
            ga('send', 'pageview');
        }
    }, [location]);
}
