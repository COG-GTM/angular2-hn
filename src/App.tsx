import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSettings } from './hooks/useSettings';
import { Header } from './components/core/Header';
import { Footer } from './components/core/Footer';
import { FeedPage } from './components/feeds/FeedPage';
import { Loader } from './components/shared/Loader';

const ItemDetailsPage = lazy(() =>
  import('./components/item-details/ItemDetailsPage').then((m) => ({ default: m.ItemDetailsPage }))
);
const UserPage = lazy(() =>
  import('./components/user/UserPage').then((m) => ({ default: m.UserPage }))
);

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

function Layout() {
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
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/news/1" replace />} />
        <Route path="/news/:page" element={<FeedPage type="news" />} />
        <Route path="/newest/:page" element={<FeedPage type="newest" />} />
        <Route path="/show/:page" element={<FeedPage type="show" />} />
        <Route path="/ask/:page" element={<FeedPage type="ask" />} />
        <Route path="/jobs/:page" element={<FeedPage type="jobs" />} />
        <Route path="/item/:id" element={<ItemDetailsPage />} />
        <Route path="/user/:id" element={<UserPage />} />
      </Route>
    </Routes>
  );
}
