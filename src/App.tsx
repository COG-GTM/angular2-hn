import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Footer } from './core/Footer';
import { Header } from './core/Header';
import { useSettings } from './shared/settings/settings-context';
import './App.scss';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        const page = `${location.pathname}${location.search}${location.hash}`;
        window.ga?.('set', 'page', page);
        window.ga?.('send', 'pageview');
    }, [location.pathname, location.search, location.hash]);

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
