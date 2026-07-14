import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const { theme } = useSettings();
  const location = useLocation();

  // Reproduce Google Analytics pageview tracking on navigation (app.component.ts).
  useEffect(() => {
    if (typeof ga !== 'undefined') {
      const url = location.pathname + location.search;
      ga('set', 'page', url);
      ga('send', 'pageview');
    }
  }, [location.pathname, location.search]);

  return (
    <div className={theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}
