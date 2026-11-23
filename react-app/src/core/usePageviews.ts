import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Same Google Analytics pageview the Angular app sent on every NavigationEnd. */
export function usePageviews() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === '/') return;
    window.ga?.('set', 'page', location.pathname + location.search);
    window.ga?.('send', 'pageview');
  }, [location.pathname, location.search]);
}
