import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './components/App';
import FeedPage from './pages/FeedPage';
import Loader from './components/Loader';

const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage'));

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
          <Suspense fallback={<Loader />}>
            <ItemDetailsPage />
          </Suspense>
        ),
      },
      { path: 'user/:id', element: <div>User placeholder</div> },
    ],
  },
]);

export default router;
