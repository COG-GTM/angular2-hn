import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Header } from './core/header/Header';
import { Footer } from './core/footer/Footer';
import { useSettings } from './shared/settings/SettingsContext';
import { Loader } from './shared/components';
import FeedPage from './features/feed/FeedPage';

import './App.scss';

const ItemDetailsPage = lazy(() => import('./features/item/ItemDetailsPage'));
const UserPage = lazy(() => import('./features/user/UserPage'));

declare const ga: ((...args: unknown[]) => void) | undefined;

const REDIRECT_ONLY_PATHS = new Set(['/', '/news', '/newest', '/show', '/ask', '/jobs']);

function usePageviewTracking() {
    const location = useLocation();
    useEffect(() => {
        if (REDIRECT_ONLY_PATHS.has(location.pathname)) {
            return;
        }
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);
}

export default function App() {
    const { settings } = useSettings();
    usePageviewTracking();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<FeedPage feedType="news" />} />
                    <Route path="/newest" element={<Navigate to="/newest/1" replace />} />
                    <Route path="/newest/:page" element={<FeedPage feedType="newest" />} />
                    <Route path="/show" element={<Navigate to="/show/1" replace />} />
                    <Route path="/show/:page" element={<FeedPage feedType="show" />} />
                    <Route path="/ask" element={<Navigate to="/ask/1" replace />} />
                    <Route path="/ask/:page" element={<FeedPage feedType="ask" />} />
                    <Route path="/jobs" element={<Navigate to="/jobs/1" replace />} />
                    <Route path="/jobs/:page" element={<FeedPage feedType="jobs" />} />
                    <Route
                        path="/item/:id"
                        element={
                            <Suspense fallback={<Loader />}>
                                <ItemDetailsPage />
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
                <Footer />
            </div>
        </div>
    );
}
