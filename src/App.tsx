import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Loader } from './components/Loader';
import { FeedPage } from './pages/FeedPage';

const ItemDetailsPage = lazy(() =>
    import('./pages/ItemDetailsPage').then((m) => ({ default: m.ItemDetailsPage }))
);
const UserPage = lazy(() => import('./pages/UserPage').then((m) => ({ default: m.UserPage })));

declare function ga(...args: unknown[]): void;

function PageTracker() {
    const location = useLocation();

    useEffect(() => {
        if (typeof ga !== 'undefined') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);

    return null;
}

export function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <PageTracker />
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/:feedType/:page" element={<FeedPage />} />
                        <Route path="/:feedType" element={<FeedPage />} />
                        <Route path="/item/:id" element={<ItemDetailsPage />} />
                        <Route path="/user/:id" element={<UserPage />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
