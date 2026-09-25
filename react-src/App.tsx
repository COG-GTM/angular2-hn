import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Feed from './components/Feed';
import Footer from './components/Footer';
import Header from './components/Header';
import Loader from './components/Loader';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { trackPageView } from './ga';

const ItemDetails = lazy(() => import('./components/ItemDetails'));
const User = lazy(() => import('./components/User'));

function AnalyticsTracker() {
    const location = useLocation();

    useEffect(() => {
        trackPageView(location.pathname + location.search);
    }, [location.pathname, location.search]);

    return null;
}

function Shell() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <AnalyticsTracker />
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/news/:page" element={<Feed feedType="news" />} />
                        <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                        <Route path="/show/:page" element={<Feed feedType="show" />} />
                        <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                        <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<User />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <Shell />
            </BrowserRouter>
        </SettingsProvider>
    );
}
