import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import { useSettings } from './context/SettingsContext';
import Feed from './features/feeds/Feed';

const ItemDetails = lazy(() => import('./components/ItemDetails'));
const UserDetails = lazy(() => import('./components/UserDetails'));

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

function usePageViewTracking() {
    const location = useLocation();

    useEffect(() => {
        const page = `${location.pathname}${location.search}`;
        window.ga?.('set', 'page', page);
        window.ga?.('send', 'pageview');
    }, [location]);
}

export default function App() {
    const { settings } = useSettings();
    usePageViewTracking();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <Suspense fallback={<div className="loading">Loading...</div>}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/news" element={<Navigate to="/news/1" replace />} />
                        <Route path="/news/:page" element={<Feed feedType="news" />} />
                        <Route path="/newest" element={<Navigate to="/newest/1" replace />} />
                        <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                        <Route path="/show" element={<Navigate to="/show/1" replace />} />
                        <Route path="/show/:page" element={<Feed feedType="show" />} />
                        <Route path="/ask" element={<Navigate to="/ask/1" replace />} />
                        <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                        <Route path="/jobs" element={<Navigate to="/jobs/1" replace />} />
                        <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<UserDetails />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
