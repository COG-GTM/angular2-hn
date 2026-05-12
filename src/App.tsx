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
import Feed from './pages/Feed';
import Loader from './components/Loader';
import './app.component.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const UserPage = lazy(() => import('./pages/User'));

declare global {
  interface Window {
    ga?: (...args: unknown[]) => void;
  }
}

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.ga?.('set', 'page', location.pathname);
    window.ga?.('send', 'pageview');
  }, [location]);
  return null;
}

function ThemedShell() {
  const { settings } = useSettings();
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
            <Route path="/user/:id" element={<UserPage />} />
            <Route path="*" element={<Navigate to="/news/1" replace />} />
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
        <PageViewTracker />
        <ThemedShell />
      </SettingsProvider>
    </BrowserRouter>
  );
}
