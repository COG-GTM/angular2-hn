/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';
import { Feed } from './pages/Feed';
import { Loader } from './components/Loader';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const User = lazy(() => import('./pages/User'));

function LazyRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      { path: ':feedType/:page', element: <Feed /> },
      {
        path: 'item/:id',
        element: (
          <LazyRoute>
            <ItemDetails />
          </LazyRoute>
        ),
      },
      {
        path: 'user/:id',
        element: (
          <LazyRoute>
            <User />
          </LazyRoute>
        ),
      },
    ],
  },
]);

