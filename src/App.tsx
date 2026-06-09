import { Suspense, lazy, useEffect } from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { useSettings } from './contexts/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';
import FeedPage from './pages/FeedPage';
import './App.scss';

// Lazy load to replicate Angular's loadChildren lazy loading.
const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

function Layout() {
  const { settings } = useSettings();
  const location = useLocation();

  // Port Google Analytics pageview tracking on route changes.
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
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/news/1" replace />} />
        <Route path="/news/:page" element={<FeedPage feedType="news" />} />
        <Route path="/newest/:page" element={<FeedPage feedType="newest" />} />
        <Route path="/show/:page" element={<FeedPage feedType="show" />} />
        <Route path="/ask/:page" element={<FeedPage feedType="ask" />} />
        <Route path="/jobs/:page" element={<FeedPage feedType="jobs" />} />
        <Route path="/item/:id" element={<ItemDetailsPage />} />
        <Route path="/user/:id" element={<UserPage />} />
      </Route>
    </Routes>
  );
}
