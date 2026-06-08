import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { usePageTracking } from './hooks/usePageTracking';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Feed } from './components/feed/Feed';
import { Loader } from './components/shared/Loader';
import './App.scss';

const LazyItemDetails = lazy(() =>
    import('./components/item-details/ItemDetails').then((m) => ({ default: m.ItemDetails }))
);
const LazyUser = lazy(() =>
    import('./components/user/User').then((m) => ({ default: m.UserProfile }))
);

function Layout() {
    const settings = useSettings();
    usePageTracking();

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
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<Feed feedType="news" />} />
                    <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                    <Route path="/show/:page" element={<Feed feedType="show" />} />
                    <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                    <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                    <Route
                        path="/item/:id"
                        element={
                            <Suspense fallback={<Loader />}>
                                <LazyItemDetails />
                            </Suspense>
                        }
                    />
                    <Route
                        path="/user/:id"
                        element={
                            <Suspense fallback={<Loader />}>
                                <LazyUser />
                            </Suspense>
                        }
                    />
                </Route>
            </Routes>
        </SettingsProvider>
    );
}
