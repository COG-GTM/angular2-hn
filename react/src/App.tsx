import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AppRoutes } from './router';

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.ga !== 'function') {
      return;
    }
    const path = location.pathname + location.search;
    window.ga('set', 'page', path);
    window.ga('send', 'pageview');
  }, [location.pathname, location.search]);
}

function Shell() {
  const { settings } = useSettings();
  usePageTracking();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <AppRoutes />
        <Footer />
      </div>
    </div>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <Shell />
    </SettingsProvider>
  );
}
