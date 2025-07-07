import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './components/shared/contexts/SettingsContext';
import Header from './components/core/header/Header';
import Footer from './components/core/footer/Footer';
import Settings from './components/core/settings/Settings';
import Feed from './components/feeds/feed/Feed';
import './App.css';

declare let ga: any;

const AppContent: React.FC = () => {
  const location = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    if (typeof ga !== 'undefined') {
      ga('set', 'page', location.pathname);
      ga('send', 'pageview');
    }
  }, [location]);

  return (
    <div className={`min-h-screen flex flex-col ${settings.theme}`}>
      <div className="body-cover"></div>
      <div className="wrapper flex-1">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/news/:page" element={<Feed />} />
            <Route path="/newest/:page" element={<Feed />} />
            <Route path="/show/:page" element={<Feed />} />
            <Route path="/ask/:page" element={<Feed />} />
            <Route path="/jobs/:page" element={<Feed />} />
          </Routes>
        </main>
        <Footer />
        <Settings />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  );
};

export default App;
