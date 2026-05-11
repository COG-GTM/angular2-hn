import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { trackPageView } from './utils/analytics';
import './App.scss';

function ThemedShell() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

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

export function App() {
  return (
    <SettingsProvider>
      <ThemedShell />
    </SettingsProvider>
  );
}

export default App;
