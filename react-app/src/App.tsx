import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Feed } from './components/Feed';
import { Loader } from './components/Loader';
import { useSettings } from './context/SettingsContext';
import './App.scss';

declare global {
  // Google Analytics (loaded in index.html)
  function ga(...args: unknown[]): void;
}

// Preserve the Angular lazy-loaded Item and User modules.
const ItemDetails = lazy(() => import('./components/ItemDetails').then((m) => ({ default: m.ItemDetails })));
const User = lazy(() => import('./components/User').then((m) => ({ default: m.User })));

export function App() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (typeof ga === 'function') {
      ga('set', 'page', location.pathname + location.search);
      ga('send', 'pageview');
    }
  }, [location.pathname, location.search]);

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
            <Route path="/user/:id" element={<User />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}
