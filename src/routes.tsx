import { lazy, Suspense } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import Feed from './components/feeds/Feed';
import Loader from './components/shared/Loader';
import { FeedName } from './models/feed-type.type';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const User = lazy(() => import('./components/user/User'));

export const feedNames: FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

function lazyRoute(element: JSX.Element) {
    return <Suspense fallback={<Loader />}>{element}</Suspense>;
}

export const routes: RouteObject[] = [
    { path: '/', element: <Navigate to="/news/1" replace /> },
    ...feedNames.map(feedName => ({ path: `/${feedName}/:page`, element: <Feed /> })),
    { path: '/item/:id', element: lazyRoute(<ItemDetails />) },
    { path: '/user/:id', element: lazyRoute(<User />) },
];

export default function AppRoutes() {
    return useRoutes(routes);
}
