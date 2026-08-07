import { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

import Layout from './Layout';
import Loader from './components/Loader/Loader';
import Feed from './pages/Feed/Feed';

const ItemDetails = lazy(() => import('./pages/ItemDetails/ItemDetails'));
const User = lazy(() => import('./pages/User/User'));

export const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...feedTypes.map((feedType) => ({
                path: `${feedType}/:page`,
                element: <Feed feedType={feedType} />,
            })),
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
                        <User />
                    </Suspense>
                ),
            },
        ],
    },
];
