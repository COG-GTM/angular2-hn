import { Navigate, Route, Routes } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Feed } from './components/Feed';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ItemDetails } from './components/ItemDetails';
import { User } from './components/User';
import './App.scss';

export function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news" element={<Navigate to="/news/1" replace />} />
                    <Route path="/newest" element={<Navigate to="/newest/1" replace />} />
                    <Route path="/show" element={<Navigate to="/show/1" replace />} />
                    <Route path="/ask" element={<Navigate to="/ask/1" replace />} />
                    <Route path="/jobs" element={<Navigate to="/jobs/1" replace />} />
                    <Route path="/news/:page" element={<Feed feedType="news" />} />
                    <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                    <Route path="/show/:page" element={<Feed feedType="show" />} />
                    <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                    <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<User />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}
