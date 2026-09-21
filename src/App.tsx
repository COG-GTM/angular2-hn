import { Navigate, Route, Routes } from 'react-router-dom';

import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ItemDetails } from './components/ItemDetails';
import { User } from './components/User';
import { useSettings } from './context/useSettings';
import { usePageViews } from './hooks/usePageViews';
import './App.scss';

export function App() {
    const { settings } = useSettings();
    usePageViews();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<User />} />
                    <Route path="/:feedType/:page" element={<div className="main-content" />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}
