import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FeedPage from './pages/FeedPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import UserPage from './pages/UserPage';
import './App.scss';

declare function ga(...args: unknown[]): void;

function GATracker() {
    const location = useLocation();
    useEffect(() => {
        if (typeof ga !== 'undefined') {
            ga('set', 'page', location.pathname);
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
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<FeedPage feedType="news" />} />
                    <Route path="/newest/:page" element={<FeedPage feedType="newest" />} />
                    <Route path="/show/:page" element={<FeedPage feedType="show" />} />
                    <Route path="/ask/:page" element={<FeedPage feedType="ask" />} />
                    <Route path="/jobs/:page" element={<FeedPage feedType="jobs" />} />
                    <Route path="/item/:id" element={<ItemDetailsPage />} />
                    <Route path="/user/:id" element={<UserPage />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <GATracker />
                <AppShell />
            </SettingsProvider>
        </BrowserRouter>
    );
}

export default App;
