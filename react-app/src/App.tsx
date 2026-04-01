import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSettings } from './hooks/useSettings';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './styles/global.scss';
import './App.scss';

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

export default function App() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (window.ga) {
      window.ga('set', 'page', location.pathname);
      window.ga('send', 'pageview');
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
