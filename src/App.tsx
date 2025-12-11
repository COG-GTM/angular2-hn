import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context';
import { Header, Footer } from './components/core';
import { Loader } from './components/shared';
import { FeedPage } from './pages/FeedPage';
import './styles/global.scss';

const ItemDetailsPage = lazy(() =>
  import('./pages/ItemDetailsPage').then((module) => ({ default: module.ItemDetailsPage }))
);
const UserPage = lazy(() =>
  import('./pages/UserPage').then((module) => ({ default: module.UserPage }))
);

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'UA-77120078-2', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}

function ThemeHandler() {
  const { settings } = useSettings();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  return null;
}

function AppContent() {
  return (
    <BrowserRouter>
      <Analytics />
      <ThemeHandler />
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
          <Route path="*" element={<Navigate to="/news/1" replace />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
