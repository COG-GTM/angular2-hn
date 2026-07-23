import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a Google Analytics pageview on every route change, mirroring the
 * Angular `AppComponent` subscription to `NavigationEnd`.
 */
export function usePageViews(): void {
  const location = useLocation();

  useEffect(() => {
    const url = `${location.pathname}${location.search}`;
    if (typeof window.ga === 'function') {
      window.ga('set', 'page', url);
      window.ga('send', 'pageview');
    }
  }, [location]);
}
