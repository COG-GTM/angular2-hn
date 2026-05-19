import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Feed } from './pages/Feed/Feed';
import './App.scss';

function Layout() {
    const { settings } = useSettings();
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

function Placeholder({ label }: { label: string }) {
    return <div style={{ padding: '2rem' }}>{label} — component coming in a follow-up PR</div>;
}

export function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/news/1" replace />} />
                <Route path="/news/:page" element={<Feed feedType="news" />} />
                <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                <Route path="/show/:page" element={<Feed feedType="show" />} />
                <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                <Route path="/item/:id" element={<Placeholder label="Item Details" />} />
                <Route path="/user/:id" element={<Placeholder label="User Profile" />} />
            </Route>
        </Routes>
    );
}
