import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';

declare function ga(...args: unknown[]): void;

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (typeof ga === 'function') {
            ga('set', 'page', location.pathname);
            ga('send', 'pageview');
        }
    }, [location.pathname]);

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
