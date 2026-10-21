import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import App from './App';
import Loader from './components/shared/Loader';
import FeedPage from './features/feeds/FeedPage';
import { FEED_TYPES } from './models';

const ItemDetailsPage = lazy(() => import('./features/item-details/ItemDetailsPage'));
const UserPage = lazy(() => import('./features/user/UserPage'));

const withSuspense = (page: ReactNode) => <Suspense fallback={<Loader />}>{page}</Suspense>;

/** Port of src/app/app.routes.ts. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      ...FEED_TYPES.map((feedType) => ({
        path: `${feedType}/:page`,
        element: <FeedPage key={feedType} feedType={feedType} />,
      })),
      { path: 'item/:id', element: withSuspense(<ItemDetailsPage />) },
      { path: 'user/:id', element: withSuspense(<UserPage />) },
      // Angular rendered the empty shell for unknown URLs.
      { path: '*', element: null },
    ],
  },
];
