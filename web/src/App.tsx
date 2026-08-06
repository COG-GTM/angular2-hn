import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useSettings } from './context/SettingsContext';
import { Footer } from './core/Footer';
import { Header } from './core/Header';
import './App.scss';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export function App() {
    const { settings } = useSettings();
    const { pathname } = useLocation();

    useEffect(() => {
        if (typeof window.ga !== 'function') {
            return;
        }

        window.ga('set', 'page', pathname);
        window.ga('send', 'pageview');
    }, [pathname]);

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

export default App;
