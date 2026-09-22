import { createBrowserRouter, Navigate } from 'react-router-dom';

import { App } from './App';
import { FeedPage } from './pages/FeedPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { UserPage } from './pages/UserPage';
import type { FeedName } from './models';

const FEEDS: FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      ...FEEDS.map((feed) => ({
        path: `${feed}/:page`,
        element: <FeedPage feedType={feed} />,
      })),
      ...FEEDS.map((feed) => ({
        path: feed,
        element: <Navigate to={`/${feed}/1`} replace />,
      })),
      { path: 'item/:id', element: <ItemDetailsPage /> },
      { path: 'user/:id', element: <UserPage /> },
      { path: '*', element: <Navigate to="/news/1" replace /> },
    ],
  },
]);
