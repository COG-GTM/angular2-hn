import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import Header from './Header';
import Footer from './Footer';
import './App.scss';

const AppInner: React.FC = () => {
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
        <div id="content">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  );
};

export default App;
