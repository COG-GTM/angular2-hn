import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Feed from './components/Feed';
import Loader from './components/Loader';
import './styles/App.scss';

const ItemDetails = React.lazy(() => import('./components/ItemDetails'));
const UserProfile = React.lazy(() => import('./components/UserProfile'));

declare function ga(...args: unknown[]): void;

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof ga === 'function') {
      ga('set', 'page', location.pathname + location.search);
      ga('send', 'pageview');
    }
  }, [location]);

  return null;
}

function AppLayout() {
  const { settings } = useSettings();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/:feedType/:page" element={<Feed />} />
          <Route
            path="/item/:id"
            element={
              <Suspense fallback={<Loader />}>
                <ItemDetails />
              </Suspense>
            }
          />
          <Route
            path="/user/:id"
            element={
              <Suspense fallback={<Loader />}>
                <UserProfile />
              </Suspense>
            }
          />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AnalyticsTracker />
        <AppLayout />
      </SettingsProvider>
    </BrowserRouter>
  );
}
