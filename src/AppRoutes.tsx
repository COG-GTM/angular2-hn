import { Navigate, Route, Routes } from 'react-router-dom';

import { FeedPage } from './pages/FeedPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { UserPage } from './pages/UserPage';

const feeds = ['news', 'newest', 'show', 'ask', 'jobs'];

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            {feeds.map((feedType) => (
                <Route key={feedType} path={`/${feedType}/:page`} element={<FeedPage feedType={feedType} />} />
            ))}
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/user/:id" element={<UserPage />} />
        </Routes>
    );
}
