import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Feed from './pages/Feed';
import ItemDetails from './pages/ItemDetails';
import User from './pages/User';

import './App.scss';

export const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

/** Angular listed one route per feed; here a single param route rejects unknown feeds. */
function FeedRoute() {
    const { feedType } = useParams<{ feedType: string }>();

    if (!feedType || !FEED_TYPES.includes(feedType)) {
        return <Navigate to="/news/1" replace />;
    }

    return <Feed />;
}

export function Shell() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<User />} />
                    <Route path="/:feedType/:page" element={<FeedRoute />} />
                    <Route path="*" element={<Navigate to="/news/1" replace />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <Shell />
            </BrowserRouter>
        </SettingsProvider>
    );
}
