import { Outlet } from 'react-router';
import Footer from './core/Footer';
import Header from './core/Header';
import { useSettings } from './settings/useSettings';
import './styles/App.scss';

export default function App() {
    const { settings } = useSettings();
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
