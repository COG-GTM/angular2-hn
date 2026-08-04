import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Footer from './components/core/Footer';
import Header from './components/core/Header';
import Feed from './components/feeds/Feed';
import Loader from './components/shared/Loader';
import { useSettings } from './context/SettingsContext';
import './App.scss';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const UserProfile = lazy(() => import('./components/user/UserProfile'));

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    const url = `${location.pathname}${location.search}${location.hash}`;

    useEffect(() => {
        if (typeof window.ga === 'function') {
            window.ga('set', 'page', url);
            window.ga('send', 'pageview');
        }
    }, [url]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        {FEED_TYPES.map((feedType) => (
                            <Route key={feedType} path={`/${feedType}`}>
                                <Route index element={<Navigate to={`/${feedType}/1`} replace />} />
                                <Route path=":page" element={<Feed feedType={feedType} />} />
                            </Route>
                        ))}
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<UserProfile />} />
                        <Route path="*" element={<Navigate to="/news/1" replace />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
