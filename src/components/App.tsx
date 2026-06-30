import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import Header from './Header';
import Footer from './Footer';
import './App.scss';

declare global {
    interface Window {
        ga?: (...args: unknown[]) => void;
    }
}

export default function App() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (typeof window.ga === 'function') {
            window.ga('set', 'page', location.pathname);
            window.ga('send', 'pageview');
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
