import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider, useSettings } from './services/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Feed from './components/Feed';
import ItemDetailsPage from './components/ItemDetailsPage';
import UserPage from './components/UserPage';
import './styles/global.scss';
import './styles/App.scss';

function AppContent() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<Feed feedType="news" />} />
                    <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                    <Route path="/show/:page" element={<Feed feedType="show" />} />
                    <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                    <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                    <Route path="/item/:id" element={<ItemDetailsPage />} />
                    <Route path="/user/:id" element={<UserPage />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <AppContent />
            </SettingsProvider>
        </BrowserRouter>
    );
}
