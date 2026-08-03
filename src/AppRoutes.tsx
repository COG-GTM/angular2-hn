import { Navigate, Route, Routes } from 'react-router-dom';

import FeedPage from './pages/Feed/FeedPage';
import type { FeedName } from './types';

const FEEDS: FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            {FEEDS.map((feed) => (
                <Route key={feed} path={`/${feed}/:page`} element={<FeedPage feedType={feed} />} />
            ))}
        </Routes>
    );
}
