import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import Header from './components/core/Header';
import Footer from './components/core/Footer';
import Loader from './components/shared/Loader';
import Feed from './views/feed/Feed';
import './App.scss';

const ItemDetails = lazy(() => import('./views/item-details/ItemDetails'));
const User = lazy(() => import('./views/user/User'));

function Analytics() {
  const location = useLocation();
  useEffect(() => {
    window.ga?.('set', 'page', location.pathname + location.search);
    window.ga?.('send', 'pageview');
  }, [location]);
  return null;
}

export default function App() {
  const { settings } = useSettings();
  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Analytics />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/news/:page" element={<Feed feedType="news" />} />
          <Route path="/newest/:page" element={<Feed feedType="newest" />} />
          <Route path="/show/:page" element={<Feed feedType="show" />} />
          <Route path="/ask/:page" element={<Feed feedType="ask" />} />
          <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
          <Route path="/item/:id" element={<Suspense fallback={<Loader />}><ItemDetails /></Suspense>} />
          <Route path="/user/:id" element={<Suspense fallback={<Loader />}><User /></Suspense>} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
