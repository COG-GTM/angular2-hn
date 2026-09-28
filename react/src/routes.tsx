import { Navigate, type RouteObject } from 'react-router-dom';

import { AppShell } from './AppShell';
import { FeedPage } from './pages/FeedPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { UserPage } from './pages/UserPage';
import type { FeedType } from './api';

export const FEED_TYPES: FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs'];

const feedRoutes: RouteObject[] = FEED_TYPES.flatMap((feedType) => [
    { path: feedType, element: <Navigate to={`/${feedType}/1`} replace /> },
    { path: `${feedType}/:page`, element: <FeedPage feedType={feedType} /> },
]);

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <AppShell />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...feedRoutes,
            { path: 'item/:id', element: <ItemDetailsPage /> },
            { path: 'user/:id', element: <UserPage /> },
        ],
    },
];
