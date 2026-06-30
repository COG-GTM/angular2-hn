import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { useSettings } from './context/SettingsContext';
import './App.scss';

export default function App() {
  const { settings } = useSettings();
  const location = useLocation();

  // Google Analytics page tracking (ported from AppComponent NavigationEnd sub).
  useEffect(() => {
    if (typeof ga === 'function') {
      ga('set', 'page', location.pathname + location.search);
      ga('send', 'pageview');
    }
  }, [location]);

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
