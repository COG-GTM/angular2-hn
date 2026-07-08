import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { useSettings } from './contexts/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Feed from './pages/Feed';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const UserPage = lazy(() => import('./pages/UserPage'));

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.ga === 'function') {
      window.ga('set', 'page', location.pathname + location.search);
      window.ga('send', 'pageview');
    }
  }, [location]);
}

export default function App() {
  const { settings } = useSettings();
  usePageTracking();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/news/:page" element={<Feed feedType="news" />} />
            <Route path="/newest/:page" element={<Feed feedType="newest" />} />
            <Route path="/show/:page" element={<Feed feedType="show" />} />
            <Route path="/ask/:page" element={<Feed feedType="ask" />} />
            <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/user/:id" element={<UserPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}
