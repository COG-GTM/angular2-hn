import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { App } from './App';
import FeedPage from './features/feeds/FeedPage';
import { FEED_NAMES } from './models';

// Item and user pages are code-split, like the lazy-loaded Angular modules.
const ItemDetailsPage = lazy(() => import('./features/item-details/ItemDetailsPage'));
const UserPage = lazy(() => import('./features/user/UserPage'));

/** Mirrors src/app/app.routes.ts. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      ...FEED_NAMES.map((feedType) => ({
        path: `${feedType}/:page`,
        element: <FeedPage key={feedType} feedType={feedType} />,
      })),
      { path: 'item/:id', element: <ItemDetailsPage /> },
      { path: 'user/:id', element: <UserPage /> },
    ],
  },
];
