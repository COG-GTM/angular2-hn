import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { useSettings } from './hooks/useSettings';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './App.scss';

declare function ga(...args: unknown[]): void;

function AppInner() {
    const { settings } = useSettings();
    const location = useLocation();

    useEffect(() => {
        if (typeof ga !== 'undefined') {
            ga('set', 'page', location.pathname);
            ga('send', 'pageview');
        }
    }, [location]);

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

export default function App() {
    return (
        <SettingsProvider>
            <AppInner />
        </SettingsProvider>
    );
}
