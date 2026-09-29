import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { Footer } from './core/footer/Footer';
import { Header } from './core/header/Header';
import { Feed } from './feeds/feed/Feed';
import { Loader } from './shared/components/loader/Loader';
import { FEEDS } from './shared/models/feed-type';
import { useSettings } from './shared/settings/settingsContext';
import './App.scss';

const ItemDetails = lazy(() => import('./item-details/ItemDetails').then((m) => ({ default: m.ItemDetails })));
const User = lazy(() => import('./user/User').then((m) => ({ default: m.User })));

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

function usePageTracking() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.ga?.('set', 'page', pathname + search);
    window.ga?.('send', 'pageview');
  }, [pathname, search]);
}

function Layout() {
  const { settings } = useSettings();
  usePageTracking();

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
        <Route index element={<Navigate to="/news/1" replace />} />
        {FEEDS.map((feed) => (
          <Route key={feed} path={`${feed}/:page?`} element={<Feed key={feed} feedType={feed} />} />
        ))}
        <Route path="item/:id" element={<ItemDetails />} />
        <Route path="user/:id" element={<User />} />
        <Route path="*" element={<Navigate to="/news/1" replace />} />
      </Route>
    </Routes>
  );
}
