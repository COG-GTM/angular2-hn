import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Footer from './core/Footer/Footer';
import Header from './core/Header/Header';
import Feed from './feeds/Feed/Feed';
import Loader from './shared/components/Loader/Loader';
import { useSettings } from './context/SettingsContext';
import './App.scss';

const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const User = lazy(() => import('./user/User'));

declare const ga: ((...args: unknown[]) => void) | undefined;

function useGoogleAnalyticsPageViews() {
  const location = useLocation();

  useEffect(() => {
    if (typeof ga === 'function') {
      ga('set', 'page', location.pathname + location.search);
      ga('send', 'pageview');
    }
  }, [location]);
}

export default function App() {
  const { settings } = useSettings();
  useGoogleAnalyticsPageViews();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/user/:id" element={<User />} />
            <Route path="/:feedType/:page" element={<Feed />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}
