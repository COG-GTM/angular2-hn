import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Loader } from './components/Loader/Loader';
import { useSettings } from './context/settings';

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

function usePageViewTracking() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.ga?.('set', 'page', pathname + search);
    window.ga?.('send', 'pageview');
  }, [pathname, search]);
}

export function App() {
  const { settings } = useSettings();
  usePageViewTracking();

  return (
    <div className={`theme-root ${settings.theme}`} data-testid="theme-root">
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}
