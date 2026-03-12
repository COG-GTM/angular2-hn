import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import App from './App';
import Feed from './components/Feed';
import Loader from './components/shared/Loader';

const ItemDetails = lazy(() => import('./components/ItemDetails'));
const User = lazy(() => import('./components/User'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      { path: 'news/:page', element: <Feed feedType="news" /> },
      { path: 'newest/:page', element: <Feed feedType="newest" /> },
      { path: 'show/:page', element: <Feed feedType="show" /> },
      { path: 'ask/:page', element: <Feed feedType="ask" /> },
      { path: 'jobs/:page', element: <Feed feedType="jobs" /> },
      {
        path: 'item/:id',
        element: (
          <Suspense fallback={<Loader />}>
            <ItemDetails />
          </Suspense>
        ),
      },
      {
        path: 'user/:id',
        element: (
          <Suspense fallback={<Loader />}>
            <User />
          </Suspense>
        ),
      },
    ],
  },
]);
