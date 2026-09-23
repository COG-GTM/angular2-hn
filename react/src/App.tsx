import { Navigate, Route, Routes } from 'react-router-dom';

import { ItemDetails } from './components/item-details/ItemDetails';
import { NotPorted } from './components/NotPorted';
import { useSettings } from './settings/SettingsContext';

const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <NotPorted name="header" />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    {FEEDS.map((feed) => (
                        <Route key={feed} path={`/${feed}`}>
                            <Route index element={<Navigate to={`/${feed}/1`} replace />} />
                            <Route path=":page" element={<NotPorted name={`feed:${feed}`} />} />
                        </Route>
                    ))}
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<NotPorted name="user" />} />
                </Routes>
                <NotPorted name="footer" />
            </div>
        </div>
    );
}
