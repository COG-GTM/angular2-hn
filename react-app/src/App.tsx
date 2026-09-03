import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import './App.scss';
import { Footer } from './components/core/Footer';
import { Header } from './components/core/Header';
import { Feed } from './components/feeds/Feed';
import { Loader } from './components/shared/Loader';
import { SettingsProvider, useSettings } from './context/SettingsContext';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const UserProfile = lazy(() => import('./components/user/UserProfile'));

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

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
                        {FEED_TYPES.map(feedType => (
                            <Route
                                key={feedType}
                                path={`/${feedType}/:page`}
                                element={<Feed feedType={feedType} />}
                            />
                        ))}
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<UserProfile />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <AppShell />
            </SettingsProvider>
        </BrowserRouter>
    );
}
