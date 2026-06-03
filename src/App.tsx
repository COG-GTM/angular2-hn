import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Header } from './layout/Header';
import { Footer } from './layout/Footer';
import { AppRoutes } from './router';
import { useSettings } from './context/SettingsContext';

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (typeof window.ga === 'function') {
            window.ga('set', 'page', location.pathname + location.search);
            window.ga('send', 'pageview');
        }
    }, [location]);

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <AppRoutes />
                <Footer />
            </div>
        </div>
    );
}
