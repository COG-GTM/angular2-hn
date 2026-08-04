import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import App from './App';
import Feed from './feeds/feed/Feed';

const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const User = lazy(() => import('./user/User'));

export const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export type FeedRouteType = (typeof FEED_TYPES)[number];

const feedRoutes: RouteObject[] = FEED_TYPES.flatMap((feedType) => [
    { path: feedType, element: <Navigate to={`/${feedType}/1`} replace /> },
    { path: `${feedType}/:page`, element: <Feed feedType={feedType} /> },
]);

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...feedRoutes,
            { path: 'item/:id', element: <ItemDetails /> },
            { path: 'user/:id', element: <User /> },
            { path: '*', element: <Navigate to="/news/1" replace /> },
        ],
    },
];
