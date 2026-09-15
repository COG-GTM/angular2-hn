import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Feed } from './pages/Feed';
import { Footer, Header, Loader } from './components';
import { useSettings } from './context/SettingsContext';

const ItemDetails = lazy(() => import('./pages/ItemDetails').then((module) => ({ default: module.ItemDetails })));
const User = lazy(() => import('./pages/User').then((module) => ({ default: module.User })));

function usePageView() {
    const location = useLocation();

    useEffect(() => {
        if (typeof window.ga === 'function') {
            window.ga('set', 'page', location.pathname + location.search);
            window.ga('send', 'pageview');
        }
    }, [location]);
}

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

export function App() {
    const { settings } = useSettings();
    usePageView();

    return (
        <div className={settings.theme}>
            <div className="body-cover">
                <div className="wrapper">
                    <Header />
                    <main>
                        <Suspense fallback={<Loader />}>
                            <Routes>
                                <Route path="/" element={<Navigate to="/news/1" replace />} />
                                {feedTypes.map((type) => (
                                    <Route key={type} path={`/${type}/:page`} element={<Feed feedType={type} />} />
                                ))}
                                {feedTypes.map((type) => (
                                    <Route
                                        key={`${type}-redirect`}
                                        path={`/${type}`}
                                        element={<Navigate to={`/${type}/1`} replace />}
                                    />
                                ))}
                                <Route path="/item/:id" element={<ItemDetails />} />
                                <Route path="/user/:id" element={<User />} />
                            </Routes>
                        </Suspense>
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
}
