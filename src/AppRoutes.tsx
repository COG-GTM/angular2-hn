import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from './components/core';
import { Feed } from './components/feeds/Feed';
import { Loader } from './components/shared';
import { useSettings } from './context';
import { FEED_NAMES, type FeedName } from './models';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const UserProfile = lazy(() => import('./components/user/UserProfile'));

function DefaultFeedRedirect() {
    const { settings } = useSettings();
    return <Navigate to={`/${settings.defaultFeed}/1`} replace />;
}

function FeedRoute({ feedType }: { feedType: FeedName }) {
    const { page } = useParams<{ page: string }>();
    const pageNum = Number(page);
    if (!Number.isInteger(pageNum) || pageNum < 1) {
        return <Navigate to={`/${feedType}/1`} replace />;
    }
    return <Feed key={`${feedType}-${pageNum}`} feedType={feedType} page={pageNum} />;
}

function Lazy({ children }: { children: ReactNode }) {
    return <Suspense fallback={<Loader />}>{children}</Suspense>;
}

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<DefaultFeedRedirect />} />
                {FEED_NAMES.map((feed) => (
                    <Route key={feed} path={feed}>
                        <Route index element={<Navigate to="1" replace />} />
                        <Route path=":page" element={<FeedRoute feedType={feed} />} />
                    </Route>
                ))}
                <Route path="item">
                    <Route
                        index
                        element={
                            <Lazy>
                                <ItemDetails />
                            </Lazy>
                        }
                    />
                    <Route
                        path=":id"
                        element={
                            <Lazy>
                                <ItemDetails />
                            </Lazy>
                        }
                    />
                </Route>
                <Route path="user">
                    <Route
                        index
                        element={
                            <Lazy>
                                <UserProfile />
                            </Lazy>
                        }
                    />
                    <Route
                        path=":id"
                        element={
                            <Lazy>
                                <UserProfile />
                            </Lazy>
                        }
                    />
                </Route>
                <Route path="*" element={<DefaultFeedRedirect />} />
            </Route>
        </Routes>
    );
}
