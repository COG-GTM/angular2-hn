import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Header } from './core/header/Header';
import { Footer } from './core/footer/Footer';
import { Feed } from './feeds/Feed';
import { ItemDetails } from './item-details/ItemDetails';
import { User } from './user/User';
import { useSettings } from './services/settings-context';
import './App.scss';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export const App = () => {
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
                <Footer />
            </div>
        </div>
    );
};
