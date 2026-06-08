import { Routes, Route, Navigate } from 'react-router-dom';
import { useSettings } from './contexts/SettingsContext';
import './App.scss';

function Placeholder({ label }: { label: string }) {
    return <div style={{ padding: 40 }}>{label} — component coming in Phase 2/3</div>;
}

export default function App() {
    const { theme } = useSettings();

    return (
        <div className={theme}>
            <div className="body-cover" />
            <div className="wrapper">
                {/* Header component will be added in Phase 2 */}
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<Placeholder label="Feed (news)" />} />
                    <Route path="/newest/:page" element={<Placeholder label="Feed (newest)" />} />
                    <Route path="/show/:page" element={<Placeholder label="Feed (show)" />} />
                    <Route path="/ask/:page" element={<Placeholder label="Feed (ask)" />} />
                    <Route path="/jobs/:page" element={<Placeholder label="Feed (jobs)" />} />
                    <Route path="/item/:id" element={<Placeholder label="Item Details" />} />
                    <Route path="/user/:id" element={<Placeholder label="User Profile" />} />
                </Routes>
                {/* Footer component will be added in Phase 2 */}
            </div>
        </div>
    );
}
