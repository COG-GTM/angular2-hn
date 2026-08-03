import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageViews() {
  const location = useLocation();

  useEffect(() => {
    // '/' only ever redirects, so it is never a page view.
    if (location.pathname === '/') {
      return;
    }

    const page = `${location.pathname}${location.search}${location.hash}`;
    window.ga?.('set', 'page', page);
    window.ga?.('send', 'pageview');
  }, [location]);
}
