import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import Loader from './components/Loader';
import { useSettings } from './context/SettingsContext';
import Feed from './features/feed/Feed';
import { trackPageview } from './ga';
import './styles/app.scss';

const ItemDetails = lazy(() => import('./features/item-details/ItemDetails'));
const User = lazy(() => import('./features/user/User'));

export default function App() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location]);

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
