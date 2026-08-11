import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import Loader from './components/Loader';
import { useSettings } from './context/SettingsContext';
import Feed from './pages/Feed';
import './App.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const User = lazy(() => import('./pages/User'));

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

declare const ga: ((...args: unknown[]) => void) | undefined;

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (typeof ga !== 'undefined') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        {feedTypes.map((feedType) => (
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
