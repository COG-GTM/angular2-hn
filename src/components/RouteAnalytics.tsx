import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

export function RouteAnalytics() {
  const location = useLocation();
  const trackedLocation = useRef<typeof location>();
  useEffect(() => {
    const ga = Reflect.get(window, 'ga');
    if (typeof ga !== 'function' || trackedLocation.current === location) return;
    ga('set', 'page', location.pathname + location.search);
    ga('send', 'pageview');
    trackedLocation.current = location;
  }, [location]);
  return null;
}
