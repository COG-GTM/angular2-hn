import { createBrowserRouter, Navigate } from 'react-router';

import { App } from './App';
import { Feed } from './pages/Feed/Feed';

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...FEED_TYPES.map((feedType) => ({
                path: `${feedType}/:page`,
                element: <Feed feedType={feedType} />,
            })),
        ],
    },
]);
