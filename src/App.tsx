import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSettings } from './app/shared/services/settings.service';
import { Header } from './app/core/header/Header';
import { Footer } from './app/core/footer/Footer';
import { Feed } from './app/feeds/feed/Feed';
import { ItemDetails } from './app/item-details/ItemDetails';
import { UserProfile } from './app/user/UserProfile';
import './App.scss';

declare function ga(...args: unknown[]): void;

function AppContent() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname);
            ga('send', 'pageview');
        }
    }, [location]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<Feed feedType="news" />} />
                    <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                    <Route path="/show/:page" element={<Feed feedType="show" />} />
                    <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                    <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<UserProfile />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

export default AppContent;
