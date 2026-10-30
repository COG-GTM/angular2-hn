/* eslint-disable react-refresh/only-export-components -- route table, not a component module */
import { lazy } from 'react';
import { redirect, type RouteObject } from 'react-router-dom';

import { App } from './App';
import { Feed } from './feeds/Feed/Feed';
import { FEED_NAMES } from './feeds/feed-names';
import { ErrorMessage } from './shared/components/ErrorMessage/ErrorMessage';

const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const User = lazy(() => import('./user/User'));

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, loader: () => redirect('/news/1') },
            ...FEED_NAMES.map((feedType) => ({
                path: `${feedType}/:page`,
                element: <Feed key={feedType} feedType={feedType} />,
            })),
            { path: 'item/:id', element: <ItemDetails /> },
            { path: 'user/:id', element: <User /> },
            { path: '*', element: <ErrorMessage message="Page not found." /> },
        ],
    },
];
