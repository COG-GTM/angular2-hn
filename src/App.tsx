import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Loader from './components/Loader/Loader';
import Feed from './components/Feed/Feed';
import { useSettings } from './context/SettingsContext';
import { trackPageView } from './utils/analytics';
import './App.scss';

const ItemDetails = lazy(() => import('./components/ItemDetails/ItemDetails'));
const User = lazy(() => import('./components/User/User'));

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        trackPageView(location.pathname + location.search);
    }, [location]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/news/:page" element={<Feed feedType="news" />} />
                        <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                        <Route path="/show/:page" element={<Feed feedType="show" />} />
                        <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                        <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<User />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
