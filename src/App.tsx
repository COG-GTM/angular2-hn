import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { Loader } from './components/Loader/Loader';
import { useSettings } from './context/settingsContext';
import { FEED_TYPES } from './models';
import { Feed } from './pages/Feed/Feed';
import './App.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails/ItemDetails'));
const User = lazy(() => import('./pages/User/User'));

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

function usePageViews() {
    const location = useLocation();

    useEffect(() => {
        if (typeof window.ga === 'function') {
            window.ga('set', 'page', location.pathname + location.search);
            window.ga('send', 'pageview');
        }
    }, [location]);
}

export function App() {
    const { settings } = useSettings();
    usePageViews();

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
                        <Route path="/user/:id" element={<User />} />
                        <Route path="*" element={<Navigate to="/news/1" replace />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
