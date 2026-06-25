import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSettings } from './shared/contexts/SettingsContext';
import { Header } from './core/header/Header';
import { Footer } from './core/footer/Footer';
import { Feed } from './feeds/feed/Feed';
import { Loader } from './shared/components/loader/Loader';
import './app.scss';

const ItemDetails = lazy(() => import('./item-details/ItemDetailsPage'));
const UserProfile = lazy(() => import('./user/UserPage'));

declare function ga(...args: unknown[]): void;

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname);
            ga('send', 'pageview');
        }
    }, [location.pathname]);

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
                        <Route path="/user/:id" element={<UserProfile />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
