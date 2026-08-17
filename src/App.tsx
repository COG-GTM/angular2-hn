import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useSettings } from './context/settingsContext';
import { sendPageView } from './analytics';
import { Header } from './core/Header';
import { Footer } from './core/Footer';

export function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        sendPageView(location.pathname + location.search);
    }, [location.pathname, location.search]);

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
