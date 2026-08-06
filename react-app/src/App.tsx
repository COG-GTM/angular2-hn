import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import FeedPage from './pages/Feed/FeedPage';
import { useSettings } from './context/SettingsContext';
import type { FeedType } from './models';

const ItemDetailsPage = lazy(() => import('./pages/ItemDetails/ItemDetailsPage'));
const UserPage = lazy(() => import('./pages/User/UserPage'));

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

function usePageviewTracking() {
  const location = useLocation();

  useEffect(() => {
    if (window.ga) {
      window.ga('set', 'page', location.pathname + location.search);
      window.ga('send', 'pageview');
    }
  }, [location]);
}

const feedTypes: FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs'];

function AppShell() {
  const { settings } = useSettings();
  usePageviewTracking();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            {feedTypes.map((feedType) => (
              <Route key={feedType} path={`/${feedType}`}>
                <Route index element={<Navigate to={`/${feedType}/1`} replace />} />
                <Route path=":page" element={<FeedPage feedType={feedType} />} />
              </Route>
            ))}
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
      <AppShell />
    </BrowserRouter>
  );
}
