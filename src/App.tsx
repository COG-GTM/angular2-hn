import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Loader } from './components/Loader/Loader';
import { FeedPage } from './pages/FeedPage/FeedPage';

const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage/ItemDetailsPage'));
const UserPage = lazy(() => import('./pages/UserPage/UserPage'));

declare function ga(...args: string[]): void;

function AppContent() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (typeof ga === 'function') {
      ga('set', 'page', location.pathname);
      ga('send', 'pageview');
    }
  }, [location]);

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <div id="content">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/:feedType/:page" element={<FeedPage />} />
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/user/:id" element={<UserPage />} />
          </Routes>
        </Suspense>
        </div>
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
