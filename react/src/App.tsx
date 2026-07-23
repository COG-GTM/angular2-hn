import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Feed from './pages/Feed';
import { useSettings } from './context/SettingsContext';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const User = lazy(() => import('./pages/User'));

declare const ga: (...args: unknown[]) => void;

function usePageViewTracking() {
    const location = useLocation();

    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname + location.search);
            ga('send', 'pageview');
        }
    }, [location]);
}

function App() {
    const { settings } = useSettings();
    usePageViewTracking();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<User />} />
                        <Route path="/:feedType/:page" element={<Feed />} />
                        <Route path="/:feedType" element={<Feed />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export default App;
