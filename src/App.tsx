import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSettings } from './contexts/SettingsContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Feed from './pages/Feed/Feed';
import Loader from './components/Loader/Loader';
import './App.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails/ItemDetails'));
const UserPage = lazy(() => import('./pages/User/User'));

export default function App() {
    const { theme } = useSettings();

    return (
        <div className={theme}>
            <div className="body-cover" />
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
                        <Route path="/user/:id" element={<UserPage />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
