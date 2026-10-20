import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router';

import { FeedList } from '../features/feeds';
import { AppShell } from '../features/shell';
import { Loader } from '../shared/components';
import { FEED_TYPES } from '../shared/models';

// Angular lazy-loads the item and user modules (`loadChildren`); same split here.
const ItemDetails = lazy(() => import('../features/item-details').then((m) => ({ default: m.ItemDetails })));
const UserProfile = lazy(() => import('../features/user').then((m) => ({ default: m.UserProfile })));

function Lazy({ children }: { children: ReactNode }) {
    return <Suspense fallback={<Loader />}>{children}</Suspense>;
}

/**
 * Mirrors `src/app/app.routes.ts`: `/` → `/news/1`; `/{feed}/:page` → FeedList (Angular `data.feedType`
 * becomes the `feedType` prop, keyed so switching feeds remounts); `/item/:id`, `/user/:id` lazy.
 * Angular has no wildcard route: unknown URLs (incl. `/news` without a page) keep the shell with an
 * empty outlet, which the `*` route reproduces.
 */
export const routes: RouteObject[] = [
    {
        element: <AppShell />,
        children: [
            { index: true, element: <Navigate to="/news/1" replace /> },
            ...FEED_TYPES.map((feedType): RouteObject => ({
                path: `${feedType}/:page`,
                element: <FeedList key={feedType} feedType={feedType} />,
            })),
            {
                path: 'item/:id',
                element: (
                    <Lazy>
                        <ItemDetails />
                    </Lazy>
                ),
            },
            {
                path: 'user/:id',
                element: (
                    <Lazy>
                        <UserProfile />
                    </Lazy>
                ),
            },
            { path: '*', element: null },
        ],
    },
];
