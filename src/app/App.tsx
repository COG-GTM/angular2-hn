import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './shared/context/SettingsContext';
import Header from './core/Header';
import Footer from './core/Footer';
import Feed from './feeds/Feed';
import Loader from './shared/components/loader/Loader';
import './app.component.scss';

const ItemDetails = React.lazy(() => import('./item-details/ItemDetails'));
const User = React.lazy(() => import('./user/User'));

declare let ga: (command: string, ...args: string[]) => void;

function AnalyticsTracker() {
    const location = useLocation();

    useEffect(() => {
        if (typeof ga !== 'undefined') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);

    return null;
}

function AppShell() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
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

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <AnalyticsTracker />
                <AppShell />
            </SettingsProvider>
        </BrowserRouter>
    );
};

export default App;
