import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import FeedPage from './components/feed/FeedPage';
import { Loader } from './shared/components';

const ItemDetailsPage = lazy(() => import('./components/item-details/ItemDetailsPage'));
const UserPage = lazy(() => import('./components/user/UserPage'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/news/1" replace />} />
      <Route
        path="/item/:id"
        element={
          <Suspense fallback={<Loader />}>
            <ItemDetailsPage />
          </Suspense>
        }
      />
      <Route
        path="/user/:id"
        element={
          <Suspense fallback={<Loader />}>
            <UserPage />
          </Suspense>
        }
      />
      <Route path="/:feedType" element={<FeedPage />} />
      <Route path="/:feedType/:page" element={<FeedPage />} />
    </Routes>
  );
}
