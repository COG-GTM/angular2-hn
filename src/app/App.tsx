import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Footer } from './core/footer/Footer';
import { Header } from './core/header/Header';
import { Feed } from './feeds/feed/Feed';
import { usePageViews } from './shared/analytics/usePageViews';
import { Loader } from './shared/components/loader/Loader';
import { useSettings } from './shared/context/useSettings';
import './App.scss';

const ItemDetails = lazy(() =>
  import('./item-details/ItemDetails').then((module) => ({ default: module.ItemDetails }))
);
const User = lazy(() => import('./user/User').then((module) => ({ default: module.User })));

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

export function App() {
  const { settings } = useSettings();

  usePageViews();

  return (
    <div className={`app-view ${settings.theme}`}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Header />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            {FEED_TYPES.map((feedType) => (
              <Route key={feedType} path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
            ))}
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/user/:id" element={<User />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}
