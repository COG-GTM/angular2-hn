import { Outlet } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { Header } from './core/Header';
import { Footer } from './core/Footer';
import './App.scss';

export function App() {
    const { theme } = useSettings();
    return (
        <div className={theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                <Outlet />
                <Footer />
            </div>
        </div>
    );
}
