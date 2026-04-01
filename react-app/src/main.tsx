import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import App from './App';
import { FeedPage } from './pages/FeedPage/FeedPage';
import './styles/global.scss';

// eslint-disable-next-line react-refresh/only-export-components
const ItemDetailsPage = lazy(() =>
  import('./pages/ItemDetailsPage/ItemDetailsPage').then((m) => ({ default: m.ItemDetailsPage }))
);
// eslint-disable-next-line react-refresh/only-export-components
const UserPage = lazy(() =>
  import('./pages/UserPage/UserPage').then((m) => ({ default: m.UserPage }))
);

const LazyFallback = (
  <div className="loading-section">
    <div className="loader">Loading...</div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      { path: 'news/:page', element: <FeedPage feedType="news" /> },
      { path: 'newest/:page', element: <FeedPage feedType="newest" /> },
      { path: 'show/:page', element: <FeedPage feedType="show" /> },
      { path: 'ask/:page', element: <FeedPage feedType="ask" /> },
      { path: 'jobs/:page', element: <FeedPage feedType="jobs" /> },
      {
        path: 'item/:id',
        element: (
          <Suspense fallback={LazyFallback}>
            <ItemDetailsPage />
          </Suspense>
        ),
      },
      {
        path: 'user/:id',
        element: (
          <Suspense fallback={LazyFallback}>
            <UserPage />
          </Suspense>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  </React.StrictMode>
);
