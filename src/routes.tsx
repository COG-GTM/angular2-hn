import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';

import { App } from './App';
import { Feed } from './feeds/Feed';
import { ItemDetails } from './item-details/ItemDetails';
import { User } from './user/User';

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

const feedRoutes: RouteObject[] = feedTypes.flatMap((feedType) => [
    { path: feedType, element: <Feed feedType={feedType} /> },
    { path: `${feedType}/:page`, element: <Feed feedType={feedType} /> },
]);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...feedRoutes,
            { path: 'item/:id', element: <ItemDetails /> },
            { path: 'user/:id', element: <User /> },
        ],
    },
]);
