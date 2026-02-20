import { useEffect, Suspense, lazy } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import Header from './Header';
import Footer from './Footer';
import Loader from './Loader';
import './App.scss';

const _ItemDetails = lazy(() => import('./ItemDetails'));
const _UserProfile = lazy(() => import('./UserProfile'));

void _ItemDetails;
void _UserProfile;

declare function ga(...args: unknown[]): void;

export default function App() {
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (typeof ga !== 'undefined') {
      ga('set', 'page', location.pathname);
      ga('send', 'pageview');
    }
  }, [location.pathname]);

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
