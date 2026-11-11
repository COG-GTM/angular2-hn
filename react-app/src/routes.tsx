import { lazy } from 'react';
import { redirect, type RouteObject } from 'react-router-dom';
import App from './App';
import { FEED_TYPES } from './models';
import FeedPage from './pages/FeedPage';

const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

// Mirrors app.routes.ts; item and user pages stay lazy-loaded like their Angular modules.
export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            // A loader redirect resolves before render, so `/` never produces its own pageview.
            { index: true, loader: () => redirect('/news/1') },
            ...FEED_TYPES.map((feedType) => ({
                path: `${feedType}/:page`,
                element: <FeedPage key={feedType} feedType={feedType} />,
            })),
            { path: 'item/:id', element: <ItemDetailsPage /> },
            { path: 'user/:id', element: <UserPage /> },
        ],
    },
];
