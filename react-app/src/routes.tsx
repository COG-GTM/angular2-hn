import { Navigate, useRoutes, type RouteObject } from 'react-router';
import { App } from './App';
import { FEED_TYPES } from './models';
import { FeedPage } from './pages/FeedPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { UserPage } from './pages/UserPage';

export const routes: RouteObject[] = [{
  element: <App />,
  children: [
    { path: '/', element: <Navigate to="/news/1" replace /> },
    ...FEED_TYPES.map(feedType => ({ path: `/${feedType}/:page`, element: <FeedPage feedType={feedType} /> })),
    { path: '/item/:id', element: <ItemDetailsPage /> },
    { path: '/user/:id', element: <UserPage /> },
  ],
}];
export function AppRoutes() { return useRoutes(routes); }
