import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import Feed from './components/feeds/Feed';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const User = lazy(() => import('./components/user/User'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/news/1" replace />,
  },
  {
    path: '/news/:page',
    element: <Feed feedType="news" />,
  },
  {
    path: '/newest/:page',
    element: <Feed feedType="newest" />,
  },
  {
    path: '/show/:page',
    element: <Feed feedType="show" />,
  },
  {
    path: '/ask/:page',
    element: <Feed feedType="ask" />,
  },
  {
    path: '/jobs/:page',
    element: <Feed feedType="jobs" />,
  },
  {
    path: '/item/:id',
    element: <ItemDetails />,
  },
  {
    path: '/user/:id',
    element: <User />,
  },
];
