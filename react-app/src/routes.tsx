import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { FEED_TYPES } from './api/types';
import { AppShell } from './core/AppShell';
import { Feed } from './features/feeds/Feed';

const ItemDetails = lazy(() => import('./features/item/ItemDetails'));
const User = lazy(() => import('./features/user/User'));

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      ...FEED_TYPES.map((feedType) => ({
        path: `${feedType}/:page`,
        element: <Feed key={feedType} feedType={feedType} />,
      })),
      { path: 'item/:id', element: <Suspense fallback={null}><ItemDetails /></Suspense> },
      { path: 'user/:id', element: <Suspense fallback={null}><User /></Suspense> },
    ],
  },
];
