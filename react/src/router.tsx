import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Loader } from './components/Loader';
import { Feed } from './features/feeds/Feed';

const ItemDetails = lazy(() =>
  import('./features/item-details/ItemDetails').then((m) => ({ default: m.ItemDetails }))
);
const User = lazy(() => import('./features/user/User').then((m) => ({ default: m.User })));

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/news/1" replace />} />
      {feedTypes.map((feedType) => (
        <Route key={feedType} path={`/${feedType}`}>
          <Route index element={<Navigate to={`/${feedType}/1`} replace />} />
          <Route path=":page" element={<Feed feedType={feedType} />} />
        </Route>
      ))}
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
            <User />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/news/1" replace />} />
    </Routes>
  );
}
