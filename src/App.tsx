import { Outlet } from 'react-router-dom';

import { Footer } from './components/Footer/Footer';
import { Header } from './components/Header/Header';
import { useSettings } from './context/settingsContext';

import './App.scss';

export function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover" />
            <div className="wrapper">
                <Header />
                <Outlet />
                <Footer />
            </div>
        </div>
    );
}
