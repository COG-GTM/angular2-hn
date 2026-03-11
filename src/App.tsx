import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Feed from './components/Feed/Feed';
import Loader from './components/Loader/Loader';

const ItemDetails = lazy(() => import('./components/ItemDetails/ItemDetails'));
const UserProfile = lazy(() => import('./components/UserProfile/UserProfile'));

declare let ga: (command: string, ...args: string[]) => void;

function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <AppShell />
            </BrowserRouter>
        </SettingsProvider>
    );
}

function AppShell() {
    const { settings } = useSettings();
    const location = useLocation();

    // Google Analytics page tracking
    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname);
            ga('send', 'pageview');
        }
    }, [location]);

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/news/:page" element={<Feed feedType="news" />} />
                        <Route path="/newest/:page" element={<Feed feedType="newest" />} />
                        <Route path="/show/:page" element={<Feed feedType="show" />} />
                        <Route path="/ask/:page" element={<Feed feedType="ask" />} />
                        <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<UserProfile />} />
                    </Routes>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}

export default App;
