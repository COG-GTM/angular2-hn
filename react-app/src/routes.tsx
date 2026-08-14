import { Navigate, type RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import FeedPage from './pages/FeedPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import UserPage from './pages/UserPage';
import NotFoundPage from './pages/NotFoundPage';
import { feeds } from './feeds';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/news/1" replace /> },
      ...feeds.map((feedType) => ({
        path: `${feedType}/:page`,
        element: <FeedPage feedType={feedType} />,
      })),
      { path: 'item/:id', element: <ItemDetailsPage /> },
      { path: 'user/:id', element: <UserPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
