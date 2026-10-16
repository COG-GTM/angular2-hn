import { Outlet } from 'react-router';

import { Footer } from '../core/Footer';
import { Header } from '../core/Header';
import { useSettings } from '../shared/hooks';
import './AppLayout.scss';

// Port of AppComponent's template. Owned by the app shell + theming workstream.
export function AppLayout() {
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
