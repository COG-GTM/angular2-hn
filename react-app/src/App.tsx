import { Navigate, Route, Routes } from 'react-router-dom';
import Feed from './feeds/Feed/Feed';
import { useSettings } from './shared/services/settingsContext';

export default function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/:feedType" element={<Feed />} />
                    <Route path="/:feedType/:page" element={<Feed />} />
                </Routes>
            </div>
        </div>
    );
}
