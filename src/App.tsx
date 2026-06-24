import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import './App.scss';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Feed from './components/Feed/Feed';
import Loader from './components/Loader/Loader';

const ItemDetails = React.lazy(() => import('./components/ItemDetails/ItemDetails'));
const User = React.lazy(() => import('./components/User/User'));

declare function ga(...args: unknown[]): void;

export default function App() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (typeof ga === 'function') {
      ga('set', 'page', location.pathname + location.search);
      ga('send', 'pageview');
    }
  }, [location]);

  return (
    <div className={settings.theme}>
      <div className="body-cover" />
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
