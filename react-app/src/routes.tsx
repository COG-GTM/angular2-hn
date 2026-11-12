import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { Loader } from './components/Loader';
import { Feed } from './feeds/Feed';
import type { FeedType } from './models';

// Code-split like the Angular `loadChildren` item-details and user modules.
const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const User = lazy(() => import('./user/User'));

export const FEED_TYPES: FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs'];

/** Same route map as src/app/app.routes.ts in the Angular app. */
export const routes: RouteObject[] = [
    { path: '/', element: <Navigate to="/news/1" replace /> },
    ...FEED_TYPES.map<RouteObject>((feedType) => ({
        path: `/${feedType}`,
        children: [{ path: ':page', element: <Feed key={feedType} feedType={feedType} /> }],
    })),
    {
        path: '/item/:id',
        element: (
            <Suspense fallback={<Loader />}>
                <ItemDetails />
            </Suspense>
        ),
    },
    {
        path: '/user/:id',
        element: (
            <Suspense fallback={<Loader />}>
                <User />
            </Suspense>
        ),
    },
];
