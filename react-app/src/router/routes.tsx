import { Navigate, type RouteObject } from 'react-router';

import { AppLayout } from '../layout/AppLayout';
import { Feed } from '../feeds/Feed';
import { FEEDS } from '../shared/models';
import type { FeedRouteHandle } from './feed-route';

// Mirrors src/app/app.routes.ts. item/user stay code-split like the Angular lazy modules.
export const routes: RouteObject[] = [
    {
        path: '/',
        element: <AppLayout />,
        // Render nothing while a lazy route loads on first paint, so index.html's app-loader logo shows.
        HydrateFallback: () => null,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...FEEDS.map((feedType): RouteObject => ({
                path: feedType,
                handle: { feedType } satisfies FeedRouteHandle,
                children: [
                    { index: true, element: <Navigate to="1" replace /> },
                    { path: ':page', element: <Feed /> },
                ],
            })),
            {
                path: 'item/:id',
                lazy: async () => ({ Component: (await import('../item-details/ItemDetails')).ItemDetails }),
            },
            {
                path: 'user/:id',
                lazy: async () => ({ Component: (await import('../user/User')).User }),
            },
            { path: '*', element: <Navigate to="/news/1" replace /> },
        ],
    },
];
