import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Footer } from './core/Footer/Footer';
import { Header } from './core/Header/Header';
import { Feed } from './feeds/Feed/Feed';
import { Loader } from './shared/components/Loader/Loader';
import { useAnalyticsPageviews } from './shared/analytics/useAnalyticsPageviews';
import { useSettings } from './shared/settings/useSettings';
import './App.scss';

const ItemDetails = lazy(() => import('./item-details/ItemDetails').then((m) => ({ default: m.ItemDetails })));
const UserProfile = lazy(() => import('./user/UserProfile').then((m) => ({ default: m.UserProfile })));

export default function App() {
    const { settings } = useSettings();

    useAnalyticsPageviews();

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
                        <Route path="*" element={<Navigate to="/news/1" replace />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
