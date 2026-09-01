import { ComponentType } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { FEED_ROUTES, FeedRoute } from '../shared/models';

export interface AppRouteComponents {
    Feed: ComponentType<{ feedType: FeedRoute }>;
    ItemDetails: ComponentType;
    User: ComponentType;
}

export function AppRoutes({ Feed, ItemDetails, User }: AppRouteComponents) {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            {FEED_ROUTES.map((feedType) => (
                <Route key={feedType} path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
            ))}
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/user/:id" element={<User />} />
        </Routes>
    );
}
