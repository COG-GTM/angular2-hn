// Ported from src/app/app.routes.ts
import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { FeedPage } from './pages/feed/FeedPage';
import { FEED_TYPES } from './types';

const ItemDetailsPage = lazy(() => import('./pages/item/ItemDetailsPage'));
const UserPage = lazy(() => import('./pages/user/UserPage'));

export const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/news/1" replace />} />
        {FEED_TYPES.map((feedType) => (
          <Route key={feedType} path={feedType}>
            <Route index element={<Navigate to={`/${feedType}/1`} replace />} />
            <Route path=":page" element={<FeedPage key={feedType} feedType={feedType} />} />
          </Route>
        ))}
        <Route path="item/:id" element={<ItemDetailsPage />} />
        <Route path="user/:id" element={<UserPage />} />
        <Route path="*" element={<Navigate to="/news/1" replace />} />
      </Route>
    </Routes>
  );
}
