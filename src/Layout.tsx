import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import { useSettings } from './context/SettingsContext';
import { trackPageview } from './utils/analytics';
import './Layout.scss';

export default function Layout() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        trackPageview(`${location.pathname}${location.search}`);
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
