import { Outlet } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';
import { usePageViews } from './hooks/usePageViews';
import Footer from './components/Footer';
import Header from './components/Header';
import './App.scss';

export default function App() {
    const { settings } = useSettings();

    usePageViews();

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
