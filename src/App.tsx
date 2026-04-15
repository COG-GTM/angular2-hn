import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Settings from './components/layout/Settings';
import './App.scss';

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

export default function App() {
  const { settings } = useSettings();
  const location = useLocation();

  // Google Analytics pageview tracking
  useEffect(() => {
    if (window.ga) {
      window.ga('set', 'page', location.pathname);
      window.ga('send', 'pageview');
    }
  }, [location]);

  return (
    <div className={settings.theme}>
      <div className="body-cover" />
      <div className="wrapper">
        <Header />
        <Outlet />
        <Footer />
      </div>
      <Settings />
    </div>
  );
}
