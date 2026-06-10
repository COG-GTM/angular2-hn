import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';
import FeedPage from './pages/FeedPage';
import './App.scss';

const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

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
  }, [location]);
}

function AppContent() {
  const { settings } = useSettings();
  usePageViews();

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
            <Route path="/item/:id" element={<ItemDetailsPage />} />
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
        <AppContent />
      </SettingsProvider>
    </BrowserRouter>
  );
}
