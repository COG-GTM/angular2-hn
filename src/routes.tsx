import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Feed from './pages/Feed';
import Loader from './components/Loader';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const User = lazy(() => import('./pages/User'));

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route path="/:feedType/:page" element={<Feed />} />
            <Route
                path="/item/:id"
                element={
                    <Suspense fallback={<Loader />}>
                        <ItemDetails />
                    </Suspense>
                }
            />
            <Route
                path="/user/:id"
                element={
                    <Suspense fallback={<Loader />}>
                        <User />
                    </Suspense>
                }
            />
        </Routes>
    );
}
