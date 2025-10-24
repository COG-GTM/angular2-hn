import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FeedPage from '../pages/FeedPage';

const ItemPage = lazy(() => import('../pages/ItemPage'));
const UserPage = lazy(() => import('../pages/UserPage'));

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Navigate to="/news/1" replace />,
            },
            {
                path: 'news/:page',
                element: <FeedPage feedType="news" />,
            },
            {
                path: 'newest/:page',
                element: <FeedPage feedType="newest" />,
            },
            {
                path: 'show/:page',
                element: <FeedPage feedType="show" />,
            },
            {
                path: 'ask/:page',
                element: <FeedPage feedType="ask" />,
            },
            {
                path: 'jobs/:page',
                element: <FeedPage feedType="jobs" />,
            },
            {
                path: 'item/:id',
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <ItemPage />
                    </Suspense>
                ),
            },
            {
                path: 'user/:id',
                element: (
                    <Suspense fallback={<div>Loading...</div>}>
                        <UserPage />
                    </Suspense>
                ),
            },
        ],
    },
]);
