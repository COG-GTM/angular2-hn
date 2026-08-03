import { Navigate, Route, Routes } from 'react-router-dom';

import FeedPage from '../features/feed/FeedPage';
import ItemDetailsPage from '../features/item-details/ItemDetailsPage';
import UserPage from '../features/user/UserPage';
import { feedRouteConfigs } from './feedRoutes';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            {feedRouteConfigs.map(({ path, feedType }) => (
                <Route key={path} path={path} element={<FeedPage feedType={feedType} />} />
            ))}
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/user/:id" element={<UserPage />} />
        </Routes>
    );
}
