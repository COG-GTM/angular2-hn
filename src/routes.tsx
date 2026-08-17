import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { App } from './App';
import { Feed } from './pages/Feed';
import { ItemDetails } from './pages/ItemDetails';
import { UserProfile } from './pages/UserProfile';
import { FEED_NAMES } from './models';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...FEED_NAMES.map((feedType) => ({
                path: feedType,
                children: [
                    { index: true, element: <Navigate to={`/${feedType}/1`} replace /> },
                    { path: ':page', element: <Feed feedType={feedType} /> },
                ],
            })),
            { path: 'item/:id', element: <ItemDetails /> },
            { path: 'user/:id', element: <UserProfile /> },
        ],
    },
];
