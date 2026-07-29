import { Outlet } from 'react-router-dom';
import Header from './core/header/Header';
import Footer from './core/footer/Footer';
import SettingsPanel from './core/settings/SettingsPanel';
import { useSettings } from './shared/context';
import './App.scss';

export default function App() {
    const { settings } = useSettings();

    return (
        <div className={settings.theme}>
            <div className="body-cover"></div>
            <div className="wrapper">
                <Header />
                {settings.showSettings && <SettingsPanel />}
                <Outlet />
                <Footer />
            </div>
        </div>
    );
}
