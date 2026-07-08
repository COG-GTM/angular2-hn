import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';
import { Feed } from './feeds/Feed';
import { Loader } from './shared/components/Loader';

const ItemDetails = lazy(() =>
    import('./item-details/ItemDetails').then((m) => ({ default: m.ItemDetails }))
);
const UserProfile = lazy(() => import('./user/UserProfile').then((m) => ({ default: m.UserProfile })));

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            { path: 'news/:page', element: <Feed feedType="news" /> },
            { path: 'newest/:page', element: <Feed feedType="newest" /> },
            { path: 'show/:page', element: <Feed feedType="show" /> },
            { path: 'ask/:page', element: <Feed feedType="ask" /> },
            { path: 'jobs/:page', element: <Feed feedType="jobs" /> },
            {
                path: 'item/:id',
                element: (
                    <Suspense fallback={<Loader />}>
                        <ItemDetails />
                    </Suspense>
                ),
            },
            {
                path: 'user/:id',
                element: (
                    <Suspense fallback={<Loader />}>
                        <UserProfile />
                    </Suspense>
                ),
            },
        ],
    },
]);
