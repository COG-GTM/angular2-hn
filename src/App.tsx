import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Loader } from './components/Loader';
import { FeedPage } from './pages/FeedPage';
import './App.scss';

const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

export function App() {
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
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/news/:page" element={<FeedPage feedType="news" />} />
            <Route path="/newest/:page" element={<FeedPage feedType="newest" />} />
            <Route path="/show/:page" element={<FeedPage feedType="show" />} />
            <Route path="/ask/:page" element={<FeedPage feedType="ask" />} />
            <Route path="/jobs/:page" element={<FeedPage feedType="jobs" />} />
            <Route path="/item/:id" element={<ItemDetailPage />} />
            <Route path="/user/:id" element={<UserPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}
