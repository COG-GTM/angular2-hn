import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Header } from './components/core/Header';
import { Footer } from './components/core/Footer';
import { Feed } from './components/feeds/Feed';
import { ItemDetails } from './components/item-details/ItemDetails';
import { UserProfile } from './components/user/UserProfile';
import './styles/global.scss';

function AppLayout() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/:feedType/:page" element={<Feed />} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<UserProfile />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <SettingsProvider>
                <AppLayout />
            </SettingsProvider>
        </BrowserRouter>
    );
}

export default App;
