import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Header from './components/core/Header';
import Footer from './components/core/Footer';
import Feed from './components/feeds/Feed';
import Loader from './components/shared/Loader';
import './App.scss';

const ItemDetails = lazy(() => import('./components/item-details/ItemDetails'));
const UserProfile = lazy(() => import('./components/user/UserProfile'));

function AppLayout() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Outlet />
                <Footer />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/news/:page?" element={<Feed feedType="news" />} />
                        <Route path="/newest/:page?" element={<Feed feedType="newest" />} />
                        <Route path="/show/:page?" element={<Feed feedType="show" />} />
                        <Route path="/ask/:page?" element={<Feed feedType="ask" />} />
                        <Route path="/jobs/:page?" element={<Feed feedType="jobs" />} />
                        <Route
                            path="/item/:id"
                            element={
                                <Suspense fallback={<Loader />}>
                                    <ItemDetails />
                                </Suspense>
                            }
                        />
                        <Route
                            path="/user/:id"
                            element={
                                <Suspense fallback={<Loader />}>
                                    <UserProfile />
                                </Suspense>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </SettingsProvider>
    );
}
