import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Feed } from './components/Feed/Feed';
import { Loader } from './components/Loader/Loader';
import './App.scss';

const ItemDetails = lazy(() => import('./components/ItemDetails/ItemDetails'));
const User = lazy(() => import('./components/User/User'));

function usePageViews() {
    const location = useLocation();
    useEffect(() => {
        if (typeof window.ga === 'function') {
            window.ga('set', 'page', location.pathname);
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
                        <Route path="/:feedType/:page" element={<Feed />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<User />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export default App;
