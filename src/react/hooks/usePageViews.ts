import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageViews(): void {
    const { pathname } = useLocation();

    useEffect(() => {
        if (typeof window === 'undefined' || typeof (window as any).ga !== 'function') {
            return;
        }

        (window as any).ga('set', 'page', pathname);
        (window as any).ga('send', 'pageview');
    }, [pathname]);
}
