import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import Feed from './components/Feed';
import Loader from './components/Loader';

const ItemDetails = lazy(() => import('./components/ItemDetails'));
const User = lazy(() => import('./components/User'));

const lazyFallback = <Loader />;

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<Navigate to="/news/1" replace />} />
                <Route path="news/:page" element={<Feed feedName="news" />} />
                <Route path="newest/:page" element={<Feed feedName="newest" />} />
                <Route path="show/:page" element={<Feed feedName="show" />} />
                <Route path="ask/:page" element={<Feed feedName="ask" />} />
                <Route path="jobs/:page" element={<Feed feedName="jobs" />} />
                <Route
                    path="item/:id"
                    element={
                        <Suspense fallback={lazyFallback}>
                            <ItemDetails />
                        </Suspense>
                    }
                />
                <Route
                    path="user/:id"
                    element={
                        <Suspense fallback={lazyFallback}>
                            <User />
                        </Suspense>
                    }
                />
            </Route>
        </Routes>
    );
}
