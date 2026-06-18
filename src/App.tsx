import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './shared/context/SettingsContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppRoutes from './routes';

declare global {
  interface Window { ga?: (...args: unknown[]) => void; }
}

function AppShell() {
  const { settings } = useSettings();
  const location = useLocation();
  useEffect(() => {
    if (typeof window.ga === 'function') {
      window.ga('set', 'page', location.pathname);
      window.ga('send', 'pageview');
    }
  }, [location]);
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

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppShell />
      </SettingsProvider>
    </BrowserRouter>
  );
}
