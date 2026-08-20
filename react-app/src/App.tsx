import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { useSettings } from './hooks/useSettings';
import { FeedPage } from './pages/FeedPage';
import './App.scss';

const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        window.ga?.('set', 'page', location.pathname + location.search);
        window.ga?.('send', 'pageview');
    }, [location]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        {FEED_TYPES.map((feedType) => (
                            <Route
                                key={feedType}
                                path={`/${feedType}/:page`}
                                element={<FeedPage feedType={feedType} />}
                            />
                        ))}
                        <Route path="/item/:id" element={<ItemDetailsPage />} />
                        <Route path="/user/:id" element={<UserPage />} />
                        <Route path="*" element={<Navigate to="/news/1" replace />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export default App;
