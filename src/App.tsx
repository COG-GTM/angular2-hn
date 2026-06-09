import { Outlet } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { usePageTracking } from './hooks/usePageTracking';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.scss';

export default function App() {
    const { settings } = useSettings();
    usePageTracking();

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
