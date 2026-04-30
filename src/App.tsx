import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Loader from './components/Loader/Loader';
import Feed from './pages/Feed/Feed';
import './App.scss';

const ItemDetails = React.lazy(() => import('./pages/ItemDetails/ItemDetails'));
const UserPage = React.lazy(() => import('./pages/User/User'));

declare function ga(...args: string[]): void;

function GATracker() {
    const location = useLocation();
    useEffect(() => {
        if (typeof ga !== 'undefined') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);
    return null;
}

function AppLayout() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <GATracker />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/:feedType/:page" element={<Feed />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<UserPage />} />
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
                <AppLayout />
            </SettingsProvider>
        </BrowserRouter>
    );
}
