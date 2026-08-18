import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Feed from './components/feeds/Feed';
import Loader from './components/shared/Loader';
import type { FeedName } from './models';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const UserProfile = lazy(() => import('./components/user/UserProfile'));

const feeds: FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

export default function AppRoutes() {
    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                <Route path="/" element={<Navigate to="/news/1" replace />} />
                {feeds.map((feedType) => (
                    <Route key={feedType} path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
                ))}
                <Route path="/item/:id" element={<ItemDetails />} />
                <Route path="/user/:id" element={<UserProfile />} />
            </Routes>
        </Suspense>
    );
}
