import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import Loader from './components/Loader';
import { useSettings } from './context/SettingsContext';
import Feed from './pages/Feed';
import './App.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const User = lazy(() => import('./pages/User'));

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

export default function App() {
    const { settings } = useSettings();

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
