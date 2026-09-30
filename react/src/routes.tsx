// Mirrors src/app/app.routes.ts. Shared file — coordinate before changing paths.
import { Navigate, type RouteObject } from 'react-router-dom';
import { App } from './App';
import { FEED_TYPES } from './api/types';
import { FeedPage } from './pages/FeedPage';

export const routerFuture = {
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_partialHydration: true,
  v7_skipActionErrorRevalidation: true,
} as const;

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      ...FEED_TYPES.map<RouteObject>((feedType) => ({
        path: `${feedType}/:page`,
        element: <FeedPage key={feedType} feedType={feedType} />,
      })),
      // item-details and user were lazy-loaded modules in Angular; keep them code-split.
      { path: 'item/:id', lazy: () => import('./pages/ItemPage') },
      { path: 'user/:id', lazy: () => import('./pages/UserPage') },
      // Angular rendered an empty outlet for unknown routes.
      { path: '*', element: null },
    ],
  },
];
