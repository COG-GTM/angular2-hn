import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, type RouteObject } from 'react-router';
import App from './App';
import Feed from './feeds/Feed';
import type { FeedType } from './models';

const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const UserProfile = lazy(() => import('./user/UserProfile'));

const FEED_TYPES: FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs'];

const lazyRoute = (element: ReactNode) => <Suspense fallback={null}>{element}</Suspense>;

const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...FEED_TYPES.map((feedType) => ({
                path: `${feedType}/:page`,
                element: <Feed key={feedType} feedType={feedType} />,
            })),
            { path: 'item/:id', element: lazyRoute(<ItemDetails />) },
            { path: 'user/:id', element: lazyRoute(<UserProfile />) },
        ],
    },
];

const router = createBrowserRouter(routes);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
