import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Header } from './components/core/Header';
import { Footer } from './components/core/Footer';
import { Feed } from './components/feeds/Feed';
import { ItemDetails } from './components/item-details/ItemDetails';
import { User } from './components/user/User';

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

function usePageViews() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.ga === 'function') {
      window.ga('set', 'page', location.pathname);
      window.ga('send', 'pageview');
    }
  }, [location.pathname]);
}

export function App() {
  const { settings } = useSettings();
  usePageViews();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/news/:page" element={<Feed feedType="news" />} />
          <Route path="/newest/:page" element={<Feed feedType="newest" />} />
          <Route path="/show/:page" element={<Feed feedType="show" />} />
          <Route path="/ask/:page" element={<Feed feedType="ask" />} />
          <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/user/:id" element={<User />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
