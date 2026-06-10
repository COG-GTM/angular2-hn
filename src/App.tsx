import { Outlet } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import { useSettings } from './context/SettingsContext';

export default function App() {
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
