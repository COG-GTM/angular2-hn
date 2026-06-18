import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Feed from './pages/Feed';
import './styles/global.scss';
import './styles/App.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

declare function ga(...args: unknown[]): void;

function GATracker() {
  const location = useLocation();
  useEffect(() => {
    if (typeof ga === 'function') {
      ga('set', 'page', location.pathname + location.search);
      ga('send', 'pageview');
    }
  }, [location]);
  return null;
}

function AppShell() {
  const { settings } = useSettings();

  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <GATracker />
        <Routes>
          <Route element={<AppShell />}>
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
          </Route>
        </Routes>
      </SettingsProvider>
    </BrowserRouter>
  );
}
