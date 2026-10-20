import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Feed } from './feeds/Feed';
import { Loader } from './shared/components/Loader';
import { FEED_TYPES } from './shared/models';

// Lazy routes preserve the Angular `loadChildren` chunks for ItemDetailsModule / UserModule.
const ItemDetails = lazy(() => import('./item-details/ItemDetails'));
const User = lazy(() => import('./user/User'));

export function AppRoutes() {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                <Route path="/" element={<Navigate to="/news/1" replace />} />
                {FEED_TYPES.map((feedType) => (
                    <Route key={feedType} path={`/${feedType}`}>
                        <Route index element={<Navigate to={`/${feedType}/1`} replace />} />
                        <Route path=":page" element={<Feed feedType={feedType} />} />
                    </Route>
                ))}
                <Route path="/item/:id" element={<ItemDetails />} />
                <Route path="/user/:id" element={<User />} />
                <Route path="*" element={<Navigate to="/news/1" replace />} />
            </Routes>
        </Suspense>
    );
}
