import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { App } from './App';
import { Feed } from './feeds/Feed';
import { Loader } from './shared/components/Loader';

const ItemDetails = lazy(() => import('./item-details/ItemDetails').then((m) => ({ default: m.ItemDetails })));
const UserProfile = lazy(() => import('./user/UserProfile').then((m) => ({ default: m.UserProfile })));

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

// The routed components load their data on mount, so they are keyed by their
// route params to get a fresh instance whenever the params change.
function FeedRoute({ feedType }: { feedType: string }) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? +page : 1;
    return <Feed key={`${feedType}/${pageNum}`} feedType={feedType} pageNum={pageNum} />;
}

function ItemDetailsRoute() {
    const { id } = useParams<{ id: string }>();
    return <ItemDetails key={id} />;
}

function UserProfileRoute() {
    const { id } = useParams<{ id: string }>();
    return <UserProfile key={id} />;
}

export function AppRoutes() {
    return (
        <App>
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    {FEED_TYPES.map((feedType) => (
                        <Route key={feedType} path={`/${feedType}`}>
                            <Route index element={<Navigate to={`/${feedType}/1`} replace />} />
                            <Route path=":page" element={<FeedRoute feedType={feedType} />} />
                        </Route>
                    ))}
                    <Route path="/item/:id" element={<ItemDetailsRoute />} />
                    <Route path="/user/:id" element={<UserProfileRoute />} />
                    <Route path="*" element={<Navigate to="/news/1" replace />} />
                </Routes>
            </Suspense>
        </App>
    );
}
