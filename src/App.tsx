import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Feed from './components/Feed/Feed';
import { useSettings } from './context/SettingsContext';
import { trackPageView } from './utils/analytics';
import './App.scss';

function Placeholder() { return <main />; }

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();
    useEffect(() => { trackPageView(location.pathname + location.search); }, [location]);
    return <div className={settings.theme}><div className="body-cover"></div><div className="wrapper"><Header /><Routes>
        <Route path="/" element={<Navigate to="/news/1" replace />} />
        <Route path="/news/:page" element={<Feed feedType="news" />} />
        <Route path="/newest/:page" element={<Feed feedType="newest" />} />
        <Route path="/show/:page" element={<Feed feedType="show" />} />
        <Route path="/ask/:page" element={<Feed feedType="ask" />} />
        <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
        <Route path="/item/:id" element={<Placeholder />} />
        <Route path="/user/:id" element={<Placeholder />} />
    </Routes><Footer /></div></div>;
}
