import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useSettings } from './context/useSettings';
import { Loader } from './components/shared/Loader';
import './styles/App.scss';

const Feed = lazy(() => import('./components/feeds/Feed'));
const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const UserProfile = lazy(() => import('./components/user/UserProfile'));

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    if (window.ga) {
      window.ga('set', 'page', location.pathname + location.search);
      window.ga('send', 'pageview');
    }
  }, [location]);
}

function Layout() {
  const { settings } = useSettings();
  usePageTracking();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        {/* Header placeholder - will be implemented in Child Session 1 */}
        <div id="header-placeholder"></div>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
        {/* Footer placeholder - will be implemented in Child Session 1 */}
        <div id="footer-placeholder"></div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/news/1" replace />} />
        <Route path="news/:page" element={<Feed feedType="news" />} />
        <Route path="newest/:page" element={<Feed feedType="newest" />} />
        <Route path="show/:page" element={<Feed feedType="show" />} />
        <Route path="ask/:page" element={<Feed feedType="ask" />} />
        <Route path="jobs/:page" element={<Feed feedType="jobs" />} />
        <Route path="item/:id" element={<ItemDetails />} />
        <Route path="user/:id" element={<UserProfile />} />
      </Route>
    </Routes>
  );
}

export default App;
