import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Feed } from './components/Feed/Feed';
import { Loader } from './components/Loader/Loader';
import './App.scss';

const ItemDetails = lazy(() => import('./components/ItemDetails/ItemDetailsLazy'));
const UserProfile = lazy(() => import('./components/UserProfile/UserProfileLazy'));

declare function ga(...args: unknown[]): void;

function AppLayout() {
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
                    <Outlet />
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/news/1" replace />} />
                <Route path="/news/:page" element={<Feed feedType="news" />} />
                <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                <Route path="/show/:page" element={<Feed feedType="show" />} />
                <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                <Route path="/item/:id" element={<ItemDetails />} />
                <Route path="/user/:id" element={<UserProfile />} />
            </Route>
        </Routes>
    );
}
