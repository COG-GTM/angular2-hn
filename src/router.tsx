import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import FeedPage from './components/feed/FeedPage';
import Loader from './components/shared/Loader';

const ItemDetailsPage = React.lazy(() => import('./components/item-details/ItemDetailsPage'));
const UserPage = React.lazy(() => import('./components/user/UserPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      { path: ':feedType/:page', element: <FeedPage /> },
      {
        path: 'item/:id',
        element: (
          <Suspense fallback={<Loader />}>
            <ItemDetailsPage />
          </Suspense>
        ),
      },
      {
        path: 'user/:id',
        element: (
          <Suspense fallback={<Loader />}>
            <UserPage />
          </Suspense>
        ),
      },
    ],
  },
]);
