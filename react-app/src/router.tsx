import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import Feed from './pages/Feed';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

const LazyItemDetails = () => (
  <Suspense fallback={<div className="app-loader">Loading...</div>}>
    <ItemDetails />
  </Suspense>
);

const LazyUserProfile = () => (
  <Suspense fallback={<div className="app-loader">Loading...</div>}>
    <UserProfile />
  </Suspense>
);

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
      { path: 'item/:id', element: <LazyItemDetails /> },
      { path: 'user/:id', element: <LazyUserProfile /> },
    ],
  },
]);
