import { Navigate, Route, Routes } from 'react-router-dom';

import { useSettings } from './shared/settings/SettingsContext';
import Footer from './core/footer/Footer';
import Header from './core/header/Header';
import Feed from './feeds/feed/Feed';
import type { FeedName } from './shared/models';
import './App.scss';

const feedNames: FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="" element={<Navigate to="/news/1" replace />} />
                    {feedNames.map((feedName) => (
                        <Route
                            key={feedName}
                            path={`${feedName}/:page`}
                            element={<Feed key={feedName} feedType={feedName} />}
                        />
                    ))}
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

export default App;
