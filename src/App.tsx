import { Navigate, Route, Routes } from 'react-router-dom';

import { Feed } from './components/Feed';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
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
                    <Route path="/:feedType/:page" element={<Feed />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}
