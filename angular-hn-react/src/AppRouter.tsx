import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/core/Header/Header';
import { Footer } from './components/core/Footer/Footer';
import { Settings } from './components/core/Settings/Settings';
import { Feed } from './components/feeds/Feed/Feed';

const ItemDetails = lazy(() =>
    import('./components/item-details/ItemDetails/ItemDetails').then((module) => ({
        default: module.ItemDetails,
    }))
);

const User = lazy(() =>
    import('./components/user/User/User').then((module) => ({
        default: module.User,
    }))
);

const Loader = () => <div className="loader">Loading...</div>;

export const AppRouter: React.FC = () => (
    <>
        <Header />
        <Settings />
        <main>
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<Feed />} />
                    <Route path="/newest/:page" element={<Feed />} />
                    <Route path="/show/:page" element={<Feed />} />
                    <Route path="/ask/:page" element={<Feed />} />
                    <Route path="/jobs/:page" element={<Feed />} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<User />} />
                </Routes>
            </Suspense>
        </main>
        <Footer />
    </>
);
