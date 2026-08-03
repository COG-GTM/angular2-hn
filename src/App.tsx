import { BrowserRouter } from 'react-router-dom';

import AppRoutes from './AppRoutes';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import { SettingsProvider } from './context/SettingsContext';
import { useSettings } from './context/settingsContext';
import { usePageViews } from './hooks/usePageViews';

import './App.scss';

function AppShell() {
    const { settings } = useSettings();

    usePageViews();

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

export default function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <AppShell />
            </BrowserRouter>
        </SettingsProvider>
    );
}
