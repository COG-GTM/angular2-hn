import { Outlet } from 'react-router-dom';

import { useSettings } from '../context/useSettings';
import Footer from './Footer';
import Header from './Header';
import './Layout.scss';

export default function Layout() {
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
