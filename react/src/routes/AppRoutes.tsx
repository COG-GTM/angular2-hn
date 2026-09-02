import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { DEFAULT_ROUTE, FEED_ROUTES } from './feed-routes';
import { FeedPlaceholder, type FeedPageProps } from './placeholders';

const ItemPage = lazy(() => import('./placeholders').then((m) => ({ default: m.ItemPlaceholder })));
const UserPage = lazy(() => import('./placeholders').then((m) => ({ default: m.UserPlaceholder })));

export interface AppRoutesProps {
    feedPage?: ComponentType<FeedPageProps>;
    itemPage?: ComponentType;
    userPage?: ComponentType;
    fallback?: ReactNode;
}

export function AppRoutes({
    feedPage: FeedPage = FeedPlaceholder,
    itemPage: Item = ItemPage,
    userPage: User = UserPage,
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
