import { Navigate, Route, Routes } from 'react-router-dom';

import FeedPage from './pages/Feed/FeedPage';
import ItemDetailsPage from './pages/ItemDetails/ItemDetailsPage';
import UserPage from './pages/User/UserPage';
import type { FeedName } from './types';

const FEEDS: FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            {FEEDS.map((feed) => (
                <Route key={feed} path={`/${feed}/:page`} element={<FeedPage feedType={feed} />} />
            ))}
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/user/:id" element={<UserPage />} />
        </Routes>
    );
}
