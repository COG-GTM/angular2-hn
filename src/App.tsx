import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/shared/Loader';
import FeedPage from './pages/FeedPage';

const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

declare function ga(...args: unknown[]): void;

function AppLayout() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (typeof ga === 'function') {
      ga('set', 'page', location.pathname + location.search);
      ga('send', 'pageview');
    }
  }, [location]);

  return (
    <div className={settings.theme}>
      <div className="body-cover" />
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

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppLayout />
      </SettingsProvider>
    </BrowserRouter>
  );
}
