import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
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
                <Route path="/news/:page" element={<Placeholder label="Feed" />} />
                <Route path="/newest/:page" element={<Placeholder label="Feed" />} />
                <Route path="/show/:page" element={<Placeholder label="Feed" />} />
                <Route path="/ask/:page" element={<Placeholder label="Feed" />} />
                <Route path="/jobs/:page" element={<Placeholder label="Feed" />} />
                <Route path="/item/:id" element={<Placeholder label="Item Details" />} />
                <Route path="/user/:id" element={<Placeholder label="User Profile" />} />
            </Route>
        </Routes>
    );
}
