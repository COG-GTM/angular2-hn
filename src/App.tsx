import { Navigate, Route, Routes } from 'react-router-dom';

import Footer from './components/core/Footer';
import Header from './components/core/Header';
import Feed from './components/feeds/Feed';
import { useSettings } from './context/SettingsContext';
import './App.scss';

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

export default function App() {
    const { settings } = useSettings();

    return (
        <div className={`c-app ${settings.theme}`}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    {feedTypes.map((feedType) => (
                        <Route
                            key={feedType}
                            path={`/${feedType}/:page`}
                            element={<Feed feedType={feedType} />}
                        />
                    ))}
                </Routes>
                <Footer />
            </div>
        </div>
    );
}
