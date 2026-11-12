import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { Feed } from './feeds/Feed';
import { FEED_TYPES } from './shared/models/feed';

// Lazy-loaded to preserve the code-splitting of the former ItemDetailsModule / UserModule.
const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const User = lazy(() => import('./user/User'));

/** Mirrors the former src/app/app.routes.ts. */
export function AppRoutes() {
    return (
        <Suspense fallback={null}>
            <Routes>
                <Route path="/" element={<Navigate to="/news/1" replace />} />
                {FEED_TYPES.map((feedType) => (
                    <Route key={feedType} path={feedType}>
                        <Route path=":page" element={<Feed key={feedType} feedType={feedType} />} />
                    </Route>
                ))}
                <Route path="item/:id" element={<ItemDetails />} />
                <Route path="user/:id" element={<User />} />
            </Routes>
        </Suspense>
    );
}
