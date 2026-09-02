import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        ga?: (...args: string[]) => void;
    }
}

export function usePageviewTracking(): void {
    const { pathname } = useLocation();

    useEffect(() => {
        if (window.ga) {
            window.ga('set', 'page', pathname);
            window.ga('send', 'pageview');
        }
    }, [pathname]);
}
