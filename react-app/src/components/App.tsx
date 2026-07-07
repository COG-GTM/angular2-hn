import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import Header from './Header';
import Footer from './Footer';
import './App.scss';

export default function App() {
  const { settings } = useSettings();
  const location = useLocation();

  // Replicates app.component.ts firing a Google Analytics pageview on each
  // navigation. Guarded so it is a safe no-op unless a `ga` snippet is present.
  useEffect(() => {
    if (typeof window.ga === 'function') {
      window.ga('set', 'page', location.pathname);
      window.ga('send', 'pageview');
    }
  }, [location.pathname]);

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}
