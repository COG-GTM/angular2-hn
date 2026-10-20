import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './features/core';
import { FeedList } from './features/feeds';
import { ItemDetails } from './features/item-details';
import { UserProfile } from './features/user';
import { FEED_TYPES } from './shared/models';

/** Mirrors `src/app/app.routes.ts`. Angular's `data.feedType` becomes the `feedType` prop. */
export function AppRoutes() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route index element={<Navigate to="/news/1" replace />} />
                {FEED_TYPES.map((feedType) => (
                    <Route
                        key={feedType}
                        path={`${feedType}/:page`}
                        element={<FeedList key={feedType} feedType={feedType} />}
                    />
                ))}
                <Route path="item/:id" element={<ItemDetails />} />
                <Route path="user/:id" element={<UserProfile />} />
            </Route>
        </Routes>
    );
}
