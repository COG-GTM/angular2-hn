/* eslint-disable react-refresh/only-export-components */
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { App } from './App';
import { FeedPage } from './pages/FeedPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { UserPage } from './pages/UserPage';

export const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...feedTypes.map((feedType) => ({
                path: `${feedType}/:page`,
                element: <FeedPage feedType={feedType} />,
            })),
            { path: 'item/:id', element: <ItemDetailsPage /> },
            { path: 'user/:id', element: <UserPage /> },
        ],
    },
];

export function AppRoutes() {
    return useRoutes(routes);
}

export default routes;
