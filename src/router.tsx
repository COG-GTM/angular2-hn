import { Navigate, Route, Routes } from 'react-router-dom';

import { Feed } from './pages/Feed';
import { ItemDetails } from './pages/ItemDetails';
import { User } from './pages/User';
import { FEED_TYPES } from './types/feedType';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            {FEED_TYPES.map((feedType) => (
                <Route key={feedType} path={`${feedType}/:page`} element={<Feed feedType={feedType} />} />
            ))}
            <Route path="item/:id" element={<ItemDetails />} />
            <Route path="user/:id" element={<User />} />
        </Routes>
    );
}
