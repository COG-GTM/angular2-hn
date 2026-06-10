import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FeedPage from './pages/FeedPage';
import Loader from './components/shared/Loader';

const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/news/:page" element={<FeedPage feedType="news" />} />
            <Route path="/newest/:page" element={<FeedPage feedType="newest" />} />
            <Route path="/show/:page" element={<FeedPage feedType="show" />} />
            <Route path="/ask/:page" element={<FeedPage feedType="ask" />} />
            <Route path="/jobs/:page" element={<FeedPage feedType="jobs" />} />
            <Route
                path="/item/:id"
                element={
                    <Suspense fallback={<Loader />}>
                        <ItemDetailPage />
                    </Suspense>
                }
            />
            <Route
                path="/user/:id"
                element={
                    <Suspense fallback={<Loader />}>
                        <UserPage />
                    </Suspense>
                }
            />
        </Routes>
    );
}
