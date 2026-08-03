import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Sends a Google Analytics pageview whenever navigation settles, as the Angular app did on NavigationEnd. */
export function usePageViews(): void {
    const location = useLocation();

    useEffect(() => {
        const page = `${location.pathname}${location.search}${location.hash}`;
        window.ga?.('set', 'page', page);
        window.ga?.('send', 'pageview');
    }, [location.pathname, location.search, location.hash]);
}
