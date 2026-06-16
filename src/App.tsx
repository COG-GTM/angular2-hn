import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Loader from './components/Loader/Loader';
import Feed from './pages/Feed/Feed';
import styles from './App.module.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails/ItemDetails'));
const UserProfile = lazy(() => import('./pages/UserProfile/UserProfile'));

declare function ga(...args: unknown[]): void;

function AppContent() {
    const settings = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);

    return (
        <div className={settings.theme}>
            <div className={`body-cover ${styles.bodyCover}`}></div>
            <div className={`wrapper ${styles.wrapper}`}>
                <Header />
                <Routes>
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
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

export default function App() {
    return <AppContent />;
}
