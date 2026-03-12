import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import styles from './components/App.module.scss';

declare function ga(...args: unknown[]): void;

function AppLayout() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (typeof ga !== 'undefined') {
      ga('set', 'page', location.pathname);
      ga('send', 'pageview');
    }
  }, [location]);

  return (
    <div className={settings.theme}>
      <div className={`body-cover ${styles.bodyCover}`} />
      <div className={`wrapper ${styles.wrapper}`}>
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppLayout />
    </SettingsProvider>
  );
}
