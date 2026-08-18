import { Navigate, Route, Routes } from 'react-router-dom';

import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Feed from './pages/Feed/Feed';
import ItemDetails from './pages/ItemDetails/ItemDetails';
import User from './pages/User/User';
import { useSettings } from './context/SettingsContext';
import './App.scss';

const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'];

export default function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    {FEED_TYPES.map((feedType) => (
                        <Route key={feedType} path={`/${feedType}`}>
                            <Route index element={<Navigate to={`/${feedType}/1`} replace />} />
                            <Route path=":page" element={<Feed feedType={feedType} />} />
                        </Route>
                    ))}
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<User />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}
