import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Footer from './components/core/Footer';
import Header from './components/core/Header';
import Loader from './components/shared/Loader';
import Feed from './components/feeds/Feed';
import { useSettings } from './context/SettingsContext';
import './App.module.scss';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const UserProfile = lazy(() => import('./components/user/UserProfile'));

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export default function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        {FEED_TYPES.map((feedType) => (
                            <Route key={feedType} path={feedType}>
                                <Route index element={<Navigate to="1" replace />} />
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
