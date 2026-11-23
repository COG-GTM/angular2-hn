import { Suspense } from 'react';
import { type RouteObject } from 'react-router-dom';
import { FEED_TYPES } from './api/types';
import { AppShell } from './core/AppShell';
import { HomeRedirect } from './core/HomeRedirect';
import { Feed } from './features/feeds/Feed';
import { lazyWithReload } from './utils/lazyWithReload';

const ItemDetails = lazyWithReload(() => import('./features/item/ItemDetails'));
const User = lazyWithReload(() => import('./features/user/User'));

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomeRedirect /> },
      ...FEED_TYPES.map((feedType) => ({
        path: `${feedType}/:page`,
        element: <Feed key={feedType} feedType={feedType} />,
      })),
      { path: 'item/:id', element: <Suspense fallback={null}><ItemDetails /></Suspense> },
      { path: 'user/:id', element: <Suspense fallback={null}><User /></Suspense> },
    ],
  },
];
