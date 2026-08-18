import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './components/core/Footer';
import Header from './components/core/Header';
import { useSettings } from './context/SettingsContext';
import AppRoutes from './routes';
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
