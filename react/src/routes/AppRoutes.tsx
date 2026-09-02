import { Suspense, type ComponentType, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { DEFAULT_ROUTE, FEED_ROUTES } from './feed-routes';
import { FeedPlaceholder, ItemPlaceholder, UserPlaceholder, type FeedPageProps } from './placeholders';

export interface AppRoutesProps {
    feedPage?: ComponentType<FeedPageProps>;
    itemPage?: ComponentType;
    userPage?: ComponentType;
    fallback?: ReactNode;
}

export function AppRoutes({
    feedPage: FeedPage = FeedPlaceholder,
    itemPage: Item = ItemPlaceholder,
    userPage: User = UserPlaceholder,
    fallback = null,
}: AppRoutesProps) {
    return (
        <Suspense fallback={fallback}>
            <Routes>
                <Route path="/" element={<Navigate to={DEFAULT_ROUTE} replace />} />
                {FEED_ROUTES.map(({ path, feedType }) => (
                    <Route key={path} path={`${path}/:page`} element={<FeedPage feedType={feedType} />} />
                ))}
                <Route path="item/:id" element={<Item />} />
                <Route path="user/:id" element={<User />} />
            </Routes>
        </Suspense>
    );
}
