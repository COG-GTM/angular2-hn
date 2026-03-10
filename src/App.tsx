import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSettings } from './contexts/useSettings';
import Header from './components/Header';
import Footer from './components/Footer';
import Feed from './pages/Feed';
import ItemDetails from './pages/ItemDetails';
import UserPage from './pages/User';
import './styles/App.scss';

declare function ga(...args: unknown[]): void;

function AppLayout() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (typeof ga !== 'undefined') {
            ga('set', 'page', location.pathname);
            ga('send', 'pageview');
        }
    }, [location]);

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
        <Routes>
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            <Route element={<AppLayout />}>
                <Route path="/:feedType/:page" element={<Feed />} />
                <Route path="/item/:id" element={<ItemDetails />} />
                <Route path="/user/:id" element={<UserPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/news/1" replace />} />
        </Routes>
    );
}
