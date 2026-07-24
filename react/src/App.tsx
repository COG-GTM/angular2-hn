import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Feed from './pages/Feed';
import { useSettings } from './context/useSettings';
import './App.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const User = lazy(() => import('./pages/User'));

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (window.ga) {
            window.ga('set', 'page', location.pathname + location.search);
            window.ga('send', 'pageview');
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
                        <Route path="/news" element={<Navigate to="/news/1" replace />} />
                        <Route path="/newest" element={<Navigate to="/newest/1" replace />} />
                        <Route path="/show" element={<Navigate to="/show/1" replace />} />
                        <Route path="/ask" element={<Navigate to="/ask/1" replace />} />
                        <Route path="/jobs" element={<Navigate to="/jobs/1" replace />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<User />} />
                        <Route path="/:feedType/:page" element={<Feed />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export default App;
