import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { SettingsProvider, useSettings } from './context/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import FeedPage from './pages/FeedPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import UserPage from './pages/UserPage';
import './App.scss';

// Mirrors AppComponent's Google Analytics pageview tracking: on each completed
// navigation, `ga('set', 'page', url)` + `ga('send', 'pageview')`.
declare global {
    // eslint-disable-next-line no-var
    var ga: ((...args: unknown[]) => void) | undefined;
}

function usePageViews() {
    const location = useLocation();
    useEffect(() => {
        if (typeof window.ga !== 'undefined') {
            const url = location.pathname + location.search;
            window.ga('set', 'page', url);
            window.ga('send', 'pageview');
        }
    }, [location.pathname, location.search]);
}

// Reproduces app.component.html layout order: theme wrapper > body-cover >
// wrapper > header + routed view + footer.
function AppShell() {
    const { settings } = useSettings();
    usePageViews();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<FeedPage />} />
                    <Route path="/newest/:page" element={<FeedPage />} />
                    <Route path="/show/:page" element={<FeedPage />} />
                    <Route path="/ask/:page" element={<FeedPage />} />
                    <Route path="/jobs/:page" element={<FeedPage />} />
                    <Route path="/item/:id" element={<ItemDetailsPage />} />
                    <Route path="/user/:id" element={<UserPage />} />
                    <Route path="*" element={<Navigate to="/news/1" replace />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <AppShell />
            </BrowserRouter>
        </SettingsProvider>
    );
}
