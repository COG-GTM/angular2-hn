import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

// `/` only ever renders a redirect to `/news/1`, so it is never a destination.
const REDIRECT_ONLY_PATHS = ['/'];

/**
 * Fires a Google Analytics pageview on every route change, mirroring the
 * Angular `AppComponent` subscription to `NavigationEnd` and its use of
 * `urlAfterRedirects` (redirect sources are not reported).
 */
export function usePageViews(): void {
  const location = useLocation();

  useEffect(() => {
    if (REDIRECT_ONLY_PATHS.includes(location.pathname)) {
      return;
    }

    const url = `${location.pathname}${location.search}`;
    if (typeof window.ga === 'function') {
      window.ga('set', 'page', url);
      window.ga('send', 'pageview');
    }
  }, [location]);
}
