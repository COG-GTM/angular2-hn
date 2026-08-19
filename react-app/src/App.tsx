import { Navigate, Route, Routes } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import { useSettings } from './context/settings-context';
import Feed from './features/feed/Feed';
import ItemDetails from './features/item-details/ItemDetails';
import User from './features/user/User';

const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

export default function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    {feedTypes.map(feedType => (
                        <Route
                            key={feedType}
                            path={`/${feedType}/:page`}
                            element={<Feed key={feedType} feedType={feedType} />}
                        />
                    ))}
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<User />} />
                </Routes>
                <Footer />
            </div>
        </div>
    );
}
