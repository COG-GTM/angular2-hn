/* eslint-disable react-refresh/only-export-components */
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useParams,
} from 'react-router-dom';

import App from './App';
import Feed from './pages/Feed';
import Loader from './components/Loader';
import { SettingsProvider } from './context/SettingsContext';
import './styles/styles.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const User = lazy(() => import('./pages/User'));

const ALLOWED_FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

function FeedRoute() {
  const { feedType } = useParams();
  if (!feedType || !ALLOWED_FEED_TYPES.includes(feedType)) {
    return <Navigate to="/news/1" replace />;
  }
  return <Feed />;
}

function lazyPage(element: React.ReactNode) {
  return <Suspense fallback={<Loader />}>{element}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      { path: 'item/:id', element: lazyPage(<ItemDetails />) },
      { path: 'user/:id', element: lazyPage(<User />) },
      { path: ':feedType/:page', element: <FeedRoute /> },
      { path: '*', element: <Navigate to="/news/1" replace /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  </StrictMode>
);
