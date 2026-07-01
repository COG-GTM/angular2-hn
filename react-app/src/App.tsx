import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import { useSettings } from './context/SettingsContext';
import './App.scss';

export default function App() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (typeof ga === 'function') {
      ga('set', 'page', location.pathname);
      ga('send', 'pageview');
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
